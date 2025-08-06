import { GoogleGenAI } from "@google/genai";
import {
  createLLMSimulatedUser,
  runMultiturnSimulation,
  type ChatCompletionMessage,
} from "openevals";
import { createGenAIClient } from "@utils/genai";
import { answerRequest } from "@agents/secure_agent/subagents/answer_agent/requestAnswererNodes";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const genAI = createGenAIClient();
const modelName = "gemini-2.5-flash"; // [[memory:5194513]]

export async function targetFunction(inputs: {
  messages: ChatCompletionMessage[];
  simulated_user_prompt: string;
}) {
  const history: Record<string, ChatCompletionMessage[]> = {};

  const app = async ({
    inputs: nextMessage,
    threadId,
  }: {
    inputs: ChatCompletionMessage;
    threadId: string;
  }) => {
    if (history[threadId] === undefined) {
      history[threadId] = [];
    }
    history[threadId].push(nextMessage);

    // Convert ChatCompletionMessage to LangChain's BaseMessage format
    const langChainMessages = history[threadId].map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content || "");
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content || "");
      }
      return new HumanMessage(msg.content || ""); // Default or handle other roles if necessary
    });

    const initialState = {
      user_message: nextMessage.content,
      feedback_message: undefined,
      messages: langChainMessages.slice(0, langChainMessages.length - 1), // Pass previous messages
      messageWindowSize: 5,
      ai_response: undefined,
    };

    const result = await answerRequest(initialState, genAI, modelName);

    const responseMessage: ChatCompletionMessage = {
      role: "assistant",
      content: result.ai_response || "",
    };
    history[threadId].push(responseMessage);
    return responseMessage;
  };

  const user = createLLMSimulatedUser({
    system: inputs.simulated_user_prompt,
    model: "gemini-2.5-flash", // [[memory:5194513]]
    fixedResponses: inputs.messages,
  });

  const result = await runMultiturnSimulation({
    app,
    user,
    maxTurns: 5,
  });

  return result.trajectory;
}
