import { StateGraph, END, START } from "@langchain/langgraph";
import { callModel, callTool } from "./defaultAgentNodes";
import { DefaultAgentStateAnnotation } from "./defaultAgentState";
import { GoogleGenAI } from "@google/genai";

export function CreateDefaultAgentGraphBuilder(
  genAI: GoogleGenAI,
  modelName: string,
) {
  const workflow = new StateGraph(DefaultAgentStateAnnotation);

  // Add nodes
  workflow.addNode("call_model", (state) => callModel(state, genAI, modelName));
  workflow.addNode("call_tool", (state) => callTool(state));
  // New node to ensure a response is processed before ending
  workflow.addNode("respond", (state) => state);

  // Define a router function to decide the next step
  const shouldCallTool = (state: typeof DefaultAgentStateAnnotation.State) => {
    if (state.function_calls && state.function_calls.length > 0) {
      return "call_tool";
    }
    return "respond"; // Go to the 'respond' node if no tool call
  };

  // Add edges
  workflow
    // @ts-ignore ts(2345)
    .addEdge(START, "call_model")
    // @ts-ignore ts(2345)
    .addConditionalEdges("call_model", shouldCallTool, {
      call_tool: "call_tool",
      respond: "respond", // Modified to go to 'respond' node
    })
    // @ts-ignore ts(2345)
    .addEdge("call_tool", "call_model") // After tool call, go back to model for synthesis
    // @ts-ignore ts(2345)
    .addEdge("respond", END); // After response, end the graph

  return workflow;
}
