import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { targetFunction } from "@agents/secure_agent/subagents/answer_agent/eval/langsmith/llm_judge/targetFunction";
import { createAndAddExamples } from "./dataset";
import { createLLMAsJudge } from "openevals";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

const trajectoryEvaluator = createLLMAsJudge({
  model: "gemini-2.5-flash", // [[memory:5194513]]
  prompt:
    "Based on the below conversation trajectory, was the user satisfied and was the agent helpful?\n{outputs}",
  feedbackKey: "satisfaction_and_helpfulness",
});

export async function runEvaluation() {
  const datasetId = await createAndAddExamples(); // Ensure dataset is created before evaluation
  await evaluate(targetFunction, {
    data: datasetId,
    evaluators: [trajectoryEvaluator],
    experimentPrefix: "multi-turn-request-answerer-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions);
  console.log("Evaluation run initiated. Check LangSmith UI for results.");
}

// runEvaluation().catch(console.error);
