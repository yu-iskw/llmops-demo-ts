import { checkOutput } from "@agents/secure_agent/subagents/output_sanitizer/outputSanitizerNodes";
import { createGenAIClient } from "@utils/genai";
import { OutputSanitizerInputs, OutputSanitizerOutputs } from "../types";

// Initialize GoogleGenAI client using the centralized utility
const genAI = createGenAIClient();
const modelName = "gemini-2.5-flash"; // [[memory:5194513]]

export async function targetFunction(
  inputs: OutputSanitizerInputs,
): Promise<OutputSanitizerOutputs> {
  try {
    const initialState = {
      user_message: inputs.user_message,
      ai_response: inputs.ai_response,
      messages: [], // messages are not used by output sanitizer checkOutput function
      messageWindowSize: 5, // messageWindowSize is not used by output sanitizer checkOutput function
      is_sensitive: false,
      feedback_message: undefined,
    };

    const result = await checkOutput(initialState, genAI, modelName);

    return {
      is_sensitive: result.is_sensitive || false,
      reason: result.feedback_message || "",
    };
  } catch (error) {
    console.error("Error in target function:", error);
    return {
      is_sensitive: true,
      reason: "An error occurred during output sanitization evaluation.",
    };
  }
}
