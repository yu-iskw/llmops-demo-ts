import { StateGraph, END, START } from "@langchain/langgraph";
import { callModel } from "./nodes";
import { DefaultAgentStateAnnotation, DefaultAgentState } from "./state";

type NodeNames = "call_model";

export function CreateDefaultAgentGraphBuilder() {
  const workflow = new StateGraph(DefaultAgentStateAnnotation);

  // Add nodes
  workflow.addNode("call_model", callModel);
  // Add edges
  workflow
    // @ts-ignore ts(2345)
    .addEdge(START, "call_model")
    // @ts-ignore ts(2345)
    .addEdge("call_model", END);

  return workflow;
}
