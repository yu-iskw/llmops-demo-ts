import { StateGraph, END } from "@langchain/langgraph";
import { FinancialAdvisorGraphState, FinancialAdvisorState } from "./state";
import {
  validateInvestmentQuery,
  provideInvestmentAdvice,
  assessRisk,
} from "./nodes";

// Conditional Edge: Decide whether to provide advice
function shouldProvideAdvice(state: FinancialAdvisorState): "provide_advice" | typeof END {
  return state.investment_query ? "provide_advice" : END;
}

// Conditional Edge: Decide whether to assess risk
function shouldAssessRisk(state: FinancialAdvisorState): "assess_risk" | typeof END {
  return state.investment_advice ? "assess_risk" : END;
}

// Conditional Edge: Decide whether to end
function shouldEndFinancialAdvisor(state: FinancialAdvisorState): typeof END {
  return state.risk_assessment ? END : END; // Always ends for now, can be extended
}

export function createFinancialAdvisorGraph() {
  const workflow = new StateGraph(FinancialAdvisorGraphState);

  workflow.addNode("validate_query", validateInvestmentQuery);
  workflow.addNode("provide_advice", provideInvestmentAdvice);
  workflow.addNode("assess_risk", assessRisk);
  workflow.addNode("should_provide_advice", shouldProvideAdvice);
  workflow.addNode("should_assess_risk", shouldAssessRisk);
  workflow.addNode("should_end_financial_advisor", shouldEndFinancialAdvisor);

  workflow.setEntryPoint("validate_query");

  workflow.addConditionalEdges(
    "validate_query",
    "should_provide_advice",
    {
      provide_advice: "provide_advice",
      [END]: END,
    },
  );

  workflow.addConditionalEdges(
    "provide_advice",
    "should_assess_risk",
    {
      assess_risk: "assess_risk",
      [END]: END,
    },
  );

  workflow.addConditionalEdges(
    "assess_risk",
    "should_end_financial_advisor",
    {
      [END]: END,
    },
  );

  return workflow.compile();
}
