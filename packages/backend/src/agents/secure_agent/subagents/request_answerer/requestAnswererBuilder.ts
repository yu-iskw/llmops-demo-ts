import { StateGraph, END, START } from "@langchain/langgraph";
import { RequestAnswererStateAnnotation } from "@agents/secure_agent/subagents/request_answerer/requestAnswererState";
import { answerRequest } from "@agents/secure_agent/subagents/request_answerer/requestAnswererNodes";
import { GoogleGenAI } from "@google/genai";

export function CreateRequestAnswererGraphBuilder(
  genAI: GoogleGenAI,
  modelName: string,
) {
  const workflow = new StateGraph(RequestAnswererStateAnnotation);

  workflow.addNode("answer_request", (state) =>
    answerRequest(state, genAI, modelName),
  );

  // @ts-ignore TS2345
  workflow.addEdge(START, "answer_request");
  // @ts-ignore TS2345
  workflow.addEdge("answer_request", END);

  return workflow;
}
