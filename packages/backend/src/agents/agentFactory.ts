// Import IAgent from baseAgent where it's defined
import { BaseAgent, IAgent } from "./baseAgent";
import { DefaultAgent } from "./default_agent/defaultAgent";
import { ResearchAgent } from "./research_agent/researchAgent";
import { SecureAgent } from "./secure_agent/secureAgent";
import logger from "@utils/logger";

export type AgentType = "default" | "research" | "secure";

export interface AgentConfig {
  messageWindowSize?: number;
}

export interface AgentInfo {
  name: AgentType;
  description: string;
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
  public static getAvailableAgents(): AgentInfo[] {
    const agentTypes: AgentType[] = ["default", "research", "secure"];
    return agentTypes.map((type) => {
      const agent = this.getAgent(type);
      return {
        name: agent.getType() as AgentType,
        description: agent.getDescription(),
      };
    });
  }

  /**
   * Creates a new agent instance based on type
   */
  public static createAgent(
    agentType: AgentType,
    config?: AgentConfig,
  ): IAgent {
    switch (agentType) {
      case "research":
        return new ResearchAgent();
      case "default":
        return new DefaultAgent(config?.messageWindowSize);
      case "secure":
        return new SecureAgent(config?.messageWindowSize);
      default:
        logger.warn(
          `Unknown agent type: ${agentType}. Falling back to default.`,
        );
        return new DefaultAgent();
    }
  }

  /**
   * Clears all cached agents (useful for testing)
   */
  public static clearCache(): void {
    this.agents.clear();
  }
}
