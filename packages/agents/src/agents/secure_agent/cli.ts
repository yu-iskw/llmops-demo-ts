import { Command } from "commander";
import { SecureAgent } from "./secureAgent"; // Import DefaultAgent
import { GenAIConfig } from "../../utils/genai"; // Import GenAI utilities
import { runLlmJudgeEvaluation as runInputSanitizerEvaluation } from "./subagents/input_sanitizer/eval/langsmith/llm_judge/runEvaluation";
import dotenv from "dotenv";
import { getProjectRootPath } from "../../utils/utilities";
import path from "path";
import { runLlmJudgeEvaluation as runOutputSanitizerEvaluation } from "./subagents/output_sanitizer/eval/langsmith/llm_judge/runEvaluation";
import { runLlmJudgeEvaluation as runAnswerAgentEvaluation } from "./subagents/answer_agent/eval/langsmith/llm_judge/runEvaluation";
import { runEvaluation as runMultiTurnEvaluation } from "./subagents/answer_agent/eval/langsmith/multi_turn/runEvaluation";
import { createAndAddExamples as createInputSanitizerExamples } from "./subagents/input_sanitizer/eval/langsmith/llm_judge/dataset";
import { createAndAddExamples as createOutputSanitizerExamples } from "./subagents/output_sanitizer/eval/langsmith/llm_judge/dataset";
import { createAndAddExamples as createAnswerAgentLlmJudgeExamples } from "./subagents/answer_agent/eval/langsmith/llm_judge/dataset";
import { createAndAddExamples as createAnswerAgentMultiTurnExamples } from "./subagents/answer_agent/eval/langsmith/multi_turn/dataset";
import {
  LANGFUSE_OFFLINE_EVAL_SUITE_IDS,
  isLangfuseOfflineEvalSuiteId,
  runAllLangfuseOfflineEvalSuitesParallel,
  runAllLangfuseOfflineEvalSuitesSequential,
  runLangfuseOfflineEvalSuite,
} from "./eval/langfuse/runLangfuseOfflineEvalSuite";

// Load environment variables from the root of the package
dotenv.config({
  path: path.resolve(getProjectRootPath(), ".env"),
  debug: true,
});

const secureAgentProgram = new Command();

secureAgentProgram
  .name("secure-agent")
  .description("CLI for interacting with the Secure Agent")
  .version("1.0.0");

secureAgentProgram
  .command("run")
  .description("Run the Secure agent")
  .option("-m, --model [model]", "Model to use", "gemini-2.5-flash")
  .option("-p, --project [project]", "Project to use")
  .option("-l, --location [location]", "Location to use")
  .requiredOption("-t, --text <message>", "The message to send to the agent")
  .action(
    async (options: {
      model: string;
      project: string;
      location: string;
      text: string;
    }) => {
      const { project, location, model, text: message } = options;

      // Initialize GenAI client
      const genAIConfig: GenAIConfig = {};
      if (project) genAIConfig.project = project;
      if (location) genAIConfig.location = location;

      const secureAgent = new SecureAgent();

      const responseStream = secureAgent.processMessage(
        message,
        [], // history
        genAIConfig,
        model,
        undefined, // sessionId
      );

      process.stdout.write("Secure Agent Response:\n");
      for await (const chunk of responseStream) {
        if (chunk && chunk.content && typeof chunk.content === "string") {
          process.stdout.write(chunk.content);
        }
      }
      process.stdout.write("\n");
    },
  );

secureAgentProgram
  .command("eval")
  .description(
    "Evaluate the Secure agent (LangSmith; use eval-langfuse for Langfuse)",
  )
  .action(async () => {
    // Run the evaluation(s) of the input sanitizer
    await runInputSanitizerEvaluation();

    // Run the evaluation(s) of the output sanitizer
    await runOutputSanitizerEvaluation();

    // Run the evaluation(s) of the answer agent
    await runAnswerAgentEvaluation();

    // Run the evaluation(s) of the multi-turn answer agent
    await runMultiTurnEvaluation();
  });

secureAgentProgram
  .command("eval-langfuse")
  .description(
    "Run all Langfuse offline evaluations for the secure agent (sequential by default; use --parallel for subprocess isolation)",
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

secureAgentProgram
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

////////////////////////////////////////////////////////////////
// Input Sanitizer
////////////////////////////////////////////////////////////////
const inputSanitizerProgram = secureAgentProgram.command("input-sanitizer");

const inputSanitizerLangSmithEval = inputSanitizerProgram.command("langsmith");

// LLM-as-a-judge evaluation with LangSmith
inputSanitizerLangSmithEval
  .command("eval-llm-as-judge")
  .description("Evaluate the Secure agent with LLM as judge")
  .action(async () => {
    console.log("Evaluating Secure agent with LLM as judge");
    await runInputSanitizerEvaluation();
  });

inputSanitizerLangSmithEval
  .command("create-dataset-llm-as-judge")
  .description("Create the dataset for the LLM-as-a-judge evaluation")
  .action(async () => {
    console.log("Creating dataset for input sanitizer...");
    await createInputSanitizerExamples();
  });

////////////////////////////////////////////////////////////////
// Request Answerer
////////////////////////////////////////////////////////////////
const answerAgentProgram = secureAgentProgram.command("answer-agent");

const answerAgentLangSmithEval = answerAgentProgram.command("langsmith");

answerAgentLangSmithEval
  .command("eval-llm-as-judge")
  .description("Evaluate the Secure agent with LLM as judge")
  .action(async () => {
    console.log("Evaluating Secure agent with LLM as judge");
    await runAnswerAgentEvaluation();
  });

answerAgentLangSmithEval
  .command("create-dataset-llm-as-judge")
  .description(
    "Create the dataset for the answer agent LLM-as-a-judge evaluation",
  )
  .action(async () => {
    console.log("Creating dataset for answer agent LLM-as-a-judge...");
    await createAnswerAgentLlmJudgeExamples();
  });

// Multi-turn evaluation with LangSmith
answerAgentLangSmithEval
  .command("eval-multi-turn")
  .description("Evaluate the Secure agent with multi-turn evaluation")
  .action(async () => {
    console.log("Evaluating Secure agent with multi-turn evaluation");
    await runMultiTurnEvaluation();
  });

answerAgentLangSmithEval
  .command("create-dataset-multi-turn")
  .description("Create the dataset for the answer agent multi-turn evaluation")
  .action(async () => {
    console.log("Creating dataset for answer agent multi-turn...");
    await createAnswerAgentMultiTurnExamples();
  });

////////////////////////////////////////////////////////////////
// Output Sanitizer
////////////////////////////////////////////////////////////////
const outputSanitizerProgram = secureAgentProgram.command("output-sanitizer");

const outputSanitizerLangSmithEval =
  outputSanitizerProgram.command("langsmith");

// LLM-as-a-judge evaluation with LangSmith
outputSanitizerLangSmithEval
  .command("eval-llm-as-judge")
  .description("Evaluate the Secure agent with LLM as judge")
  .action(async () => {
    console.log("Evaluating Secure agent with LLM as judge");
    await runOutputSanitizerEvaluation();
  });

outputSanitizerLangSmithEval
  .command("create-dataset-llm-as-judge")
  .description("Create the dataset for the LLM-as-a-judge evaluation")
  .action(async () => {
    console.log("Creating dataset for output sanitizer...");
    await createOutputSanitizerExamples();
  });

export { secureAgentProgram };
