import { Command } from "commander";
import dotenv from "dotenv";
import { getProjectRootPath } from "../../utils/utilities";
import path from "path";
import { runLlmJudgeEvaluation as runRouterEvaluation } from "./subagents/router/eval/langsmith/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runRouterLangfuseEvaluation } from "./subagents/router/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runOutputSanitizerEvaluation } from "./subagents/output_sanitizer/eval/langsmith/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runOutputSanitizerLangfuseEvaluation } from "./subagents/output_sanitizer/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runTripSpecialistEvaluation } from "./subagents/trip_agent/eval/langsmith/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runTripSpecialistLangfuseEvaluation } from "./subagents/trip_agent/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runFinanceSpecialistEvaluation } from "./subagents/finance_agent/eval/langsmith/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runFinanceSpecialistLangfuseEvaluation } from "./subagents/finance_agent/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runGeneralSpecialistEvaluation } from "./subagents/general_agent/eval/langsmith/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runGeneralSpecialistLangfuseEvaluation } from "./subagents/general_agent/eval/langfuse/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runE2EEvaluation } from "./eval/langsmith/end_to_end/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runE2ELangfuseEvaluation } from "./eval/langfuse/end_to_end/llm_judge/runEvaluation";
import { createAndAddExamples as createRouterDataset } from "./eval/langsmith/datasets/routerDataset";
import { createAndAddExamples as createRouterLangfuseDataset } from "./eval/langfuse/datasets/routerDataset";
import { createAndAddExamples as createOutputSanitizerDataset } from "./eval/langsmith/datasets/outputSanitizerDataset";
import { createAndAddExamples as createOutputSanitizerLangfuseDataset } from "./eval/langfuse/datasets/outputSanitizerDataset";
import { createAndAddExamples as createTripSpecialistDataset } from "./eval/langsmith/datasets/tripSpecialistDataset";
import { createAndAddExamples as createTripSpecialistLangfuseDataset } from "./eval/langfuse/datasets/tripSpecialistDataset";
import { createAndAddExamples as createFinanceSpecialistDataset } from "./eval/langsmith/datasets/financeSpecialistDataset";
import { createAndAddExamples as createFinanceSpecialistLangfuseDataset } from "./eval/langfuse/datasets/financeSpecialistDataset";
import { createAndAddExamples as createGeneralSpecialistDataset } from "./eval/langsmith/datasets/generalSpecialistDataset";
import { createAndAddExamples as createGeneralSpecialistLangfuseDataset } from "./eval/langfuse/datasets/generalSpecialistDataset";
import { createAndAddExamples as createE2EDataset } from "./eval/langsmith/datasets/endToEndDataset";
import { createAndAddExamples as createE2ELangfuseDataset } from "./eval/langfuse/datasets/endToEndDataset";
import {
  LANGFUSE_OFFLINE_EVAL_SUITE_IDS,
  isLangfuseOfflineEvalSuiteId,
  runAllLangfuseOfflineEvalSuitesParallel,
  runAllLangfuseOfflineEvalSuitesSequential,
  runLangfuseOfflineEvalSuite,
} from "./eval/langfuse/runLangfuseOfflineEvalSuite";
import { RoutedAgent } from "./routedAgent";
import { GenAIConfig } from "../../utils/genai";

dotenv.config({
  path: path.resolve(getProjectRootPath(), ".env"),
  debug: true,
});

const routedAgentProgram = new Command();

routedAgentProgram
  .name("routed-agent")
  .description("CLI for the routed specialist agent (trip / finance / general)")
  .version("1.0.0");

routedAgentProgram
  .command("run")
  .description("Run the routed agent once")
  .option("-m, --model [model]", "Specialist model", "gemini-2.5-flash")
  .option("-p, --project [project]", "GCP project (Vertex)")
  .option("-l, --location [location]", "GCP location (Vertex)")
  .requiredOption("-t, --text <message>", "User message")
  .action(
    async (options: {
      model: string;
      project?: string;
      location?: string;
      text: string;
    }) => {
      const genAIConfig: GenAIConfig = {};
      if (options.project) {
        genAIConfig.project = options.project;
      }
      if (options.location) {
        genAIConfig.location = options.location;
      }

      const agent = new RoutedAgent();
      const stream = agent.processMessage(
        options.text,
        [],
        genAIConfig,
        options.model,
        undefined,
      );

      process.stdout.write("Routed agent response:\n");
      for await (const chunk of stream) {
        if (chunk && chunk.content && typeof chunk.content === "string") {
          process.stdout.write(chunk.content);
        }
      }
      process.stdout.write("\n");
    },
  );

