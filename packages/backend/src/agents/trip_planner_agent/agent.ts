import { StateGraph, END } from "@langchain/langgraph";
import { TripPlannerGraphState, TripPlannerState } from "./state";
import {
  extractTripDetails,
  generateItinerary,
} from "./nodes";

// Conditional Edge: Decide whether to generate itinerary
function shouldGenerateItinerary(state: TripPlannerState): "generate_itinerary" | typeof END {
  return state.trip_query ? "generate_itinerary" : END;
}

// Conditional Edge: Decide whether to end
function shouldEndTripPlanner(state: TripPlannerState): typeof END {
  return state.itinerary ? END : END; // For now, always ends
}

export function createTripPlannerGraph() {
  const workflow = new StateGraph(TripPlannerGraphState);

  workflow.addNode("extract_details", extractTripDetails);
  workflow.addNode("generate_itinerary", generateItinerary);
  workflow.addNode("should_generate_itinerary", shouldGenerateItinerary);
  workflow.addNode("should_end_trip_planner", shouldEndTripPlanner);

  workflow.setEntryPoint("extract_details");

  workflow.addConditionalEdges(
    "extract_details",
    "should_generate_itinerary",
    {
      generate_itinerary: "generate_itinerary",
      [END]: END,
    },
  );

  workflow.addConditionalEdges(
    "generate_itinerary",
    "should_end_trip_planner",
    {
      [END]: END,
    },
  );

  return workflow.compile();
}
