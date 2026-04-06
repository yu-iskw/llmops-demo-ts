import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { createAndAddExamples } from "../../../../../eval/langsmith/datasets/tripSpecialistDataset";
import { targetFunction } from "./targetFunction";
import { specialistQualityEvaluatorGenAI } from "./evaluator";

export async function runLlmJudgeEvaluation() {
  const datasetId = await createAndAddExamples();
  await evaluate(targetFunction, {
    data: datasetId,
    evaluators: [specialistQualityEvaluatorGenAI],
    experimentPrefix: "routed-agent-trip-specialist-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions);
  console.log(
    "Trip specialist evaluation run initiated. Check LangSmith UI for results.",
  );
}
