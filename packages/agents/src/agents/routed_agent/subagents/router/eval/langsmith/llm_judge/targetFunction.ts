import { classifyRoute } from "../../../routerNodes";
import { getGenAI } from "../../../../../../../utils/genai";
import { RouterEvalInputs, RouterEvalOutputs } from "./types";
import type { RoutedAgentState } from "../../../../../routedAgentState";

const genAI = getGenAI();

export async function targetFunction(
  inputs: RouterEvalInputs,
): Promise<RouterEvalOutputs> {
  try {
    const state = {
      user_message: inputs.user_message,
      messages: inputs.messages,
      messageWindowSize: inputs.messageWindowSize,
      ai_response: undefined,
      route: undefined,
      is_sensitive: false,
      feedback_message: undefined,
      confidence_probability: undefined,
      suspicious_probability: undefined,
    } as RoutedAgentState;

    const result = await classifyRoute(state, genAI);
    const route = result.route ?? "general";

    return { route };
  } catch (error) {
    console.error("Error in router target function:", error);
    return { route: "general" };
  }
}
