import { RequestAnswererStateAnnotation } from "@agents/secure_agent/subagents/answer_agent/requestAnswererState";
import { createGenAIClient } from "@utils/genai";
import {
  RequestAnswererInputs,
  RequestAnswererOutputs,
} from "@agents/secure_agent/subagents/answer_agent/eval/types";
import { answerRequest } from "@agents/secure_agent/subagents/answer_agent/requestAnswererNodes";

const genAI = createGenAIClient();
const modelName = "gemini-2.5-flash"; // [[memory:5194513]]

export async function targetFunction(
  inputs: RequestAnswererInputs,
): Promise<RequestAnswererOutputs> {
  try {
    const initialState: typeof RequestAnswererStateAnnotation.State = {
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
      ai_response: "An error occurred while trying to answer your request.",
    };
  }
}
