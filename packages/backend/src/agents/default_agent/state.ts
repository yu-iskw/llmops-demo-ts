import { Annotation } from "@langchain/langgraph";


// Graph state
export const DefaultAgentStateAnnotation = Annotation.Root({
  user_message: Annotation<string>,
  messages: Annotation<Array<any>>({ // Add messages channel
    default: () => [],
    reducer: (s: Array<any>, a: Array<any>) => s.concat(a),
  }),
});

// To derive the AgentState type for use in this agent's nodes and graph:
export type DefaultAgentState = typeof DefaultAgentStateAnnotation.State;
