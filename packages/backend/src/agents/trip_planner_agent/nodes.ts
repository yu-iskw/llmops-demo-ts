import { TripPlannerState } from "./state";
import { GoogleGenAI } from "@google/genai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";

const genAI = new GoogleGenAI({}); // [[memory:4951926]]

export const extractTripDetails: Runnable<TripPlannerState, Partial<TripPlannerState>> = async (state: TripPlannerState) => {
  // In a real scenario, this would use an LLM to extract details like destination and duration.
  // For now, it's a placeholder that assumes a simple query format.
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && lastMessage._getType() === "human") {
    const query = (lastMessage.content as string).toLowerCase();
    let destination = "";
    let duration = "";

    if (query.includes("to paris")) {
      destination = "Paris";
    }
    if (query.includes("for 3 days")) {
      duration = "3 days";
    }
    return { trip_query: lastMessage.content as string, destination, duration };
  }
  return { trip_query: "", destination: "", duration: "" };
};

export const generateItinerary: Runnable<TripPlannerState, Partial<TripPlannerState>> = async (state: TripPlannerState) => {
  const prompt = `Plan a detailed itinerary for a trip to ${state.destination} for ${state.duration}. Include daily activities and recommendations.\nItinerary:`;
  try {
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const result = await genAI.models.generateContent({ model: "gemini-1.5-flash", contents });
    const aiMessage = new AIMessage(result.text || '');
    return { itinerary: aiMessage.content as string, messages: [aiMessage] };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
};
