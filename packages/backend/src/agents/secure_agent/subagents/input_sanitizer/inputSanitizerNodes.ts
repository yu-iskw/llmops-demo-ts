import { InputSanitizerStateAnnotation } from "./inputSanitizerState";
import { GoogleGenAI, Type } from "@google/genai";
import { createConversationContents } from "@utils/agentUtils";
import logger from "@utils/logger";

export interface InputSanitizerOutput {
  isSuspicious: boolean;
  reason: string;
  confidence: number;
}

export const checkInput = async (
  state: typeof InputSanitizerStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    const contents = createConversationContents(
      state.messages || [],
      state.user_message,
      state.messageWindowSize,
    );

    const result = await genAI.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction:
          'You are an input sanitizer. Classify user messages as \'SAFE\' or \'SUSPICIOUS\'. Provide a reason for the classification and a confidence score (0-1). Respond with a JSON object { "isSuspicious": boolean, "reason": string, "confidence": number }.',
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSuspicious: {
              type: Type.BOOLEAN,
              description: "Whether the input is suspicious",
            },
            reason: {
              type: Type.STRING,
              description: "The reason for the classification",
            },
            confidence: {
              type: Type.NUMBER,
              description:
                "The confidence score for the classification (LOW, MEDIUM, HIGH)",
            },
          },
          required: ["isSuspicious", "reason", "confidence"],
        },
      },
    });

    const parsedResult = JSON.parse(
      result.text || "{}",
    ) as InputSanitizerOutput;
    const isSuspicious = parsedResult.isSuspicious || false;
    const reason = parsedResult.reason || "";
    const confidence = parsedResult.confidence || 0;

    logger.info(
      `Input check result: ${isSuspicious ? "SUSPICIOUS" : "SAFE"}, Reason: ${reason}, Confidence: ${confidence}`,
    );

    return {
      sanitized_message: isSuspicious ? "" : state.user_message,
      is_suspicious: isSuspicious,
      reason: reason,
      confidence: confidence,
      messages: state.messages, // Do not add sanitizer's internal JSON to messages
    };
  } catch (error) {
    logger.error("Error checking input:", error);
    return {
      sanitized_message: "",
      is_suspicious: true,
      messages: state.messages, // Keep original messages
      reason: "Error during sanitization",
      confidence: 0,
    };
  }
};
