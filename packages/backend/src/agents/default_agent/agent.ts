import { StateGraph, END, START } from "@langchain/langgraph";
import { callModel } from "./nodes";
import { DefaultAgentStateAnnotation } from "./state";
import { GoogleGenAI } from "@google/genai";

export function CreateDefaultAgentGraphBuilder(genAI: GoogleGenAI, modelName: string) {
  const workflow = new StateGraph(DefaultAgentStateAnnotation);

  // Add nodes
  workflow.addNode("call_model", (state) => callModel(state, genAI, modelName));

  // Add edges
  workflow
    // @ts-ignore ts(2345)
    .addEdge(START, "call_model")
    // @ts-ignore ts(2345)
    .addEdge("call_model", END);

  return workflow;
}
