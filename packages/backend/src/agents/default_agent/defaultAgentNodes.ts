import {
  AIMessage,
  FunctionMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { DefaultAgentStateAnnotation } from "./defaultAgentState";
import {
  GoogleGenAI,
  FunctionCall,
  FunctionCallingConfigMode,
  Content,
} from "@google/genai";
import {
  getCurrentTimeToolDeclaration,
  executeToolCalls,
} from "../tools/getCurrentTime";
import logger from "../../utils/logger";

// Define the function that calls the model
export const callModel = async (
  state: typeof DefaultAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  try {
    const allMessages = state.messages || [];
    const historyContent: Content[] = allMessages
      .map((msg): Content | undefined => {
        if (msg._getType() === "human") {
          return { role: "user", parts: [{ text: msg.content as string }] };
        } else if (msg._getType() === "ai") {
          return { role: "model", parts: [{ text: msg.content as string }] };
        } else if (msg._getType() === "function") {
          const functionMsg = msg as FunctionMessage;
          return {
            role: "function",
            parts: [
              {
                functionResponse: {
                  name: functionMsg.name,
                  response: { value: functionMsg.content as string },
                },
              },
            ],
          };
        }
        return undefined;
      })
      .filter((item): item is Content => item !== undefined);

    // Append the current user message
    const contents: Content[] = [
      ...historyContent,
      { role: "user", parts: [{ text: state.user_message }] },
    ];

    logger.info("Sending request to model with tools:", [{ functionDeclarations: [getCurrentTimeToolDeclaration] }]);
    logger.info("Tool declaration:", getCurrentTimeToolDeclaration);

    const result = await genAI.models.generateContent({
      model: modelName,
      contents,
      tools: [{ functionDeclarations: [getCurrentTimeToolDeclaration] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
        },
      },
    } as any); // Cast to any temporarily to bypass type error, will investigate further if this works

    logger.info("Model response:", result);
    logger.info("Function calls:", result.functionCalls);

    if (result.functionCalls && result.functionCalls.length > 0) {
      logger.info("Model returned function calls:", result.functionCalls);
      return {
        function_calls: result.functionCalls,
      };
    } else {
      const aiMessage = new AIMessage(result.text || "");
      logger.info("Model returned text response:", result.text);
      return {
        messages: [aiMessage],
      };
    }
  } catch (error) {
    logger.error("Error calling model:", error);
    throw error;
  }
};

export const callTool = async (
  state: typeof DefaultAgentStateAnnotation.State,
) => {
  const toolCalls = state.function_calls || [];
  const toolOutputs = executeToolCalls(toolCalls);

  return {
    messages: toolOutputs,
  };
};
