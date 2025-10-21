import { getGenAI } from "@utils/genai";
import { InputSanitizerInputs, InputSanitizerOutputs } from "../types";
import { Run, Example } from "langsmith";

interface EvaluationParams {
  inputs: InputSanitizerInputs;
  outputs: InputSanitizerOutputs;
  referenceOutputs?: InputSanitizerOutputs;
}

const createGenAIAsJudge = (params: {
  prompt: string;
  model: string;
  feedbackKey: string;
}) => {
  const genAI = getGenAI();

  return async (run: Run, example?: Example) => {
    const evaluationParams: EvaluationParams = {
      inputs: run.inputs as InputSanitizerInputs,
      outputs: run.outputs as InputSanitizerOutputs,
      referenceOutputs: example?.outputs as InputSanitizerOutputs | undefined,
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
    And the generated output: {outputs}
    Compare the 'is_suspicious' and 'sanitized_message' from the generated output to the reference output.
    Is the generated output correct according to the reference? Respond with "CORRECT" or "INCORRECT".
  `;

  const evaluator = createGenAIAsJudge({
    prompt: CORRECTNESS_PROMPT_GENAI,
    model: "gemini-2.5-flash", // [[memory:5194513]]
    feedbackKey: "correctness_genAI",
  });
  const evaluatorResult = await evaluator(run, example);
  return evaluatorResult;
};

export const isSuspiciousAccuracy = async (run: Run, example?: Example) => {
  const actualSuspicious = run.outputs?.is_suspicious;
  const expectedSuspicious = example?.outputs?.is_suspicious;

  const score = actualSuspicious === expectedSuspicious ? 1 : 0;
  const comment = `Expected is_suspicious: ${expectedSuspicious}, Actual is_suspicious: ${actualSuspicious}`;

  return { key: "is_suspicious_accuracy", score, comment };
};

export const sanitizedMessageAccuracy = async (run: Run, example?: Example) => {
  const actualSanitizedMessage = run.outputs?.sanitized_message;
  const expectedSanitizedMessage = example?.outputs?.sanitized_message;

  const score = actualSanitizedMessage === expectedSanitizedMessage ? 1 : 0;
  const comment = `Expected sanitized_message: "${expectedSanitizedMessage}", Actual sanitized_message: "${actualSanitizedMessage}"`;

  return { key: "sanitized_message_accuracy", score, comment };
};
