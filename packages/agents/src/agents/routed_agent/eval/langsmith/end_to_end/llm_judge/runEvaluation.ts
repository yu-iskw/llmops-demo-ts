import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { createAndAddExamples } from "../../datasets/endToEndDataset";
import { targetFunction } from "./targetFunction";
import { endToEndQualityEvaluatorGenAI, routeExactMatch } from "./evaluator";

export async function runLlmJudgeEvaluation() {
  const datasetId = await createAndAddExamples();
  await evaluate(targetFunction, {
    data: datasetId,
    evaluators: [endToEndQualityEvaluatorGenAI, routeExactMatch],
    experimentPrefix: "routed-agent-e2e-evaluation",
    maxConcurrency: 1,
  } as EvaluateOptions);
  console.log("E2E evaluation run initiated. Check LangSmith UI for results.");
}
