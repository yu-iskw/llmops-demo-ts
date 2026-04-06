import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { createAndAddExamples } from "../../../../../eval/langsmith/datasets/generalSpecialistDataset";
import { targetFunction } from "./targetFunction";
import { specialistQualityEvaluatorGenAI } from "./evaluator";

export async function runLlmJudgeEvaluation() {
  const datasetId = await createAndAddExamples();
  await evaluate(targetFunction, {
    data: datasetId,
    evaluators: [specialistQualityEvaluatorGenAI],
    experimentPrefix: "routed-agent-general-specialist-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions);
  console.log(
    "General specialist evaluation run initiated. Check LangSmith UI for results.",
  );
}
