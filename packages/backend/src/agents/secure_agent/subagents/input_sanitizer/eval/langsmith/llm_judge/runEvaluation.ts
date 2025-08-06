import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { targetFunction } from "./targetFunction";
import {
  correctnessEvaluatorGenAI,
  isSuspiciousAccuracy,
  sanitizedMessageAccuracy,
} from "./evaluator";

async function runEvaluation() {
  await evaluate(targetFunction, {
    data: "Input Sanitizer Dataset",
    evaluators: [
      correctnessEvaluatorGenAI,
      isSuspiciousAccuracy,
      sanitizedMessageAccuracy,
    ],
    experimentPrefix: "input-sanitizer-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions);
  console.log("Evaluation run initiated. Check LangSmith UI for results.");
}

runEvaluation().catch(console.error);
