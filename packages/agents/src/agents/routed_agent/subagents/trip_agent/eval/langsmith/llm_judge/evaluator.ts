import { getGenAI } from "../../../../../../../utils/genai";
import { SpecialistEvalInputs, SpecialistEvalOutputs } from "./types";
import { Run, Example } from "langsmith";
import { ROUTED_AGENT_SPECIALIST_EVAL_MODEL } from "../../../../../routedAgentConstants";

interface EvaluationParameters {
  inputs: SpecialistEvalInputs;
  outputs: SpecialistEvalOutputs;
  referenceOutputs?: Record<string, unknown>;
}

const createGenAIAsJudge = (parameters: {
  prompt: string;
  model: string;
  feedbackKey: string;
}) => {
  const genAI = getGenAI();

  return async (run: Run, example?: Example) => {
    const evaluationParameters: EvaluationParameters = {
      inputs: run.inputs as SpecialistEvalInputs,
      outputs: run.outputs as SpecialistEvalOutputs,
      referenceOutputs: example?.outputs as Record<string, unknown> | undefined,
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
      const feedback = result.text || "";
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

/** LLM judge: specialist answer quality vs reference rubric. */
export const specialistQualityEvaluatorGenAI = async (
  run: Run,
  example?: Example,
) => {
  const PROMPT = `
You evaluate a specialized AI agent response.
Inputs contain the user message. Outputs contain ai_response.

Reference outputs include:
- rubric: short description of what a good answer should cover

Decide if the ai_response is on-topic and reasonably helpful for the user message, per the rubric.
Respond with exactly "CORRECT" or "INCORRECT".

Inputs: {inputs}
Outputs: {outputs}
Reference: {reference_outputs}
`;

  const evaluator = createGenAIAsJudge({
    prompt: PROMPT,
    model: ROUTED_AGENT_SPECIALIST_EVAL_MODEL,
    feedbackKey: "specialist_quality_genAI",
  });
  return await evaluator(run, example);
};
