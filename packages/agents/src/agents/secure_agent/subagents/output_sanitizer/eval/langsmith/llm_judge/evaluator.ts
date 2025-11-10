import { getGenAI } from "../../../../../../../utils/genai";
import { OutputSanitizerInputs, OutputSanitizerOutputs } from "../types";
import { Run, Example } from "langsmith";

interface EvaluationParameters {
  inputs: OutputSanitizerInputs;
  outputs: OutputSanitizerOutputs;
  referenceOutputs?: OutputSanitizerOutputs;
}

const createGenAIAsJudge = (parameters: {
  prompt: string;
  model: string;
  feedbackKey: string;
}) => {
  const genAI = getGenAI();

  return async (run: Run, example?: Example) => {
    const evaluationParameters: EvaluationParameters = {
      inputs: run.inputs as OutputSanitizerInputs,
      outputs: run.outputs as OutputSanitizerOutputs,
      referenceOutputs: example?.outputs as OutputSanitizerOutputs | undefined,
    };
    const evaluationPrompt = parameters.prompt
      .replace("{inputs}", JSON.stringify(evaluationParameters.inputs))
      .replace("{outputs}", JSON.stringify(evaluationParameters.outputs))
      .replace(
        "{reference_outputs}",
        JSON.stringify(evaluationParameters.referenceOutputs),
      );

    try {
      const result = await genAI.models.generateContent({
        model: parameters.model,
        contents: [{ role: "user", parts: [{ text: evaluationPrompt }] }],
      });
      const feedback = result.text || ""; // Safely get text and default to empty string
      return {
        key: parameters.feedbackKey,
        score: feedback.includes("CORRECT") ? 1 : 0,
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

export const correctnessEvaluatorGenAI = async (
  run: Run,
  example?: Example,
) => {
  const CORRECTNESS_PROMPT_GENAI = `
    Given the following input: {inputs}
    And the generated output: {outputs}
    Compare the 'is_sensitive' and 'sanitized_message' from the generated output to the reference output.
    Is the generated output correct according to the reference? Respond with "CORRECT" or "INCORRECT".
  `;

  const evaluator = createGenAIAsJudge({
    prompt: CORRECTNESS_PROMPT_GENAI,
    model: "gemini-2.5-flash", // [[memory:5194513]]
    feedbackKey: "correctness_genAI",
  });
  return await evaluator(run, example);
};

export const isSensitiveAccuracy = async (run: Run, example?: Example) => {
  const actualSensitive = (run.outputs as OutputSanitizerOutputs)?.is_sensitive;
  const expectedSensitive = (example?.outputs as OutputSanitizerOutputs)
    ?.is_sensitive;

  const score = actualSensitive === expectedSensitive ? 1 : 0;
  const comment = `Expected is_sensitive: ${expectedSensitive}, Actual is_sensitive: ${actualSensitive}`;

  return { key: "is_sensitive_accuracy", score, comment };
};

export const outputSanitizedMessageAccuracy = async (
  run: Run,
  example?: Example,
) => {
  const actualReason = (run.outputs as OutputSanitizerOutputs)?.reason;
  const expectedReason = (example?.outputs as OutputSanitizerOutputs)?.reason;

  const score = actualReason === expectedReason ? 1 : 0;
  const comment = `Expected reason: "${expectedReason}", Actual reason: "${actualReason}"`;

  return { key: "output_sanitized_reason_accuracy", score, comment };
};
