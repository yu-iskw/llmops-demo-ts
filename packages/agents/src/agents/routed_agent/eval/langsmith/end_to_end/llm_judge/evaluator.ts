import { getGenAI } from "../../../../../../utils/genai";
import { RoutedE2EInputs, RoutedE2EOutputs } from "./types";
import { Run, Example } from "langsmith";

interface EvaluationParameters {
  inputs: RoutedE2EInputs;
  outputs: RoutedE2EOutputs;
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
      inputs: run.inputs as RoutedE2EInputs,
      outputs: run.outputs as RoutedE2EOutputs,
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

/** LLM judge: routing + answer usefulness vs reference rubric. */
export const endToEndQualityEvaluatorGenAI = async (
  run: Run,
  example?: Example,
) => {
  const PROMPT = `
You evaluate the routed agent end-to-end run.
Inputs contain the user message. Outputs contain route (trip|finance|general), ai_response, and is_sensitive.

Reference outputs include:
- expected_route: the domain the user question primarily belongs to
- rubric: short description of what a good answer should cover

Decide if BOTH are satisfied:
1) The route matches expected_route (or is an acceptable alternative).
2) The ai_response is on-topic and reasonably helpful for the user message under that domain, per the rubric.

Respond with exactly "CORRECT" or "INCORRECT".

Inputs: {inputs}
Outputs: {outputs}
Reference: {reference_outputs}
`;

  const evaluator = createGenAIAsJudge({
    prompt: PROMPT,
    model: "gemini-2.5-flash",
    feedbackKey: "e2e_quality_genAI",
  });
  return await evaluator(run, example);
};

export const routeExactMatch = async (run: Run, example?: Example) => {
  const actual = run.outputs?.route;
  const expected = example?.outputs?.expected_route ?? example?.outputs?.route;
  const score = actual === expected ? 1 : 0;
  const comment = `Expected route: ${expected}, Actual route: ${actual}`;
  return { key: "route_exact_match", score, comment };
};
