import type { ChatCompletionMessage } from "openevals";
import type { Example, Run } from "langsmith";
import { createAndAddExamples } from "../../../../../eval/langfuse/datasets/createAnswerAgentMultiTurnDataset";
import { adaptLangSmithEvaluator } from "../../../../../../../eval/langfuse/adaptLangSmithEvaluator";
import { createLangfuseEvalClient } from "../../../../../eval/langfuse/langfuseEvalClient";
import {
  shutdownLangfuseTracing,
  startLangfuseTracing,
} from "../../../../../eval/langfuse/instrumentation";
import { targetFunction } from "../../langsmith/multi_turn/targetFunction";
import { getGenAI } from "../../../../../../../utils/genai";

type MultiTurnEvalInput = {
  messages: ChatCompletionMessage[];
  simulated_user_prompt: string;
};

async function satisfactionAndHelpfulnessEvaluator(
  run: Run,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- LangSmith evaluator arity; reference outputs only
  example?: Example,
): Promise<{ key: string; score: number; comment?: string }> {
  const genAI = getGenAI();
  const evaluationPrompt =
    "Based on the below conversation trajectory, was the user satisfied and was the agent helpful?\n" +
    JSON.stringify(run.outputs);

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: evaluationPrompt }] }],
    });
    const feedback = result.text || "";
    return {
      key: "satisfaction_and_helpfulness",
      score:
        feedback.includes("SATISFIED") && feedback.includes("HELPFUL") ? 1 : 0,
    };
  } catch (error) {
    console.error("Error running GenAI evaluator:", error);
    return {
      key: "satisfaction_and_helpfulness",
      score: 0,
      comment: "Evaluator error",
    };
  }
}

export async function runEvaluation(): Promise<void> {
  startLangfuseTracing();
  const langfuse = createLangfuseEvalClient();

  try {
    const datasetName = await createAndAddExamples();
    const dataset = await langfuse.dataset.get(datasetName);

    const result = await dataset.runExperiment({
      name: "secure-agent-answer-multi-turn-evaluation",
      description:
        "Answer agent multi-turn offline evaluation (dataset synced to Langfuse).",
      task: async ({ input }) => targetFunction(input as MultiTurnEvalInput),
      evaluators: [
        adaptLangSmithEvaluator(satisfactionAndHelpfulnessEvaluator),
      ],
      maxConcurrency: 2,
      metadata: {
        suite: "answer-multi-turn",
        agent: "secure",
        provider: "langfuse",
      },
    });

    console.log(await result.format());
    console.log(
      "Answer agent multi-turn Langfuse evaluation completed. Check Langfuse UI for results.",
    );
  } finally {
    await langfuse.flush();
    await langfuse.shutdown();
    await shutdownLangfuseTracing();
  }
}
