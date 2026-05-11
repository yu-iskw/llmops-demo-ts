import { createAndAddExamples } from "../../datasets/endToEndDataset";
import { adaptLangSmithEvaluator } from "../../../../../../eval/langfuse/adaptLangSmithEvaluator";
import { createLangfuseEvalClient } from "../../langfuseEvalClient";
import {
  shutdownLangfuseTracing,
  startLangfuseTracing,
} from "../../instrumentation";
import { targetFunction } from "../../../langsmith/end_to_end/llm_judge/targetFunction";
import {
  endToEndQualityEvaluatorGenAI,
  routeExactMatch,
} from "../../../langsmith/end_to_end/llm_judge/evaluator";
import type { RoutedE2EInputs } from "../../../langsmith/end_to_end/llm_judge/types";

export async function runLlmJudgeEvaluation() {
  startLangfuseTracing();
  const langfuse = createLangfuseEvalClient();

  try {
    const datasetName = await createAndAddExamples();
    const dataset = await langfuse.dataset.get(datasetName);

    const result = await dataset.runExperiment({
      name: "routed-agent-e2e-evaluation",
      description:
        "End-to-end routed agent offline evaluation (YAML synced to Langfuse).",
      task: async ({ input }) => targetFunction(input as RoutedE2EInputs),
      evaluators: [
        adaptLangSmithEvaluator(endToEndQualityEvaluatorGenAI),
        adaptLangSmithEvaluator(routeExactMatch),
      ],
      maxConcurrency: 1,
      metadata: { suite: "end_to_end", provider: "langfuse" },
    });

    console.log(await result.format());
    console.log(
      "End-to-end Langfuse evaluation completed. Check Langfuse UI for results.",
    );
  } finally {
    await langfuse.flush();
    await langfuse.shutdown();
    await shutdownLangfuseTracing();
  }
}
