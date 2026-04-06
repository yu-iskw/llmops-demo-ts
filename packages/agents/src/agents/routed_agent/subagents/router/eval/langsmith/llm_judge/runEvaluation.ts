import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { createAndAddExamples } from "../../../../../eval/langsmith/datasets/routerDataset";
import { targetFunction } from "./targetFunction";
import { correctnessEvaluatorGenAI, routeExactMatch } from "./evaluator";

export async function runLlmJudgeEvaluation() {
  const datasetId = await createAndAddExamples();
  await evaluate(targetFunction, {
    data: datasetId,
    evaluators: [correctnessEvaluatorGenAI, routeExactMatch],
    experimentPrefix: "routed-agent-router-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions);
  console.log(
    "Router evaluation run initiated. Check LangSmith UI for results.",
  );
}