routedAgentProgram
  .command("eval")
  .description(
    "Run all offline evaluations for the routed agent (LangSmith; use eval-langfuse for Langfuse)",
  )
  .action(async () => {
    await runRouterEvaluation();
    await runOutputSanitizerEvaluation();
    await runTripSpecialistEvaluation();
    await runFinanceSpecialistEvaluation();
    await runGeneralSpecialistEvaluation();
    await runE2EEvaluation();
  });

routedAgentProgram
  .command("eval-langfuse")
  .description(
    "Run all Langfuse offline evaluations for the routed agent (sequential by default; use --parallel for subprocess isolation)",
  )
  .option(
    "-p, --parallel",
    "Run each suite in its own Node subprocess (avoids OTEL / Langfuse singleton races)",
  )
  .action(async (options: { parallel?: boolean }) => {
    if (options.parallel) {
      await runAllLangfuseOfflineEvalSuitesParallel();
    } else {
      await runAllLangfuseOfflineEvalSuitesSequential();
    }
  });

routedAgentProgram
  .command("eval-langfuse-suite <suite>", { hidden: true })
  .description(
    "Run a single Langfuse offline eval suite (used by eval-langfuse --parallel)",
  )
  .action(async (suite: string) => {
    if (!isLangfuseOfflineEvalSuiteId(suite)) {
      console.error(
        `Unknown suite "${suite}". Expected one of: ${LANGFUSE_OFFLINE_EVAL_SUITE_IDS.join(", ")}`,
      );
      process.exitCode = 1;
      return;
    }
    await runLangfuseOfflineEvalSuite(suite);
  });

const routerLangsmith = routedAgentProgram
  .command("router")
  .description("Router (classify_route) evaluation");

const routerLlmJudge = routerLangsmith.command("langsmith");

routerLlmJudge
  .command("eval-llm-as-judge")
  .description("Evaluate routing with LLM judge + exact route match")
  .action(async () => {
    console.log("Running routed agent router evaluation...");
    await runRouterEvaluation();
  });

routerLlmJudge
  .command("create-dataset-llm-as-judge")
  .description("Create or extend the router LangSmith dataset")
  .action(async () => {
    await createRouterDataset();
  });

const routerLangfuse = routerLangsmith.command("langfuse");

routerLangfuse
  .command("eval-llm-as-judge")
  .description(
    "Evaluate routing with Langfuse experiments (LLM judge + exact route match)",
  )
  .action(async () => {
    console.log("Running routed agent router Langfuse evaluation...");
    await runRouterLangfuseEvaluation();
  });

routerLangfuse
  .command("create-dataset-llm-as-judge")
  .description("Create or upsert the router Langfuse dataset from YAML")
  .action(async () => {
    await createRouterLangfuseDataset();
  });

const outputSanitizerProgram = routedAgentProgram
  .command("output-sanitizer")
  .description("Output sanitizer (checkOutput) evaluation");

const outputSanitizerLangsmith = outputSanitizerProgram.command("langsmith");

outputSanitizerLangsmith
  .command("eval-llm-as-judge")
  .description(
    "Evaluate output sanitizer with LLM judge + accuracy metrics (routed model)",
  )
  .action(async () => {
    console.log("Running routed agent output sanitizer evaluation...");
    await runOutputSanitizerEvaluation();
  });

outputSanitizerLangsmith
  .command("create-dataset-llm-as-judge")
  .description("Create or extend the output sanitizer LangSmith dataset")
  .action(async () => {
    await createOutputSanitizerDataset();
  });

const outputSanitizerLangfuse = outputSanitizerProgram.command("langfuse");

outputSanitizerLangfuse
  .command("eval-llm-as-judge")
  .description(
    "Evaluate output sanitizer with Langfuse experiments (LLM judge + accuracy metrics)",
  )
  .action(async () => {
    console.log("Running routed agent output sanitizer Langfuse evaluation...");
    await runOutputSanitizerLangfuseEvaluation();
  });

outputSanitizerLangfuse
  .command("create-dataset-llm-as-judge")
  .description(
    "Create or upsert the output sanitizer Langfuse dataset from YAML",
  )
  .action(async () => {
    await createOutputSanitizerLangfuseDataset();
  });

const tripSpecialistProgram = routedAgentProgram
  .command("trip")
  .description("Trip specialist evaluation");

const tripSpecialistLangsmith = tripSpecialistProgram.command("langsmith");

tripSpecialistLangsmith
  .command("eval-llm-as-judge")
  .description("Evaluate trip specialist with LLM judge")
  .action(async () => {
    console.log("Running routed agent trip specialist evaluation...");
    await runTripSpecialistEvaluation();
  });

tripSpecialistLangsmith
  .command("create-dataset-llm-as-judge")
  .description("Create or extend the trip specialist LangSmith dataset")
  .action(async () => {
    await createTripSpecialistDataset();
  });

