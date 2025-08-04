import { IAgent } from "./IAgent";
import { DefaultAgent } from "./default_agent/DefaultAgent";
import { ResearchAgent } from "./research_agent/ResearchAgent";

export type AgentType = "default" | "research";

export class AgentFactory {
  private static agents: Map<AgentType, IAgent> = new Map();

  /**
   * Gets an agent instance by type. Creates one if it doesn't exist.
   */
  public static getAgent(agentType: AgentType): IAgent {
    if (!this.agents.has(agentType)) {
      this.agents.set(agentType, this.createAgent(agentType));
    }
    return this.agents.get(agentType)!;
  }

  /**
   * Gets all available agent types with their descriptions
   */
  public static getAvailableAgents(): Array<{ name: string; description: string }> {
    const agentTypes: AgentType[] = ["default", "research"];
    return agentTypes.map(type => {
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
  private static createAgent(agentType: AgentType): IAgent {
    switch (agentType) {
      case "default":
        return new DefaultAgent();
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
