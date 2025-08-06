import { answerRequest } from "@agents/secure_agent/subagents/answer_agent/requestAnswererNodes";
import { RequestAnswererInputs, RequestAnswererOutputs } from "./types";
import { GoogleGenAI } from "@google/genai";
import { createGenAIClient } from "@utils/genai";

// Initialize GoogleGenAI client using the centralized utility
const genAI = createGenAIClient();
const modelName = "gemini-2.5-flash"; // [[memory:5194513]]

export async function targetFunction(
  inputs: RequestAnswererInputs,
): Promise<RequestAnswererOutputs> {
  try {
    const initialState = {
      user_message: inputs.user_message,
      feedback_message: inputs.feedback_message,
      messages: [],
      messageWindowSize: 5,
      ai_response: undefined,
    };

    const result = await answerRequest(initialState, genAI, modelName);

    return {
      ai_response: result.ai_response || "",
    };
  } catch (error) {
    console.error("Error in target function:", error);
    return {
      ai_response: "An error occurred during request answering evaluation.",
    };
  }
}
