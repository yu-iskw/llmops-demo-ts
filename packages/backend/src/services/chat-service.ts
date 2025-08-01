import { GoogleGenAI } from "@google/genai";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { createDefaultAgentGraph } from "../agents/default_agent/agent";
import { FinancialAdvisorGraphState } from "../agents/financial_advisor_agent/state";
import { createFinancialAdvisorGraph } from "../agents/financial_advisor_agent/agent";
import { TripPlannerGraphState } from "../agents/trip_planner_agent/state";
import { createTripPlannerGraph } from "../agents/trip_planner_agent/agent";
import { ChatRequest, ChatMessage } from "../models/Chat";
import { AgentType } from "../models/Agent";

// Simple LangGraph-inspired implementation
export class ChatService {
  private compiledGraphs: { [key: string]: any };

  constructor() {
    this.compiledGraphs = {
      default: createDefaultAgentGraph(),
      "financial-advisor": createFinancialAdvisorGraph(),
      "trip-planner": createTripPlannerGraph(),
    };
  }

  public async processMessage(
    message: string,
    history: ChatMessage[] = [],
    agentType: string = "default",
  ): Promise<string> {
    try {
      const compiledGraph = this.compiledGraphs[agentType];
      if (!compiledGraph) {
        return `Error: Agent type \"${agentType}\" not found.`;
      }

      const initialMessages = history.map((msg: ChatMessage) =>
        msg.role === "user"
          ? new HumanMessage(msg.content)
          : new AIMessage(msg.content),
      );

      let initialState: any = {}; // Use any for now, will refine later
      if (agentType === "default") {
        initialState = {
          messages: [...initialMessages, new HumanMessage(message)],
          agentType: agentType,
        };
      } else if (agentType === "financial-advisor") {
        initialState = {
          messages: [...initialMessages, new HumanMessage(message)],
          investment_query: message, // Initialize with the message
        };
      } else if (agentType === "trip-planner") {
        initialState = {
          messages: [...initialMessages, new HumanMessage(message)],
          trip_query: message, // Initialize with the message
        };
      }

      const stream = await compiledGraph.stream(initialState);
      let finalResponse = "";
      for await (const s of stream) {
        // Depending on the agent, the output structure might differ.
        // For now, let's try to extract the last AI message or a specific output.
        if (s.messages && s.messages.length > 0) {
          const latestMessage = s.messages[s.messages.length - 1];
          if (latestMessage._getType() === "ai") {
            finalResponse = latestMessage.content as string;
          } else if (s.itinerary) {
            // For trip planner
            finalResponse = s.itinerary;
          } else if (s.investment_advice) {
            // For financial advisor
            finalResponse =
              s.investment_advice +
              (s.risk_assessment
                ? `\n\nRisk Assessment: ${s.risk_assessment}`
                : "");
          }
        }
      }
      return finalResponse;
    } catch (error) {
      console.error("Error processing message:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  }
}
