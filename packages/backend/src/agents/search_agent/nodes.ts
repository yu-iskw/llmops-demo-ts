import { SearchAgentState } from "./state";
import {
  GoogleGenAI,
  FunctionDeclaration,
  Part,
  Content,
  Tool,
} from "@google/genai";
import {
  getCurrentTime,
  getCurrentTimeToolDeclaration,
} from "../tools/get_current_time"; // Import both

// A single node that calls the model with the Google Search tool enabled
export const callModelWithSearch = async (
  state: SearchAgentState,
  genAI: GoogleGenAI,
  modelName: string, // Add modelName parameter
) => {
  // Combine Google Search tool with any additional tools provided
  const allTools: Tool[] = [
    { googleSearch: {} },
    // Removed functionDeclarations as multiple tool types are not supported together
    // { functionDeclarations: [getCurrentTimeToolDeclaration] },
  ]; // Include tool by default

  let contents: Content[] = [
    { role: "user", parts: [{ text: state.user_message }] },
  ];

  // Check for function calls and add FunctionResponse if present
  if (state.function_calls && state.function_calls.length > 0) {
    for (const call of state.function_calls) {
      if (call.name === "getCurrentTime") {
        const currentTime = getCurrentTime();
        contents.push({ role: "model", parts: [{ functionCall: call }] });
        contents.push({
          role: "function",
          parts: [
            {
              functionResponse: {
                name: call.name,
                response: { time: currentTime },
              },
            },
          ],
        });
      }
    }
  }

  const result = await genAI.models.generateContent({
    model: modelName, // Use the passed modelName
    contents: contents,
    config: {
      tools: allTools,
    },
  });

  const report = result.text;

  return { report };
};
