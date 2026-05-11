import { createAndAddExamples } from "../../../../../eval/langfuse/datasets/createOutputSanitizerDataset";
import { adaptLangSmithEvaluator } from "../../../../../../../eval/langfuse/adaptLangSmithEvaluator";
import { createLangfuseEvalClient } from "../../../../../eval/langfuse/langfuseEvalClient";
import {
  shutdownLangfuseTracing,
  startLangfuseTracing,
} from "../../../../../eval/langfuse/instrumentation";
import { targetFunction } from "../../langsmith/llm_judge/targetFunction";
import {
  correctnessEvaluatorGenAI,
  isSensitiveAccuracy,
  outputSanitizedMessageAccuracy,
} from "../../langsmith/llm_judge/evaluator";
import type { OutputSanitizerInputs } from "../../langsmith/types";

export async function runLlmJudgeEvaluation(): Promise<void> {
  startLangfuseTracing();
  const langfuse = createLangfuseEvalClient();

  try {
    const datasetName = await createAndAddExamples();
    const dataset = await langfuse.dataset.get(datasetName);

    const result = await dataset.runExperiment({
      name: "secure-agent-output-sanitizer-evaluation",
      description:
        "Output sanitizer offline evaluation (dataset synced to Langfuse).",
      task: async ({ input }) => targetFunction(input as OutputSanitizerInputs),
      evaluators: [
        adaptLangSmithEvaluator(correctnessEvaluatorGenAI),
        adaptLangSmithEvaluator(isSensitiveAccuracy),
        adaptLangSmithEvaluator(outputSanitizedMessageAccuracy),
      ],
      maxConcurrency: 2,
      metadata: {
        suite: "output-sanitizer",
        agent: "secure",
        provider: "langfuse",
      },
    });

    console.log(await result.format());
    console.log(
      "Output sanitizer Langfuse evaluation completed. Check Langfuse UI for results.",
    );
  } finally {
    await langfuse.flush();
    await langfuse.shutdown();
    await shutdownLangfuseTracing();
  }
}
