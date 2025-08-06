import { createGenAIClient } from "@utils/genai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  RequestAnswererInputs,
  RequestAnswererOutputs,
} from "@agents/secure_agent/subagents/answer_agent/eval/types";
import { Run, Example } from "langsmith";

interface EvaluationParams {
  inputs: RequestAnswererInputs;
  outputs: RequestAnswererOutputs;
  referenceOutputs?: RequestAnswererOutputs;
}

const createGenAIAsJudge = (params: {
  prompt: string;
  model: string;
  feedbackKey: string;
}) => {
  const genAI = createGenAIClient();

  return async (run: Run, example?: Example) => {
    const evaluationParams: EvaluationParams = {
      inputs: run.inputs as RequestAnswererInputs,
      outputs: run.outputs as RequestAnswererOutputs,
      referenceOutputs: example?.outputs as RequestAnswererOutputs | undefined,
    };
    const evaluationPrompt = params.prompt
      .replace("{inputs}", JSON.stringify(evaluationParams.inputs))
      .replace("{outputs}", JSON.stringify(evaluationParams.outputs))
      .replace(
        "{reference_outputs}",
        JSON.stringify(evaluationParams.referenceOutputs),
      );

    try {
      const result = await genAI.models.generateContent({
        model: params.model,
        contents: [{ role: "user", parts: [{ text: evaluationPrompt }] }],
      });
      const feedback = result.text || ""; // Safely get text and default to empty string
      return {
        key: params.feedbackKey,
        score: feedback.includes("CORRECT") ? 1 : 0,
      };
    } catch (error) {
      console.error("Error running GenAI evaluator:", error);
      return { key: params.feedbackKey, score: 0, comment: "Evaluator error" };
    }
  };
};

export const correctnessEvaluatorGenAI = async (
  run: Run,
  example?: Example,
) => {
  const CORRECTNESS_PROMPT_GENAI = `
    Given the following input: {inputs}
    And the generated AI response: {outputs}
    Compare the 'ai_response' from the generated output to the reference output.
    Is the generated AI response correct according to the reference? Respond with "CORRECT" or "INCORRECT".
  `;

  const evaluator = createGenAIAsJudge({
    prompt: CORRECTNESS_PROMPT_GENAI,
    model: "gemini-2.5-flash", // [[memory:5194513]]
    feedbackKey: "correctness_genAI",
  });
  const evaluatorResult = await evaluator(run, example);
  return evaluatorResult;
};
