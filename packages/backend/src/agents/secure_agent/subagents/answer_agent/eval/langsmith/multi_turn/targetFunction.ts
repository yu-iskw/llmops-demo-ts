import { GoogleGenAI } from "@google/genai";
import {
  createLLMSimulatedUser,
  runMultiturnSimulation,
  type ChatCompletionMessage,
} from "openevals";
import { createGenAIClient } from "@utils/genai";
import { CreateAnswerAgentGraphBuilder } from "@agents/secure_agent/subagents/answer_agent/answerAgentBuilder";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";

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

    // Create and compile the answer agent graph within the app function with a checkpointer
    const answerAgentGraph = CreateAnswerAgentGraphBuilder(genAI, modelName).compile({
      checkpointer: new MemorySaver(),
    });

    const initialState = {
      user_message: nextMessage.content,
      feedback_message: undefined,
      messages: langChainMessages.slice(0, langChainMessages.length - 1),
      messageWindowSize: 5,
      ai_response: undefined,
    };

    const result = await answerAgentGraph.invoke(initialState, {
      configurable: { thread_id: threadId },
    });

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
