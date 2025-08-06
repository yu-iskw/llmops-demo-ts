import { GoogleGenAI } from "@google/genai";
import { runMultiturnSimulation, type ChatCompletionMessage } from "openevals";
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

  // Your application logic - must accept params object with inputs and threadId
  const app = async (params: {
    inputs: ChatCompletionMessage;
    threadId: string;
  }) => {
    const { inputs: nextMessage, threadId } = params;
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
    const answerAgentGraph = CreateAnswerAgentGraphBuilder(
      genAI,
      modelName,
    ).compile({
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

  // Create a custom simulated user using GenAI since we don't have OpenAI configured
  const user = async (params: {
    trajectory: ChatCompletionMessage[];
    turnCounter: number;
  }): Promise<ChatCompletionMessage> => {
    const { trajectory, turnCounter } = params;

    // If we have fixed responses and this is within the range, use them
    if (turnCounter < inputs.messages.length) {
      return inputs.messages[turnCounter];
    }

    // Generate a response using the simulated user prompt
    const contextMessages = trajectory.slice(-4); // Keep last 4 messages for context

    const systemPrompt = `${inputs.simulated_user_prompt}

Based on the conversation context, respond as the user would. Keep responses natural and conversational.`;

    const result = await genAI.models.generateContent({
      model: modelName,
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...contextMessages.map((msg) => ({
          role: msg.role as "user" | "model",
          parts: [{ text: msg.content || "" }],
        })),
        {
          role: "user",
          parts: [
            {
              text: `The assistant just said: "${trajectory[trajectory.length - 1]?.content || ""}". How do you respond as the user?`,
            },
          ],
        },
      ],
    });

    return {
      role: "user",
      content: result.text || "I understand.",
    };
  };

  const result = await runMultiturnSimulation({
    app,
    user,
    maxTurns: 5,
  });

  return result.trajectory;
}
