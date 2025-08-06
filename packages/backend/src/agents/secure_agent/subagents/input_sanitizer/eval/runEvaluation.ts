import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { targetFunction } from "@agents/secure_agent/subagents/input_sanitizer/eval/targetFunction";
import {
  correctnessEvaluatorGenAI,
  isSuspiciousAccuracy,
  sanitizedMessageAccuracy,
} from "@agents/secure_agent/subagents/input_sanitizer/eval/evaluator";

const langsmithApiKey = process.env.LANGSMITH_API_KEY;
const langsmithEndpoint = process.env.LANGSMITH_ENDPOINT || "https://api.smith.langchain.com";
const langsmithProject = process.env.LANGCHAIN_PROJECT || "Input Sanitizer Evaluation";

// Set environment variables for LangSmith client to pick up if not already set
process.env.LANGCHAIN_API_KEY = langsmithApiKey;
process.env.LANGSMITH_ENDPOINT = langsmithEndpoint;
process.env.LANGCHAIN_TRACING_V2 = "true";
process.env.LANGCHAIN_PROJECT = langsmithProject;

export async function runEvaluation() {
  await evaluate(
    targetFunction,
    {
      data: "Input Sanitizer Dataset",
      evaluators: [correctnessEvaluatorGenAI, isSuspiciousAccuracy, sanitizedMessageAccuracy],
      experimentPrefix: "input-sanitizer-evaluation",
      maxConcurrency: 2,
    } as EvaluateOptions,
  );
  console.log("Evaluation run initiated. Check LangSmith UI for results.");
}

runEvaluation().catch(console.error);
