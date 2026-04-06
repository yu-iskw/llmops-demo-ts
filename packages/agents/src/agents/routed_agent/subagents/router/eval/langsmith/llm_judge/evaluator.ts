import { getGenAI } from "../../../../../../../utils/genai";
import { ROUTED_AGENT_ROUTER_MODEL } from "../../../../../routedAgentConstants";
import { RouterEvalInputs, RouterEvalOutputs } from "./types";
import { Run, Example } from "langsmith";

interface EvaluationParameters {
  inputs: RouterEvalInputs;
  outputs: RouterEvalOutputs;
  referenceOutputs?: RouterEvalOutputs;
}

const createGenAIAsJudge = (parameters: {
  prompt: string;
  model: string;
  feedbackKey: string;
}) => {
  const genAI = getGenAI();

  return async (run: Run, example?: Example) => {
    const evaluationParameters: EvaluationParameters = {
      inputs: run.inputs as RouterEvalInputs,
      outputs: run.outputs as RouterEvalOutputs,
      referenceOutputs: example?.outputs as RouterEvalOutputs | undefined,
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

export const correctnessEvaluatorGenAI = async (
  run: Run,
  example?: Example,
) => {
  const CORRECTNESS_PROMPT_GENAI = `
    Given the user message in inputs and the predicted route in outputs (trip, finance, or general),
    compare to the reference_outputs.route.
    The reference is the intended domain. Allow equivalent interpretations (e.g. travel vs trip).
    Is the predicted route correct for the user intent? Respond with "CORRECT" or "INCORRECT".
    Inputs: {inputs}
    Outputs: {outputs}
    Reference: {reference_outputs}
  `;

  const evaluator = createGenAIAsJudge({
    prompt: CORRECTNESS_PROMPT_GENAI,
    model: ROUTED_AGENT_ROUTER_MODEL,
    feedbackKey: "correctness_genAI",
  });
  return await evaluator(run, example);
};

export const routeExactMatch = async (run: Run, example?: Example) => {
  const actual = run.outputs?.route;
  const expected = example?.outputs?.route;
  const score = actual === expected ? 1 : 0;
  const comment = `Expected route: ${expected}, Actual route: ${actual}`;
  return { key: "route_exact_match", score, comment };
};
