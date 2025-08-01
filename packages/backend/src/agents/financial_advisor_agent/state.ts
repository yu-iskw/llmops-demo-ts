import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const FinancialAdvisorGraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>,
  investment_query: Annotation<string>,
  investment_advice: Annotation<string>,
  risk_assessment: Annotation<string>,
});

export type FinancialAdvisorState = typeof FinancialAdvisorGraphState.State;
