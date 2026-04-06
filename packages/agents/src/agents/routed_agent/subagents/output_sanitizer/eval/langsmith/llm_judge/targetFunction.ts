import { checkOutput } from "../../../outputSanitizerNodes";
import { getGenAI } from "../../../../../../../utils/genai";
import {
  OutputSanitizerInputs,
  OutputSanitizerOutputs,
} from "../../../../../../secure_agent/subagents/output_sanitizer/eval/langsmith/types";
import { ROUTED_AGENT_SANITIZER_MODEL } from "../../../../../routedAgentConstants";

const genAI = getGenAI();

export async function targetFunction(
  inputs: OutputSanitizerInputs,
): Promise<OutputSanitizerOutputs> {
  try {
    const initialState = {
      user_message: inputs.user_message,
      ai_response: inputs.ai_response,
      messages: [],
      messageWindowSize: 5,
      is_sensitive: false,
      feedback_message: undefined,
      confidence_probability: undefined,
      suspicious_probability: undefined,
    };

    const result = await checkOutput(
      initialState,
      genAI,
      ROUTED_AGENT_SANITIZER_MODEL,
    );

    return {
      is_sensitive: result.is_sensitive || false,
      reason: result.feedback_message || "",
      confidence_probability: result.confidence_probability,
      suspicious_probability: result.suspicious_probability,
    };
  } catch (error) {
    console.error("Error in target function:", error);
    return {
      is_sensitive: true,
      reason: "An error occurred during output sanitization evaluation.",
      confidence_probability: undefined,
      suspicious_probability: undefined,
    };
  }
}
