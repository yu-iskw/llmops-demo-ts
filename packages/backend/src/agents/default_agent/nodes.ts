import { AIMessage } from "@langchain/core/messages";
import { DefaultAgentStateAnnotation } from "./state";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  vertexai: true,
  project: "ubie-yu-sandbox",
  location: "us-central1",
}); // [[memory:4951926]]

// Define the function that calls the model
export const callModel = async (state: typeof DefaultAgentStateAnnotation.State) => {
  try {
    // TODO parameterize model name
    const modelName = "gemini-2.0-flash";
    const contents = [{ role: "user", parts: [{ text: state.user_message }] }];
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
