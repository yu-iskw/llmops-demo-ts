import { InputSanitizerStateAnnotation } from "./inputSanitizerState";
import { GoogleGenAI, Type } from "@google/genai";
import { createConversationContents } from "@utils/agentUtils";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import logger from "@utils/logger";
import { extractStringContent } from "@utils/agentUtils";

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
      isSuspicious: isSuspicious,
      reason: reason,
      confidence: confidence,
      messages: [
        ...(state.messages || []),
        new HumanMessage(state.user_message),
        new AIMessage(result.text || ""),
      ],
    };
  } catch (error) {
    logger.error("Error checking input:", error);
    return {
      sanitized_message: "",
      isSuspicious: true,
      messages: [
        ...(state.messages || []),
        new HumanMessage(state.user_message),
        new AIMessage(
          "I apologize, but I encountered an error while sanitizing your request. It will be treated as suspicious.",
        ),
      ],
      reason: "Error during sanitization",
      confidence: 0,
    };
  }
};
