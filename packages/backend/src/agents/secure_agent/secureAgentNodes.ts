import { SecureAgentStateAnnotation } from "./secureAgentState";
import { GoogleGenAI } from "@google/genai";
import { CreateInputSanitizerGraphBuilder } from "./subagents/input_sanitizer/inputSanitizerBuilder";
import { CreateAnswerAgentGraphBuilder } from "./subagents/answer_agent/answerAgentBuilder";
import { CreateOutputSanitizerGraphBuilder } from "./subagents/output_sanitizer/outputSanitizerBuilder";
import { InputSanitizerState } from "./subagents/input_sanitizer/inputSanitizerState";
import { RequestAnswererState } from "./subagents/answer_agent/requestAnswererState";
import { OutputSanitizerState } from "./subagents/output_sanitizer/outputSanitizerState";
import logger from "../../utils/logger";
import { extractStringContent } from "../../utils/agentUtils";

export const callInputSanitizer = async (
  state: typeof SecureAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  logger.info("Calling Input Sanitizer Subgraph");
  const inputSanitizerGraph = CreateInputSanitizerGraphBuilder(
    genAI,
    modelName,
  ).compile();

  const initialState: InputSanitizerState = {
    user_message: state.user_message,
    messages: state.messages,
    sanitized_message: state.sanitized_message,
    is_suspicious: false,
    suspicious_reason: undefined,
    confidence: undefined,
    ai_response: undefined,
    feedback_message: undefined,
    messageWindowSize: state.messageWindowSize,
  };

  const result = await inputSanitizerGraph.invoke(initialState);

  return {
    sanitized_message: result.sanitized_message,
    is_suspicious: result.is_suspicious,
    suspicious_reason: result.suspicious_reason,
    confidence: result.confidence,
    messages: result.messages,
  };
};

export const callRequestAnswerer = async (
  state: typeof SecureAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  logger.info("Calling Request Answerer Subgraph");
  const requestAnswererGraph = CreateAnswerAgentGraphBuilder(
    genAI,
    modelName,
  ).compile();

  const sanitizedUserMessage = extractStringContent(
    state.sanitized_message || state.user_message,
  );

  const initialState: RequestAnswererState = {
    user_message: sanitizedUserMessage,
    messages: state.messages,
    ai_response: undefined,
    feedback_message: state.feedback_message,
    messageWindowSize: state.messageWindowSize,
  };

  const result = await requestAnswererGraph.invoke(initialState);

  return {
    ai_response: result.ai_response,
    messages: result.messages,
    feedback_message: result.feedback_message,
  };
};

export const callOutputSanitizer = async (
  state: typeof SecureAgentStateAnnotation.State,
  genAI: GoogleGenAI,
  modelName: string,
) => {
  logger.info("Calling Output Sanitizer Subgraph");
  const outputSanitizerGraph = CreateOutputSanitizerGraphBuilder(
    genAI,
    modelName,
  ).compile();

  const initialState: OutputSanitizerState = {
    user_message: state.user_message,
    messages: state.messages,
    ai_response: state.ai_response, // Pass the AI response to the sanitizer
    is_sensitive: false,
    feedback_message: undefined,
    messageWindowSize: state.messageWindowSize,
  };

  const result = await outputSanitizerGraph.invoke(initialState);

  return {
    is_sensitive: result.is_sensitive,
    feedback_message: result.feedback_message,
    messages: state.messages, // Keep the existing messages, don't modify here
    ai_response: state.ai_response, // Keep the AI response as is
  };
};

export const extractFinalResponse = async (
  state: typeof SecureAgentStateAnnotation.State,
) => {
  logger.info("Extracting final response.");
  return {
    ai_response: state.ai_response, // Ensure the final AI response is returned
  };
};
