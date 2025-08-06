import { RequestAnswererStateAnnotation } from "./requestAnswererState";
import { GoogleGenAI } from "@google/genai";
import { createConversationContents } from "@utils/agentUtils";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import logger from "@utils/logger";

export const answerRequest = async (
  state: typeof RequestAnswererStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  let allMessages = state.messages || [];
  let userMessage = state.user_message;
  const feedbackMessage = state.feedback_message;

  try {
    // If there's feedback, incorporate it into the user message for refinement
    if (feedbackMessage) {
      userMessage = `Previous feedback: ${feedbackMessage}. Please refine your answer for: ${userMessage}`;
      logger.info(`Answering request with feedback: ${feedbackMessage}`);
    }

    const contents = createConversationContents(
      allMessages,
      userMessage,
      state.messageWindowSize,
    );

    const result = await genAI.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction:
          "You are a helpful AI assistant. Answer the user\'s request in a natural, conversational tone. Avoid providing information about internal processes or classifications.",
      },
    });

    const aiMessage = new AIMessage(result.text || "");

    return {
      ai_response: result.text || "",
      messages: [
        ...(allMessages || []),
        new HumanMessage(userMessage),
        aiMessage,
      ],
      feedback_message: undefined, // Clear feedback after processing
    };
  } catch (error) {
    logger.error("Error answering request:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      ai_response: undefined,
      messages: [
        ...(allMessages || []),
        new HumanMessage(state.user_message),
        new AIMessage(
          `I apologize, but I encountered an error while trying to answer your request: ${errorMessage}. Please try again. If you were providing feedback, please rephrase it. If the issue persists, please contact support.`,
        ),
      ],
    };
  }
};
