import { StateGraph, END, START } from "@langchain/langgraph";
import { OutputSanitizerStateAnnotation } from "./outputSanitizerState";
import { checkOutput } from "./outputSanitizerNodes";
import { GoogleGenAI } from "@google/genai";

export function CreateOutputSanitizerGraphBuilder(
  genAI: GoogleGenAI,
  modelName: string,
) {
  const workflow = new StateGraph(OutputSanitizerStateAnnotation);

  workflow.addNode("check_output", (state) =>
    checkOutput(state, genAI, modelName),
  );

  // @ts-expect-error TS2345: LangGraph START literal typing
  workflow.addEdge(START, "check_output");
  // @ts-expect-error TS2345: LangGraph node id typing
  workflow.addEdge("check_output", END);

  return workflow;
}
