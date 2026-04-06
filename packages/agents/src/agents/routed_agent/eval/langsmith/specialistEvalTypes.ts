import { HumanMessage, AIMessage } from "@langchain/core/messages";

/** Inputs for isolated specialist LangSmith eval (aligned with router eval shape). */
export interface SpecialistEvalInputs {
  user_message: string;
  messages: Array<HumanMessage | AIMessage>;
  messageWindowSize: number;
}

/** Model output scored against reference rubric in the dataset. */
export interface SpecialistEvalOutputs {
  ai_response: string;
}