const tripSpecialistLangfuse = tripSpecialistProgram.command("langfuse");

tripSpecialistLangfuse
  .command("eval-llm-as-judge")
  .description("Evaluate trip specialist with Langfuse experiments (LLM judge)")
  .action(async () => {
    console.log("Running routed agent trip specialist Langfuse evaluation...");
    await runTripSpecialistLangfuseEvaluation();
  });

tripSpecialistLangfuse
  .command("create-dataset-llm-as-judge")
  .description(
    "Create or upsert the trip specialist Langfuse dataset from YAML",
  )
  .action(async () => {
    await createTripSpecialistLangfuseDataset();
  });

const financeSpecialistProgram = routedAgentProgram
  .command("finance")
  .description("Finance specialist evaluation");

const financeSpecialistLangsmith =
  financeSpecialistProgram.command("langsmith");

financeSpecialistLangsmith
  .command("eval-llm-as-judge")
  .description("Evaluate finance specialist with LLM judge")
  .action(async () => {
    console.log("Running routed agent finance specialist evaluation...");
    await runFinanceSpecialistEvaluation();
  });

financeSpecialistLangsmith
  .command("create-dataset-llm-as-judge")
  .description("Create or extend the finance specialist LangSmith dataset")
  .action(async () => {
    await createFinanceSpecialistDataset();
  });

const financeSpecialistLangfuse = financeSpecialistProgram.command("langfuse");

financeSpecialistLangfuse
  .command("eval-llm-as-judge")
  .description(
    "Evaluate finance specialist with Langfuse experiments (LLM judge)",
  )
  .action(async () => {
    console.log(
      "Running routed agent finance specialist Langfuse evaluation...",
    );
    await runFinanceSpecialistLangfuseEvaluation();
  });

financeSpecialistLangfuse
  .command("create-dataset-llm-as-judge")
  .description(
    "Create or upsert the finance specialist Langfuse dataset from YAML",
  )
  .action(async () => {
    await createFinanceSpecialistLangfuseDataset();
  });

const generalSpecialistProgram = routedAgentProgram
  .command("general")
  .description("General specialist evaluation");

const generalSpecialistLangsmith =
  generalSpecialistProgram.command("langsmith");

generalSpecialistLangsmith
  .command("eval-llm-as-judge")
  .description("Evaluate general specialist with LLM judge")
  .action(async () => {
    console.log("Running routed agent general specialist evaluation...");
    await runGeneralSpecialistEvaluation();
  });

generalSpecialistLangsmith
  .command("create-dataset-llm-as-judge")
  .description("Create or extend the general specialist LangSmith dataset")
  .action(async () => {
    await createGeneralSpecialistDataset();
  });

const generalSpecialistLangfuse = generalSpecialistProgram.command("langfuse");

generalSpecialistLangfuse
  .command("eval-llm-as-judge")
  .description(
    "Evaluate general specialist with Langfuse experiments (LLM judge)",
  )
  .action(async () => {
    console.log(
      "Running routed agent general specialist Langfuse evaluation...",
    );
    await runGeneralSpecialistLangfuseEvaluation();
  });

generalSpecialistLangfuse
  .command("create-dataset-llm-as-judge")
  .description(
    "Create or upsert the general specialist Langfuse dataset from YAML",
  )
  .action(async () => {
    await createGeneralSpecialistLangfuseDataset();
  });

const endToEndProgram = routedAgentProgram
  .command("end-to-end")
  .description("Full graph evaluation");

const endToEndLangsmithProgram = endToEndProgram.command("langsmith");

endToEndLangsmithProgram
  .command("eval-llm-as-judge")
  .description("Evaluate full routed agent with LLM judge + route match")
  .action(async () => {
    console.log("Running routed agent end-to-end evaluation...");
    await runE2EEvaluation();
  });

endToEndLangsmithProgram
  .command("create-dataset-llm-as-judge")
  .description("Create or extend the E2E LangSmith dataset")
  .action(async () => {
    await createE2EDataset();
  });

const endToEndLangfuseProgram = endToEndProgram.command("langfuse");

endToEndLangfuseProgram
  .command("eval-llm-as-judge")
  .description(
    "Evaluate full routed agent with Langfuse experiments (LLM judge + route match)",
  )
  .action(async () => {
    console.log("Running routed agent end-to-end Langfuse evaluation...");
    await runE2ELangfuseEvaluation();
  });

endToEndLangfuseProgram
  .command("create-dataset-llm-as-judge")
  .description("Create or upsert the E2E Langfuse dataset from YAML")
  .action(async () => {
    await createE2ELangfuseDataset();
  });

export { routedAgentProgram };
