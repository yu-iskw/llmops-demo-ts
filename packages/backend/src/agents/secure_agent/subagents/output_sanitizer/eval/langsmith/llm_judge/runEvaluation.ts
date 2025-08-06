import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { targetFunction } from "./targetFunction";
import {
  correctnessEvaluatorGenAI,
  isSensitiveAccuracy,
  outputSanitizedMessageAccuracy,
} from "./evaluator";
import { createAndAddExamples } from "./dataset";

export async function runEvaluation() {
  await createAndAddExamples(); // Ensure dataset is created before evaluation
  await evaluate(targetFunction, {
    data: "Output Sanitizer Dataset",
    evaluators: [
      correctnessEvaluatorGenAI,
      isSensitiveAccuracy,
      outputSanitizedMessageAccuracy,
    ],
    experimentPrefix: "output-sanitizer-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions);
  console.log("Evaluation run initiated. Check LangSmith UI for results.");
}

runEvaluation().catch(console.error);
