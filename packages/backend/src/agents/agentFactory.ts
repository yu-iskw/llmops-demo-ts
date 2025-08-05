// Import IAgent from baseAgent where it's defined
import { IAgent } from "./baseAgent";
import { DefaultAgent } from "./default_agent/defaultAgent";
import { ResearchAgent } from "./research_agent/researchAgent";

export type AgentType = "default" | "research";

export interface AgentConfig {
  messageWindowSize?: number;
}

export class AgentFactory {
  private static agents: Map<AgentType, IAgent> = new Map();
  private static agentConfigs: Map<AgentType, AgentConfig> = new Map();

  /**
   * Gets an agent instance by type. Creates one if it doesn't exist.
   */
  public static getAgent(agentType: AgentType, config?: AgentConfig): IAgent {
    const cacheKey = agentType;

    // If config is provided, always create a new instance
    if (config) {
      return this.createAgent(agentType, config);
    }

    // Otherwise, use cached instance if available
    if (!this.agents.has(cacheKey)) {
      this.agents.set(cacheKey, this.createAgent(agentType));
    }
    return this.agents.get(cacheKey)!;
  }

  /**
   * Gets all available agent types with their descriptions
   */
  public static getAvailableAgents(): Array<{
    name: string;
    description: string;
  }> {
    const agentTypes: AgentType[] = ["default", "research"];
    return agentTypes.map((type) => {
      const agent = this.getAgent(type);
      return {
        name: agent.getType(),
        description: agent.getDescription(),
      };
    });
  }

  /**
   * Creates a new agent instance based on type
   */
  private static createAgent(
    agentType: AgentType,
    config?: AgentConfig,
  ): IAgent {
    switch (agentType) {
      case "default":
        return new DefaultAgent(config?.messageWindowSize);
      case "research":
        return new ResearchAgent();
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  /**
   * Clears all cached agents (useful for testing)
   */
  public static clearCache(): void {
    this.agents.clear();
  }
}
