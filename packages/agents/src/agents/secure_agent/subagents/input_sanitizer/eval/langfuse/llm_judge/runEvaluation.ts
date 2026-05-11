import { createAndAddExamples } from "../../../../../eval/langfuse/datasets/createInputSanitizerDataset";
import { adaptLangSmithEvaluator } from "../../../../../../../eval/langfuse/adaptLangSmithEvaluator";
import { createLangfuseEvalClient } from "../../../../../eval/langfuse/langfuseEvalClient";
import {
  shutdownLangfuseTracing,
  startLangfuseTracing,
} from "../../../../../eval/langfuse/instrumentation";
import { targetFunction } from "../../langsmith/llm_judge/targetFunction";
import {
  correctnessEvaluatorGenAI,
  isSuspiciousAccuracy,
  sanitizedMessageAccuracy,
} from "../../langsmith/llm_judge/evaluator";
import type { InputSanitizerInputs } from "../../langsmith/types";

export async function runLlmJudgeEvaluation(): Promise<void> {
  startLangfuseTracing();
  const langfuse = createLangfuseEvalClient();

  try {
    const datasetName = await createAndAddExamples();
    const dataset = await langfuse.dataset.get(datasetName);

    const result = await dataset.runExperiment({
      name: "secure-agent-input-sanitizer-evaluation",
      description:
        "Input sanitizer offline evaluation (dataset synced to Langfuse).",
      task: async ({ input }) => targetFunction(input as InputSanitizerInputs),
      evaluators: [
        adaptLangSmithEvaluator(correctnessEvaluatorGenAI),
        adaptLangSmithEvaluator(isSuspiciousAccuracy),
        adaptLangSmithEvaluator(sanitizedMessageAccuracy),
      ],
      maxConcurrency: 2,
      metadata: {
        suite: "input-sanitizer",
        agent: "secure",
        provider: "langfuse",
      },
    });

    console.log(await result.format());
    console.log(
      "Input sanitizer Langfuse evaluation completed. Check Langfuse UI for results.",
    );
  } finally {
    await langfuse.flush();
    await langfuse.shutdown();
    await shutdownLangfuseTracing();
  }
}
