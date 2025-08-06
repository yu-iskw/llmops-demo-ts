import {
  OutputSanitizerStateAnnotation,
  OutputSanitizerOutput,
} from "./outputSanitizerState";
import { GoogleGenAI, Type } from "@google/genai";
import { createConversationContents } from "@utils/agentUtils";
import logger from "@utils/logger";

export const checkOutput = async (
  state: typeof OutputSanitizerStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    const contents = createConversationContents(
      state.messages || [],
      state.ai_response || "", // Use ai_response as the input for sanitization, with default
      state.messageWindowSize,
    );

    const result = await genAI.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction:
          "You are an output sanitizer. Classify the given text as 'SAFE' or 'SENSITIVE'. If sensitive, provide a brief reason. Respond with a JSON object { \"isSensitive\": boolean, \"reason\": string }.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSensitive: {
              type: Type.BOOLEAN,
              description: "Whether the output is sensitive",
            },
            reason: {
              type: Type.STRING,
              description: "The reason for the classification",
            },
          },
          required: ["isSensitive", "reason"],
        },
      },
    });

    const parsedResult = JSON.parse(
      result.text || "{}",
    ) as OutputSanitizerOutput;
    const isSensitive = parsedResult.isSensitive;
    let feedbackMessage = isSensitive ? parsedResult.reason : undefined;

    logger.info(
      `Output check result: ${isSensitive ? "SENSITIVE" : "SAFE"}, Reason: ${feedbackMessage || "N/A"}`,
    );

    return {
      is_sensitive: isSensitive,
      feedback_message: feedbackMessage,
      ai_response: state.ai_response, // Return original AI response
      messages: state.messages, // Keep the existing messages, do not modify here
    };
  } catch (error) {
    logger.error("Error checking output:", error);
    return {
      is_sensitive: true,
      feedback_message:
        "An error occurred while checking the output for sensitive information.",
      ai_response: state.ai_response, // Return original AI response
      messages: state.messages, // Keep original messages
    };
  }
};
