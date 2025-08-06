import { Command } from "commander";
import { SecureAgent } from "./secureAgent.js"; // Import DefaultAgent
import { createGenAIClient, GenAIConfig } from "../../utils/genai.js"; // Import GenAI utilities
import { runEvaluation as runInputSanitizerEvaluation } from "./subagents/input_sanitizer/eval/runEvaluation.js";
import dotenv from "dotenv";
import { getProjectRootPath } from "@utils/utils";
import path from "path";
import { runEvaluation as runOutputSanitizerEvaluation } from "./subagents/output_sanitizer/eval/langsmith/llm_judge/runEvaluation.js";

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
      console.log(`Sending message to Secure Agent: \"${options.text}\"`);
      console.log(`Options received:`, options);
      const { project, location, model, text: message } = options;

      // Initialize GenAI client
      const genAIConfig: GenAIConfig = {};
      if (project) genAIConfig.project = project;
      if (location) genAIConfig.location = location;

      const genAI = createGenAIClient(genAIConfig);
      const secureAgent = new SecureAgent();

      const response = await secureAgent.processMessage(
        message,
        [], // history
        genAIConfig,
        model,
        undefined, // sessionId
      );
      console.log("Secure Agent Response:", response);
    },
  );

////////////////////////////////////////////////////////////////
// Input Sanitizer
////////////////////////////////////////////////////////////////
const inputSanitizerProgram = secureAgentProgram.command("input-sanitizer");

const inputSanitizerLangSmithEval = inputSanitizerProgram.command("langsmith");

// LLM-as-a-judge evaluation with LangSmith
inputSanitizerLangSmithEval
  .command("llm-as-judge")
  .description("Evaluate the Secure agent with LLM as judge")
  .action(async () => {
    console.log("Evaluating Secure agent with LLM as judge");
    await runInputSanitizerEvaluation();
  });

////////////////////////////////////////////////////////////////
// Output Sanitizer
////////////////////////////////////////////////////////////////
const outputSanitizerProgram = secureAgentProgram.command("output-sanitizer");

const outputSanitizerLangSmithEval =
  outputSanitizerProgram.command("langsmith");

// LLM-as-a-judge evaluation with LangSmith
outputSanitizerLangSmithEval
  .command("llm-as-judge")
  .description("Evaluate the Secure agent with LLM as judge")
  .action(async () => {
    console.log("Evaluating Secure agent with LLM as judge");
    await runOutputSanitizerEvaluation();
  });

export { secureAgentProgram };
