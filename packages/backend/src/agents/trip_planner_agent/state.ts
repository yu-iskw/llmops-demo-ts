import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const TripPlannerGraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>,
  trip_query: Annotation<string>,
  destination: Annotation<string>,
  duration: Annotation<string>,
  itinerary: Annotation<string>,
});

export type TripPlannerState = typeof TripPlannerGraphState.State;
