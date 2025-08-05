import {
  OutputSanitizerStateAnnotation,
  OutputSanitizerOutput,
} from "./outputSanitizerState";
import { GoogleGenAI, Type } from "@google/genai";
import { createConversationContents } from "@utils/agentUtils";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import logger from "@utils/logger";
import { extractStringContent } from "@utils/agentUtils";

export const checkOutput = async (
  state: typeof OutputSanitizerStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    const contents = createConversationContents(
      state.messages || [],
      state.user_message, // Use user_message as the input for sanitization
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
      messages: [
        ...(state.messages || []),
        new HumanMessage(state.user_message), // Use user_message for the HumanMessage
        new AIMessage(JSON.stringify(parsedResult)),
      ],
    };
  } catch (error) {
    logger.error("Error checking output:", error);
    return {
      is_sensitive: true,
      feedback_message:
        "An error occurred while checking the output for sensitive information.",
      messages: [
        ...(state.messages || []),
        new HumanMessage(state.user_message),
        new AIMessage(
          "I apologize, but I encountered an error while sanitizing the response. It will be treated as sensitive.",
        ),
      ],
    };
  }
};
