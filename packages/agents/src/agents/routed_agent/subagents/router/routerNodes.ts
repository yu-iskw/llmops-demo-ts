import { GoogleGenAI, Type } from "@google/genai";
import { logger } from "@llmops-demo/common";
import { ROUTED_AGENT_ROUTER_MODEL } from "../../routedAgentConstants";
import {
  RoutedAgentStateAnnotation,
  type RoutedDomain,
} from "../../routedAgentState";

interface RouteClassification {
  domain: RoutedDomain;
}

export const classifyRoute = async (
  state: typeof RoutedAgentStateAnnotation.State,
  genAI: GoogleGenAI,
): Promise<Partial<typeof RoutedAgentStateAnnotation.State>> => {
  try {
    const result = await genAI.models.generateContent({
      model: ROUTED_AGENT_ROUTER_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Classify the user's message into exactly one domain: trip (travel, vacations, itineraries, hotels, flights), finance (money, budgeting, investing, taxes, debt, banking), or general (anything else or unclear). User message:\n\n${state.user_message}`,
            },
          ],
        },
      ],
      config: {
        // Gemini 3.x: disable thinking so structured JSON is returned reliably.
        thinkingConfig: { thinkingBudget: 0 },
        systemInstruction:
          'Respond only with JSON: { "domain": "trip" | "finance" | "general" }.',
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            domain: {
              type: Type.STRING,
              description: "One of trip, finance, general",
            },
          },
          required: ["domain"],
        },
      },
    });

    const parsed = JSON.parse(result.text || "{}") as RouteClassification;
    const raw = parsed.domain;
    const route: RoutedDomain =
      raw === "trip" || raw === "finance" || raw === "general"
        ? raw
        : "general";

    logger.info(`RoutedAgent classify_route: ${route}`);

    return { route };
  } catch (error) {
    logger.error("RoutedAgent classify_route error:", error);
    return { route: "general" };
  }
};
