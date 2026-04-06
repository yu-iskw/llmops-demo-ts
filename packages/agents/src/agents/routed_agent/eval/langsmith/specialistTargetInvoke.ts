import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { extractStringContent } from "../../../../utils/agentUtilities";
import type { SpecialistEvalInputs } from "./specialistEvalTypes";

/** Builds the message list passed to `createAgent` invoke (matches routed graph specialists). */
export function buildSpecialistInvokeMessages(
  inputs: SpecialistEvalInputs,
): Array<HumanMessage | AIMessage | BaseMessage> {
  const windowed = [...(inputs.messages || [])].slice(
    -inputs.messageWindowSize,
  );
  return [...windowed, new HumanMessage(inputs.user_message)];
}

/** Returns text from the last AI message in an agent result. */
export function lastAiTextFromMessages(
  messages: BaseMessage[] | undefined,
): string {
  if (!messages?.length) {
    return "";
  }
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const m = messages[index];
    if (m.getType() === "ai") {
      return extractStringContent(m.content);
    }
  }
  return "";
}
