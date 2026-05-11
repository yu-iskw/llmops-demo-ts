import { CreateAnswerAgentGraphBuilder } from "../../../answerAgentBuilder";
import { RequestAnswererInputs, RequestAnswererOutputs } from "./types";
import { getGenAI } from "../../../../../../../utils/genai";
import { MemorySaver } from "@langchain/langgraph";

const modelName = "gemini-2.5-flash"; // [[memory:5194513]]

let answerAgentGraph:
  | ReturnType<ReturnType<typeof CreateAnswerAgentGraphBuilder>["compile"]>
  | undefined;

function getAnswerAgentGraph(): NonNullable<typeof answerAgentGraph> {
  if (answerAgentGraph != null) {
    return answerAgentGraph;
  }
  const genAI = getGenAI();
  answerAgentGraph = CreateAnswerAgentGraphBuilder(genAI, modelName).compile({
    checkpointer: new MemorySaver(),
  });
  return answerAgentGraph;
}

export async function targetFunction(
  inputs: RequestAnswererInputs,
): Promise<RequestAnswererOutputs> {
  try {
    const graph = getAnswerAgentGraph();
    const initialState = {
      user_message: inputs.user_message,
      feedback_message: inputs.feedback_message,
      messages: [],
      messageWindowSize: 5,
      ai_response: undefined,
    };

    // Invoke the compiled graph with a configurable thread_id
    const result = await graph.invoke(initialState, {
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
