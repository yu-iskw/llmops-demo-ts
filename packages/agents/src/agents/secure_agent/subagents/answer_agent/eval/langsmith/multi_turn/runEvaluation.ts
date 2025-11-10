import { evaluate, EvaluateOptions } from "langsmith/evaluation";
import { targetFunction } from "./targetFunction";
import { createAndAddExamples } from "./dataset";
import { Run } from "langsmith";
import { getGenAI } from "../../../../../../../utils/genai";

const createGenAIAsJudge = (parameters: {
  prompt: string;
  model: string;
  feedbackKey: string;
}) => {
  const genAI = getGenAI();

  return async (run: Run) => {
    const evaluationPrompt = parameters.prompt.replace(
      "{outputs}",
      JSON.stringify(run.outputs),
    );

    try {
      const result = await genAI.models.generateContent({
        model: parameters.model,
        contents: [{ role: "user", parts: [{ text: evaluationPrompt }] }],
      });
      const feedback = result.text || "";
      return {
        key: parameters.feedbackKey,
        score:
          feedback.includes("SATISFIED") && feedback.includes("HELPFUL")
            ? 1
            : 0,
      };
    } catch (error) {
      console.error("Error running GenAI evaluator:", error);
      return {
        key: parameters.feedbackKey,
        score: 0,
        comment: "Evaluator error",
      };
    }
  };
};

const trajectoryEvaluator = createGenAIAsJudge({
  model: "gemini-2.5-flash", // [[memory:5194513]]
  prompt:
    "Based on the below conversation trajectory, was the user satisfied and was the agent helpful?\n{outputs}",
  feedbackKey: "satisfaction_and_helpfulness",
});

export async function runEvaluation() {
  const datasetId = await createAndAddExamples();
  await evaluate(targetFunction, {
    data: datasetId,
    evaluators: [trajectoryEvaluator],
    experimentPrefix: "multi-turn-request-answerer-evaluation",
    maxConcurrency: 2,
  } as EvaluateOptions); // The cast to EvaluateOptions is necessary here because the 'data' property expects a string, but datasetId is inferred as KVMap | undefined.
  console.log("Evaluation run initiated. Check LangSmith UI for results.");
}
