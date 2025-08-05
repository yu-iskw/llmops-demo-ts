import { StateGraph, END, START } from "@langchain/langgraph";
import { InputSanitizerStateAnnotation } from "./inputSanitizerState";
import { checkInput } from "./inputSanitizerNodes";
import { GoogleGenAI } from "@google/genai";

export function CreateInputSanitizerGraphBuilder(
  genAI: GoogleGenAI,
  modelName: string,
) {
  const workflow = new StateGraph(InputSanitizerStateAnnotation);

  workflow.addNode("check_input", (state) => checkInput(state, genAI, modelName));

  // @ts-ignore TS2345
  workflow.addEdge(START, "check_input");
  // @ts-ignore TS2345
  workflow.addEdge("check_input", END);

  return workflow;
}
