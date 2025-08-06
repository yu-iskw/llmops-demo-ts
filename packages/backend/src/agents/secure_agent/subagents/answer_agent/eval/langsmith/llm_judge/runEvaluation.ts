import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { targetFunction } from "./targetFunction";
import { correctnessEvaluatorGenAI } from "./evaluator";
import { createAndAddExamples } from "./dataset";

export async function runEvaluation() {
  await createAndAddExamples(); // Ensure dataset is created before evaluation
  await evaluate(targetFunction, {
    data: "Request Answerer Dataset",
    evaluators: [correctnessEvaluatorGenAI],
    experimentPrefix: "request-answerer-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions);
  console.log("Evaluation run initiated. Check LangSmith UI for results.");
}

// runEvaluation().catch(console.error);
