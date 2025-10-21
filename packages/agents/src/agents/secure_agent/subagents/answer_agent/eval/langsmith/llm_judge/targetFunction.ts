import { CreateAnswerAgentGraphBuilder } from "@agents/secure_agent/subagents/answer_agent/answerAgentBuilder";
import { RequestAnswererInputs, RequestAnswererOutputs } from "./types";
import { getGenAI } from "@utils/genai";
import { MemorySaver } from "@langchain/langgraph";

// Initialize GoogleGenAI client using the centralized utility
const genAI = getGenAI();
const modelName = "gemini-2.5-flash"; // [[memory:5194513]]

// Create and compile the answer agent graph once with a checkpointer
const answerAgentGraph = CreateAnswerAgentGraphBuilder(
  genAI,
  modelName,
).compile({
  checkpointer: new MemorySaver(),
});

export async function targetFunction(
  inputs: RequestAnswererInputs,
): Promise<RequestAnswererOutputs> {
  try {
    const initialState = {
      user_message: inputs.user_message,
      feedback_message: inputs.feedback_message,
      messages: [],
      messageWindowSize: 5,
      ai_response: undefined,
    };

    // Invoke the compiled graph with a configurable thread_id
    const result = await answerAgentGraph.invoke(initialState, {
      configurable: { thread_id: "test-session" },
    });

    return {
      ai_response: result.ai_response || "",
    };
  } catch (error) {
    console.error("Error in target function:", error);
    return {
      ai_response: "An error occurred during request answering evaluation.",
    };
  }
}
