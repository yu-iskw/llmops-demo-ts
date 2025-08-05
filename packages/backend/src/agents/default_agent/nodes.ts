import {
  AIMessage,
  FunctionMessage,
  BaseMessage,
} from "@langchain/core/messages";
import { DefaultAgentStateAnnotation } from "./state";
import {
  GoogleGenAI,
  FunctionCall,
  FunctionCallingConfigMode,
  Content,
} from "@google/genai";
import {
  getCurrentTime,
  getCurrentTimeToolDeclaration,
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
  const toolOutputs = [];

  for (const toolCall of toolCalls) {
    if (toolCall.name === getCurrentTimeToolDeclaration.name) {
      logger.info(`Calling tool: ${toolCall.name} with args:`, toolCall.args);
      const output = getCurrentTime();
      toolOutputs.push(
        new FunctionMessage({
          content: output,
          name: toolCall.name || "",
        }),
      );
    } else {
      logger.warn(`Tool not found: ${toolCall.name}`);
      toolOutputs.push(
        new FunctionMessage({
          content: `Tool not found: ${toolCall.name}`,
          name: toolCall.name || "",
        }),
      );
    }
  }

  return {
    messages: toolOutputs,
  };
};
