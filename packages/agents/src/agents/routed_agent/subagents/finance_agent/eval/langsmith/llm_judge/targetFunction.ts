import type { BaseMessage } from "@langchain/core/messages";
import { createFinanceSpecialistAgent } from "../../../financeAgent";
import { ROUTED_AGENT_SPECIALIST_EVAL_MODEL } from "../../../../../routedAgentConstants";
import {
  buildSpecialistInvokeMessages,
  lastAiTextFromMessages,
} from "../../../../../eval/langsmith/specialistTargetInvoke";
import type { SpecialistEvalInputs, SpecialistEvalOutputs } from "./types";

export async function targetFunction(
  inputs: SpecialistEvalInputs,
): Promise<SpecialistEvalOutputs> {
  try {
    const agent = createFinanceSpecialistAgent(
      ROUTED_AGENT_SPECIALIST_EVAL_MODEL,
    );
    const invokeMessages = buildSpecialistInvokeMessages(inputs);
    const result = await agent.invoke({ messages: invokeMessages });
    const messages = result.messages as BaseMessage[] | undefined;
    const ai_response = lastAiTextFromMessages(messages);
    return { ai_response: ai_response || "" };
  } catch (error) {
    console.error("Error in finance specialist target function:", error);
    return {
      ai_response: "An error occurred during finance specialist evaluation.",
    };
  }
}
