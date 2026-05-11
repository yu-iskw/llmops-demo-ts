import { createAndAddExamples } from "../../../../../eval/langfuse/datasets/routerDataset";
import { adaptLangSmithEvaluator } from "../../../../../../../eval/langfuse/adaptLangSmithEvaluator";
import { createLangfuseEvalClient } from "../../../../../eval/langfuse/langfuseEvalClient";
import {
  shutdownLangfuseTracing,
  startLangfuseTracing,
} from "../../../../../eval/langfuse/instrumentation";
import { targetFunction } from "../../langsmith/llm_judge/targetFunction";
import {
  correctnessEvaluatorGenAI,
  routeExactMatch,
} from "../../langsmith/llm_judge/evaluator";
import type { RouterEvalInputs } from "../../langsmith/llm_judge/types";

export async function runLlmJudgeEvaluation() {
  startLangfuseTracing();
  const langfuse = createLangfuseEvalClient();

  try {
    const datasetName = await createAndAddExamples();
    const dataset = await langfuse.dataset.get(datasetName);

    const result = await dataset.runExperiment({
      name: "routed-agent-router-evaluation",
      description:
        "Router classify_route offline evaluation (YAML synced to Langfuse).",
      task: async ({ input }) => targetFunction(input as RouterEvalInputs),
      evaluators: [
        adaptLangSmithEvaluator(correctnessEvaluatorGenAI),
        adaptLangSmithEvaluator(routeExactMatch),
      ],
      maxConcurrency: 2,
      metadata: { suite: "router", provider: "langfuse" },
    });

    console.log(await result.format());
    console.log(
      "Router Langfuse evaluation completed. Check Langfuse UI for dataset runs and traces.",
    );
  } finally {
    await langfuse.flush();
    await langfuse.shutdown();
    await shutdownLangfuseTracing();
  }
}
