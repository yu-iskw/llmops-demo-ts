import { createAndAddExamples } from "../../../../../eval/langfuse/datasets/generalSpecialistDataset";
import { adaptLangSmithEvaluator } from "../../../../../../../eval/langfuse/adaptLangSmithEvaluator";
import { createLangfuseEvalClient } from "../../../../../eval/langfuse/langfuseEvalClient";
import {
  shutdownLangfuseTracing,
  startLangfuseTracing,
} from "../../../../../eval/langfuse/instrumentation";
import { targetFunction } from "../../langsmith/llm_judge/targetFunction";
import { specialistQualityEvaluatorGenAI } from "../../langsmith/llm_judge/evaluator";
import type { SpecialistEvalInputs } from "../../langsmith/llm_judge/types";

export async function runLlmJudgeEvaluation() {
  startLangfuseTracing();
  const langfuse = createLangfuseEvalClient();

  try {
    const datasetName = await createAndAddExamples();
    const dataset = await langfuse.dataset.get(datasetName);

    const result = await dataset.runExperiment({
      name: "routed-agent-general-specialist-evaluation",
      description:
        "General specialist offline evaluation (YAML synced to Langfuse).",
      task: async ({ input }) => targetFunction(input as SpecialistEvalInputs),
      evaluators: [adaptLangSmithEvaluator(specialistQualityEvaluatorGenAI)],
      maxConcurrency: 2,
      metadata: { suite: "general_specialist", provider: "langfuse" },
    });

    console.log(await result.format());
    console.log(
      "General specialist Langfuse evaluation completed. Check Langfuse UI for results.",
    );
  } finally {
    await langfuse.flush();
    await langfuse.shutdown();
    await shutdownLangfuseTracing();
  }
}
