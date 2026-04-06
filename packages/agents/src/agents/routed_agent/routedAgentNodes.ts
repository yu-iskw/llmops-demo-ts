import type { GoogleGenAI } from "@google/genai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { RoutedAgentStateAnnotation } from "./routedAgentState";
import { SpecialistAgentCache } from "./specialistAgentCache";
import { CreateOutputSanitizerGraphBuilder } from "./subagents/output_sanitizer/outputSanitizerBuilder";
import { OutputSanitizerState } from "./subagents/output_sanitizer/outputSanitizerState";
import { extractStringContent } from "../../utils/agentUtilities";
import { logger } from "@llmops-demo/common";

export { classifyRoute } from "./subagents/router/routerNodes";

function buildInvokeMessages(
  state: typeof RoutedAgentStateAnnotation.State,
): Array<HumanMessage | AIMessage | BaseMessage> {
  const windowed = [...(state.messages || [])].slice(-state.messageWindowSize);
  const messages: Array<HumanMessage | AIMessage | BaseMessage> = [
    ...windowed,
    new HumanMessage(state.user_message),
  ];

  if (state.is_sensitive && state.feedback_message) {
    logger.info(
      `RoutedAgent: injecting feedback into prompt (retry_count=${state.retry_count})`,
    );
    messages.push(
      new HumanMessage(
        `Your previous response was flagged as sensitive: "${state.feedback_message}". ` +
          `Please provide a safer response that avoids these issues.`,
      ),
    );
  }

  return messages;
}

function lastAiTextFromResult(messages: BaseMessage[] | undefined): string {
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

async function runSpecialist(
  state: typeof RoutedAgentStateAnnotation.State,
  cache: SpecialistAgentCache,
  specialistModelName: string,
  kind: "trip" | "finance" | "general",
): Promise<Partial<typeof RoutedAgentStateAnnotation.State>> {
  let agent;
  if (kind === "trip") {
    agent = cache.getTripAgent(specialistModelName);
  } else if (kind === "finance") {
    agent = cache.getFinanceAgent(specialistModelName);
  } else {
    agent = cache.getGeneralAgent(specialistModelName);
  }

  const invokeMessages = buildInvokeMessages(state);
  const result = await agent.invoke({
    messages: invokeMessages,
  });

  const outMessages = result.messages as BaseMessage[] | undefined;
  const replyText = lastAiTextFromResult(outMessages);
  const lastAi =
    outMessages?.length &&
    outMessages[outMessages.length - 1]?.getType() === "ai"
      ? (outMessages[outMessages.length - 1] as AIMessage)
      : new AIMessage(replyText || "Sorry, I could not generate a response.");

  const prior = state.messages || [];
  const updatedMessages: BaseMessage[] = [
    ...prior,
    new HumanMessage(state.user_message),
    lastAi,
  ];

  const updatedState: Partial<typeof RoutedAgentStateAnnotation.State> = {
    ai_response: replyText || extractStringContent(lastAi.content),
    messages: updatedMessages,
  };

  if (state.is_sensitive) {
    updatedState.retry_count = state.retry_count + 1;
    updatedState.is_sensitive = false; // Reset for next check
    updatedState.feedback_message = undefined; // Reset for next check
  }

  return updatedState;
}

export const callTripSpecialist = async (
  state: typeof RoutedAgentStateAnnotation.State,
  cache: SpecialistAgentCache,
  specialistModelName: string,
): Promise<Partial<typeof RoutedAgentStateAnnotation.State>> => {
  logger.info("RoutedAgent: trip_specialist (createAgent)");
  return runSpecialist(state, cache, specialistModelName, "trip");
};

export const callFinanceSpecialist = async (
  state: typeof RoutedAgentStateAnnotation.State,
  cache: SpecialistAgentCache,
  specialistModelName: string,
): Promise<Partial<typeof RoutedAgentStateAnnotation.State>> => {
  logger.info("RoutedAgent: finance_specialist (createAgent)");
  return runSpecialist(state, cache, specialistModelName, "finance");
};

export const callGeneralSpecialist = async (
  state: typeof RoutedAgentStateAnnotation.State,
  cache: SpecialistAgentCache,
  specialistModelName: string,
): Promise<Partial<typeof RoutedAgentStateAnnotation.State>> => {
  logger.info("RoutedAgent: general_specialist (createAgent)");
  return runSpecialist(state, cache, specialistModelName, "general");
};

export const callOutputSanitizer = async (
  state: typeof RoutedAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  sanitizerModelName: string,
): Promise<Partial<typeof RoutedAgentStateAnnotation.State>> => {
  logger.info(`RoutedAgent: output_sanitizer (model=${sanitizerModelName})`);
  const outputSanitizerGraph = CreateOutputSanitizerGraphBuilder(
    genAI,
    sanitizerModelName,
  ).compile();

  const initialState: OutputSanitizerState = {
    user_message: state.user_message,
    messages: state.messages,
    ai_response: state.ai_response,
    is_sensitive: false,
    feedback_message: undefined,
    confidence_probability: undefined,
    suspicious_probability: undefined,
    messageWindowSize: state.messageWindowSize,
  };

  const result = await outputSanitizerGraph.invoke(initialState);

  return {
    is_sensitive: result.is_sensitive,
    feedback_message: result.feedback_message,
    confidence_probability: result.confidence_probability,
    suspicious_probability: result.suspicious_probability,
    messages: state.messages,
    ai_response: state.ai_response,
  };
};

export const extractFinalResponse = async (
  state: typeof RoutedAgentStateAnnotation.State,
): Promise<Partial<typeof RoutedAgentStateAnnotation.State>> => {
  logger.info("RoutedAgent: extract_final_response");
  return {
    ai_response: state.ai_response,
  };
};
