import { createFinanceSpecialistAgent } from "./subagents/finance_agent/financeAgent";
import { createGeneralSpecialistAgent } from "./subagents/general_agent/generalAgent";
import { createTripSpecialistAgent } from "./subagents/trip_agent/tripAgent";

type CompiledSpecialistAgent = ReturnType<typeof createTripSpecialistAgent>;

/**
 * Caches compiled LangChain ReactAgents per specialist model name to avoid
 * recompiling createAgent graphs on every message.
 */
export class SpecialistAgentCache {
  private model: string | undefined;
  private tripAgent: CompiledSpecialistAgent | undefined;
  private financeAgent: CompiledSpecialistAgent | undefined;
  private generalAgent: CompiledSpecialistAgent | undefined;

  getTripAgent(specialistModelName: string): CompiledSpecialistAgent {
    this.ensureModel(specialistModelName);
    if (!this.tripAgent) {
      this.tripAgent = createTripSpecialistAgent(specialistModelName);
    }
    return this.tripAgent;
  }

  getFinanceAgent(specialistModelName: string): CompiledSpecialistAgent {
    this.ensureModel(specialistModelName);
    if (!this.financeAgent) {
      this.financeAgent = createFinanceSpecialistAgent(specialistModelName);
    }
    return this.financeAgent;
  }

  getGeneralAgent(specialistModelName: string): CompiledSpecialistAgent {
    this.ensureModel(specialistModelName);
    if (!this.generalAgent) {
      this.generalAgent = createGeneralSpecialistAgent(specialistModelName);
    }
    return this.generalAgent;
  }

  private ensureModel(specialistModelName: string): void {
    if (this.model !== specialistModelName) {
      this.model = specialistModelName;
      this.tripAgent = undefined;
      this.financeAgent = undefined;
      this.generalAgent = undefined;
    }
  }
}
