import { checkInput } from "@agents/secure_agent/subagents/input_sanitizer/inputSanitizerNodes";
import { getGenAI } from "@utils/genai";
import { InputSanitizerInputs, InputSanitizerOutputs } from "../types";

// Initialize GoogleGenAI client using the centralized utility
const genAI = getGenAI();
const modelName = "gemini-2.5-flash"; // [[memory:5194513]]

export async function targetFunction(
  inputs: InputSanitizerInputs,
): Promise<InputSanitizerOutputs> {
  try {
    const initialState = {
      user_message: inputs.user_message,
      messages: inputs.messages,
      messageWindowSize: inputs.messageWindowSize,
      sanitized_message: undefined,
      is_suspicious: false,
      suspicious_reason: undefined,
      confidence: undefined,
      feedback_message: undefined,
      ai_response: undefined,
    };

    const result = await checkInput(initialState, genAI, modelName);

    return {
      is_suspicious: result.is_suspicious || false,
      sanitized_message: result.sanitized_message || "",
    };
  } catch (error) {
    console.error("Error in target function:", error);
    return {
      is_suspicious: true,
      sanitized_message: "",
    };
  }
}
