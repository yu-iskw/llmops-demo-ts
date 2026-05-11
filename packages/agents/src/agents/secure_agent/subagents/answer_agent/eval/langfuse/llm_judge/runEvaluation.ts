import { createAndAddExamples } from "../../../../../eval/langfuse/datasets/createAnswerAgentLlmJudgeDataset";
import { adaptLangSmithEvaluator } from "../../../../../../../eval/langfuse/adaptLangSmithEvaluator";
import { createLangfuseEvalClient } from "../../../../../eval/langfuse/langfuseEvalClient";
import {
  shutdownLangfuseTracing,
  startLangfuseTracing,
} from "../../../../../eval/langfuse/instrumentation";
import { targetFunction } from "../../langsmith/llm_judge/targetFunction";
import { correctnessEvaluatorGenAI } from "../../langsmith/llm_judge/evaluator";
import type { RequestAnswererInputs } from "../../langsmith/llm_judge/types";

export async function runLlmJudgeEvaluation(): Promise<void> {
  startLangfuseTracing();
  const langfuse = createLangfuseEvalClient();

  try {
    const datasetName = await createAndAddExamples();
    const dataset = await langfuse.dataset.get(datasetName);

    const result = await dataset.runExperiment({
      name: "secure-agent-answer-llm-judge-evaluation",
      description:
        "Request answerer single-turn offline evaluation (dataset synced to Langfuse).",
      task: async ({ input }) => targetFunction(input as RequestAnswererInputs),
      evaluators: [adaptLangSmithEvaluator(correctnessEvaluatorGenAI)],
      maxConcurrency: 2,
      metadata: {
        suite: "answer-llm-judge",
        agent: "secure",
        provider: "langfuse",
      },
    });

    console.log(await result.format());
    console.log(
      "Answer agent LLM-judge Langfuse evaluation completed. Check Langfuse UI for results.",
    );
  } finally {
    await langfuse.flush();
    await langfuse.shutdown();
    await shutdownLangfuseTracing();
  }
}
