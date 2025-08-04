import { AIMessage } from "@langchain/core/messages";
import { DefaultAgentStateAnnotation } from "./state";
import { GoogleGenAI } from "@google/genai";

// Define the function that calls the model
export const callModel = async (
  state: typeof DefaultAgentStateAnnotation.State,
  genAI: GoogleGenAI,
) => {
  try {
    // TODO parameterize model name
    const modelName = "gemini-2.0-flash";
    const contents = [{ role: "user", parts: [{ text: state.user_message }] }];
    const result = await genAI.models.generateContent({
      model: modelName,
      contents,
    });
    const aiMessage = new AIMessage(result.text || "");

    return {
      messages: [aiMessage],
    };
  } catch (error) {
    console.error("Error calling model:", error);
    throw error;
  }
};
