import { createAndAddExamples } from "../../../../../eval/langfuse/datasets/outputSanitizerDataset";
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
} from "../../../../../../secure_agent/subagents/output_sanitizer/eval/langsmith/llm_judge/evaluator";

export async function runLlmJudgeEvaluation() {
  startLangfuseTracing();
  const langfuse = createLangfuseEvalClient();

  try {
    const datasetName = await createAndAddExamples();
    const dataset = await langfuse.dataset.get(datasetName);

    const result = await dataset.runExperiment({
      name: "routed-agent-output-sanitizer-evaluation",
      description:
        "Output sanitizer offline evaluation (YAML synced to Langfuse).",
      task: async ({ input }) => targetFunction(input),
      evaluators: [
        adaptLangSmithEvaluator(correctnessEvaluatorGenAI),
        adaptLangSmithEvaluator(isSensitiveAccuracy),
        adaptLangSmithEvaluator(outputSanitizedMessageAccuracy),
      ],
      maxConcurrency: 2,
      metadata: { suite: "output_sanitizer", provider: "langfuse" },
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
