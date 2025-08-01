import { GoogleGenAI } from "@google/genai";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";
import { DefaultAgentState } from "./state";

const genAI = new GoogleGenAI({}); // [[memory:4951926]]

// Node: Call the AI model
export const callModel: Runnable<DefaultAgentState, Partial<DefaultAgentState>> = async (state: DefaultAgentState) => {
  try {
    const modelName = state.agentType || "default";
    // Convert messages to content for the model
    const contents = state.messages.map((msg: BaseMessage) => ({
      role: msg._getType() === "human" ? "user" : "model",
      parts: [{ text: msg.content as string }],
    }));

    // Call Gemini API
    const result = await genAI.models.generateContent({ model: modelName, contents });
    const aiMessage = new AIMessage(result.text || '');

    return {
      messages: [aiMessage],
    };
  } catch (error) {
    console.error("Error calling model:", error);
    throw error;
  }
};
