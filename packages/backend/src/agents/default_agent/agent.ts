import { StateGraph, END } from "@langchain/langgraph";
import { DefaultAgentGraphState, DefaultAgentState } from "./state";
import { callModel } from "./nodes";
import { HumanMessage } from "@langchain/core/messages";

// Conditional Edge: Decide whether to continue or end
function shouldContinue(
  state: DefaultAgentState,
): "end_conversation" {
  // For now, always end after the model call.
  return "end_conversation";
}

export function createDefaultAgentGraph() {
  const workflow = new StateGraph(DefaultAgentGraphState);

  // Add nodes
  workflow.addNode("call_model", callModel);
  workflow.addNode("should_continue", shouldContinue);

  // Define the entry point
  workflow.setEntryPoint("call_model");

  // Add conditional edges
  workflow.addConditionalEdges("call_model", "should_continue", {
    end_conversation: END,
  });

  return workflow.compile();
}
