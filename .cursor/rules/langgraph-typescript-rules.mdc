---
alwaysApply: true
---
# LangGraph in TypeScript: Comprehensive Guide

This rule provides comprehensive guidelines and best practices for developing with LangGraph in TypeScript, covering basic knowledge, common patterns, and best practices for robust and maintainable applications.

## 1. Basic Concepts and Setup

### 1.1 What is LangGraph?

LangGraph is a library that allows you to build stateful, multi-actor applications with LLMs. It extends LangChain to enable cycles and more complex orchestration by representing your application as a graph of nodes and edges.

* **State:** The shared context or data that flows through the graph. It's updated by nodes.
* **Nodes:** Functions or runnable units that perform operations and update the graph state.
* **Edges:** Transitions between nodes. They can be direct or conditional based on the state.
* **Graph:** The complete workflow defined by nodes and edges.

LangGraph can be used to build two main types of systems:

* **Workflows:** Systems where LLMs and tools are orchestrated through predefined code paths. These are ideal for tasks that can be easily and cleanly decomposed into fixed subtasks. [https://langchain-ai.github.io/langgraphjs/tutorials/workflows/#prompt-chaining]
* **Agents:** Systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks. Agents are suitable for open-ended problems where the number of steps is unpredictable. [https://langchain-ai.github.io/langgraphjs/tutorials/workflows/#prompt-chaining]

### 1.2 Installation

Ensure you have `langchain` and `langgraph` installed:

```bash
pnpm add langchain @langchain/langgraph
pnpm add -D @types/node # if not already installed
```

### 1.3 Defining Your Graph State with TypeScript

Always define a clear TypeScript annotation for your graph state using `Annotation.Root`. This provides strong typing and improves code readability and maintainability. Each field in `Annotation.Root` represents a channel in the graph, and its type is defined using `Annotation<Type>`.

```typescript
// src/agents/<agent_name>/state.ts
import { Annotation } from "@langchain/langgraph";

const AgentGraphState = Annotation.Root({
  topic: Annotation<string>,
  joke: Annotation<string>,
  story: Annotation<string>,
  poem: Annotation<string>,
  combinedOutput: Annotation<string>,
});

// To derive the AgentState type for use in this agent's nodes and graph:
type AgentState = typeof AgentGraphState.State;

// Example usage with StateGraph (within src/agents/<agent_name>/agent.ts or index.ts):
// import { StateGraph } from "@langchain/langgraph";
// import { AgentGraphState } from "./state"; // Import the annotation from state.ts
// const graph = new StateGraph(AgentGraphState);
```

## 2. Defining Nodes

Nodes are the building blocks of your graph. They are typically asynchronous functions that take the current `AgentState` as input and return a `Partial<AgentState>` to update the state.

### 2.1 Node Function Signature

Nodes should clearly define their input and output types.

```typescript
// src/agents/<agent_name>/nodes.ts (or similar location)
import { Annotation, StateGraph, Send } from "@langchain/langgraph";

// Graph state
const StateAnnotation = Annotation.Root({
  topic: Annotation<string>,
  sections: Annotation<Array<any>>,
  completedSections: Annotation<string[]>({
    default: () => [],
    reducer: (a, b) => a.concat(b),
  }),
  finalReport: Annotation<string>,
});

// Worker state (for parallel processing, if applicable)
const WorkerStateAnnotation = Annotation.Root({
  section: Annotation<any>,
  completedSections: Annotation<string[]>({
    default: () => [],
    reducer: (a, b) => a.concat(b),
  }),
});

// Derive the AgentState types for use in this agent's nodes and graph:
type OrchestratorAgentState = typeof StateAnnotation.State;
type WorkerAgentState = typeof WorkerStateAnnotation.State;

// Assuming `llm` is an initialized language model (e.g., from @google/genai, langchain/google_vertexai, etc.)
// And `planner` is an LLM augmented with a schema for planning.
// For example:
// import { GoogleGenerativeAI } from '@google/generative-ai';
// const llm = new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY }).getGenerativeModel({ model: 'gemini-pro' });
// const planner = llm.withStructuredOutput(z.object({ sections: z.array(sectionSchema) }));

// Node to orchestrate the report generation
async function orchestrator(state: OrchestratorAgentState) {
  // Generate queries (example: using a planner LLM to define sections)
  // In a real scenario, `planner` would be an LLM that structures the report sections.
  const reportSections = {
      sections: [
          { name: "Introduction", description: "Overview of LLM scaling laws" },
          { name: "Empirical Studies", description: "Discuss key research findings" },
          { name: "Theoretical Foundations", description: "Underlying principles" },
      ]
  }; // await planner.invoke([...]);

  return { sections: reportSections.sections };
}

// Node for an LLM to generate a specific section of the report (worker node)
async function llmCall(state: WorkerAgentState) {
  // Generate section content (example: using an LLM to write a section)
  // In a real scenario, `llm` would be used to generate content for state.section.
  const sectionContent = `Content for section: ${state.section.name}. Description: ${state.section.description}`; // await llm.invoke([...]);

  // Write the updated section to completed sections
  return { completedSections: [sectionContent] };
}

// Node to synthesize the final report from completed sections
async function synthesizer(state: OrchestratorAgentState) {
  // List of completed sections
  const completedSections = state.completedSections;

  // Format completed sections to a single string for the final report
  const completedReportSections = completedSections.join("\n\n---\n\n");

  return { finalReport: completedReportSections };
}

// Conditional edge function to create llm_call workers that each write a section of the report
function assignWorkers(state: OrchestratorAgentState) {
  // Kick off section writing in parallel via Send() API
  return state.sections.map((section) =>
    new Send("llmCall", { section })
  );
}
```

### 2.2 Modularity and Separation of Concerns

Keep your node functions focused on a single responsibility. This enhances reusability and testability. Consider placing nodes in a dedicated `nodes/` directory or grouping them by their domain.

## 3. Building the Graph

### 3.1 Initializing the Graph

Use `StateGraph` to define your graph with the state annotation. Channels define how parts of the state are updated.

```typescript
// src/agents/<agent_name>/agent.ts or index.ts
import { StateGraph } from "@langchain/langgraph";
import { AgentGraphState } from "./state"; // Import the agent's specific state annotation
import { generateJoke, generateStory, combineOutput } from "./nodes"; // Assuming nodes are in nodes.ts

// When initializing the graph, use AgentGraphState directly as the constructor argument.
const graph = new StateGraph(AgentGraphState);

// Add nodes to the graph
graph.addNode("generate_joke", generateJoke);
graph.addNode("generate_story", generateStory);
graph.addNode("combine_output", combineOutput);
// ... add more nodes
```

### 3.2 Defining Edges

Edges dictate the flow between nodes.

* **Direct Edges:** `addEdge(source, target)`
* **Conditional Edges:** `addConditionalEdges(source, condition_node, branch_map, {name?: string})`
  * `condition_node`: A node that returns a string key, which maps to the next node in `branch_map`.
  * `branch_map`: An object where keys are strings returned by `condition_node` and values are the names of the next nodes.

```typescript
// src/agents/<agent_name>/agent.ts or index.ts (continued)
import { END, StateGraph, Annotation, START } from "@langchain/langgraph";

// Define a new Annotation for conditional branching example
const ConditionalBranchingAnnotation = Annotation.Root({
  aggregate: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
  }),
  which: Annotation<string>({
    reducer: (x: string, y: string) => (y ?? x),
  })
});

// Create the graph
const nodeA2 = (state: typeof ConditionalBranchingAnnotation.State) => {
  console.log(`Adding I'm A to ${state.aggregate}`);
  return { aggregate: [`I'm A`] };
};
const nodeB2 = (state: typeof ConditionalBranchingAnnotation.State) => {
  console.log(`Adding I'm B to ${state.aggregate}`);
  return { aggregate: [`I'm B`] };
};
const nodeC2 = (state: typeof ConditionalBranchingAnnotation.State) => {
  console.log(`Adding I'm C to ${state.aggregate}`);
  return { aggregate: [`I'm C`] };
};
const nodeD2 = (state: typeof ConditionalBranchingAnnotation.State) => {
  console.log(`Adding I'm D to ${state.aggregate}`);
  return { aggregate: [`I'm D`] };
};
const nodeE2 = (state: typeof ConditionalBranchingAnnotation.State) => {
  console.log(`Adding I'm E to ${state.aggregate}`);
  return { aggregate: [`I'm E`] };
};

// Define the route function
function routeCDorBC(state: typeof ConditionalBranchingAnnotation.State): string[] {
  if (state.which === "cd") {
    return ["c", "d"];
  }
  return ["b", "c"];
}

const graphBuilder = new StateGraph(ConditionalBranchingAnnotation)
  .addNode("a", nodeA2)
  // @ts-ignore ts(2345)
  .addEdge(START, "a")
  .addNode("b", nodeB2)
  .addNode("c", nodeC2)
  .addNode("d", nodeD2)
  .addNode("e", nodeE2)
  // Add conditional edges
  // Third parameter is to support visualizing the graph
  .addConditionalEdges("a", routeCDorBC, {
    b: "b",
    c: "c",
    d: "d",
  }, { name: "routeCDorBC"})
  // @ts-ignore ts(2345)
  .addEdge("b", "e")
  // @ts-ignore ts(2345)
  .addEdge("c", "e")
  // @ts-ignore ts(2345)
  .addEdge("d", "e")
  // @ts-ignore ts(2345)
  .addEdge("e", END);

const conditionalGraph = graphBuilder.compile();

// Example usage:
/*
// Invoke the graph with 'bc'
let result1 = await conditionalGraph.invoke({ aggregate: [], which: "bc" });
console.log("Result 1: ", result1);

// Invoke the graph with 'cd'
let result2 = await conditionalGraph.invoke({ aggregate: [], which: "cd" });
console.log("Result 2: ", result2);
*/

// Define entry and exit points for the original example
graph.setEntryPoint("generate_joke");
graph.setFinishPoint("combine_output");

// Add edges
graph.addEdge("generate_joke", "generate_story"); // Direct edge
graph.addEdge("generate_story", "combine_output"); // Direct edge

/* This section was replaced by the more comprehensive example above.
async function decideNextStep(state: AgentState) {
  if (state.generation.includes("final")) {
    return "finish";
  }
  return "tool_call";
}

graph.addNode("decide", decideNextStep);
graph.addConditionalEdges("generate", "decide", {
  tool_call: "call_tool", // If "tool_call" is returned, go to "call_tool" node
  finish: "update_history", // If "finish" is returned, go to "update_history" (and potentially finish)
});
*/
```

### 3.3 Compiling and Invoking the Graph

After defining nodes and edges, compile the graph and invoke it.

```typescript
// src/agents/<agent_name>/agent.ts or index.ts
import { graph } from "./agent"; // Assuming graph is exported from agent.ts

const compiledGraph = graph.compile();

async function runAgent() {
  const initialState = {
    topic: "cats", // Example initial state for the new structure
    joke: undefined,
    story: undefined,
    poem: undefined,
    combinedOutput: undefined,
  };

  const stream = await compiledGraph.stream(initialState);
  for await (const s of stream) {
    console.log(s);
  }
}

runAgent();
```

## 4. Subgraphs

Subgraphs allow you to build complex systems with multiple components that are themselves graphs. A common use case for using subgraphs is building multi-agent systems.

The main question when adding subgraphs is how the parent graph and subgraph communicate, i.e., how they pass the state between each other during the graph execution. There are two scenarios:

* **Parent graph and subgraph share schema keys**: In this case, you can add a node with the compiled subgraph.
* **Parent graph and subgraph have different schemas**: In this case, you have to add a node function that invokes the subgraph; this is useful when the parent graph and the subgraph have different state schemas, and you need to transform state before or after calling the subgraph.

### 4.1 Add a node with the compiled subgraph (shared schema keys)

A common case is for the parent graph and subgraph to communicate over a shared state key (channel). For example, in multi-agent systems, the agents often communicate over a shared messages key.

If your subgraph shares state keys with the parent graph, you can follow these steps to add it to your graph:

1. Define the subgraph workflow (`subgraphBuilder` in the example below) and compile it.
2. Pass compiled subgraph to the `.addNode` method when defining the parent graph workflow.

```typescript
import { StateGraph, Annotation } from "@langchain/langgraph";

const SubgraphStateAnnotation = Annotation.Root({
  foo: Annotation<string>, // note that this key is shared with the parent graph state
  bar: Annotation<string>,
});

const subgraphNode1 = async (state: typeof SubgraphStateAnnotation.State) => {
  return { bar: "bar" };
};

const subgraphNode2 = async (state: typeof SubgraphStateAnnotation.State) => {
  // note that this node is using a state key ('bar') that is only available in the subgraph
  // and is sending update on the shared state key ('foo')
  return { foo: state.foo + state.bar };
};

const subgraphBuilder = new StateGraph(SubgraphStateAnnotation)
  .addNode("subgraphNode1", subgraphNode1)
  .addNode("subgraphNode2", subgraphNode2)
  .addEdge("__start__", "subgraphNode1")
  .addEdge("subgraphNode1", "subgraphNode2");

const subgraph = subgraphBuilder.compile();

// Define parent graph
const ParentStateAnnotation = Annotation.Root({
  foo: Annotation<string>,
});

const node1 = async (state: typeof ParentStateAnnotation.State) => {
  return {
    foo: "hi! " + state.foo,
  };
};

const builder = new StateGraph(ParentStateAnnotation)
  .addNode("node1", node1)
  // note that we're adding the compiled subgraph as a node to the parent graph
  .addNode("node2", subgraph)
  .addEdge("__start__", "node1")
  .addEdge("node1", "node2");

const graph = builder.compile();

// Invoke
const stream = await graph.stream({ foo: "foo" });

for await (const chunk of stream) {
  console.log(chunk);
}
```

### 4.2 Add a node function that invokes the subgraph (different schemas)

For more complex systems, you might want to define subgraphs that have a completely different schema from the parent graph (no shared keys). For example, in a multi-agent RAG system, a search agent might only need to keep track of queries and retrieved documents.

If that's the case for your application, you need to define a node **function that invokes the subgraph**. This function needs to transform the input (parent) state to the subgraph state before invoking the subgraph and transform the results back to the parent state before returning the state update from the node.

```typescript
import { StateGraph, Annotation } from "@langchain/langgraph";

const SubgraphAnnotation = Annotation.Root({
  bar: Annotation<string>, // note that this key is shared with the parent graph state
  baz: Annotation<string>,
});

const subgraphNodeOne = async (state: typeof SubgraphAnnotation.State) => {
  return { baz: "baz" };
};

const subgraphNodeTwo = async (state: typeof SubgraphAnnotation.State) => {
  return { bar: state.bar + state.baz };
};

const subgraphCalledInFunction = new StateGraph(SubgraphAnnotation)
  .addNode("subgraphNode1", subgraphNodeOne)
  .addNode("subgraphNode2", subgraphNodeTwo)
  .addEdge("__start__", "subgraphNode1")
  .addEdge("subgraphNode1", "subgraphNode2")
  .compile();

// Define parent graph
const ParentAnnotation = Annotation.Root({
  foo: Annotation<string>,
});

const nodeOne = async (state: typeof ParentAnnotation.State) => {
  return {
    foo: "hi! " + state.foo,
  };
};

const nodeTwo = async (state: typeof ParentAnnotation.State) => {
  const response = await subgraphCalledInFunction.invoke({
    bar: state.foo,
  });
  return { foo: response.bar };
};

const graphWithFunction = new StateGraph(ParentAnnotation)
  .addNode("node1", nodeOne)
  // note that we're adding the compiled subgraph as a node to the parent graph
  .addNode("node2", nodeTwo)
  .addEdge("__start__", "node1")
  .addEdge("node1", "node2")
  .compile();

// Invoke
const graphWithFunctionStream = await graphWithFunction.stream({ foo: "foo" });
for await (const chunk of graphWithFunctionStream) {
  console.log(chunk);
}
```

## 5. Best Practices

### 5.1 Strong Typing and Validation

* **TypeScript Annotations/Types:** Always use `Annotation.Root` for defining your graph state, and derive specific types (e.g., `AgentState`) using `typeof YourGraphAnnotation.State` for strong typing in your nodes and other components.
* **Runtime Validation:** For production applications, consider using libraries like `zod` to validate input to nodes and the initial state. This catches errors early.

### 5.2 Error Handling

* Implement `try-catch` blocks within your nodes to gracefully handle errors from LLM calls, tool executions, or other external services.
* Consider adding a dedicated error handling node in your graph that logs errors and potentially retries or routes to a human handoff.

### 5.3 Testing

* **Unit Tests for Nodes:** Each node function should be unit-tested independently to ensure its logic is correct and handles various inputs.
* **Integration Tests for Graph Flow:** Test the entire graph flow with different initial states and expected outcomes, especially for conditional paths.
* Use mock data or mock LLM responses for faster and more deterministic tests.

### 5.4 Asynchronous Operations

* LangGraph nodes are typically asynchronous. Ensure you use `async/await` correctly within your nodes and when invoking the graph.

### 5.5 Performance Considerations

* **Batching:** If possible, batch LLM calls or tool executions within a node to reduce latency.
* **Caching:** Implement caching mechanisms for frequently accessed data or LLM responses.
* **Observability:** Integrate logging and monitoring to track graph execution, node performance, and potential bottlenecks.

## 6. Coding Manners and Style

### 6.1 Naming Conventions

* **State Annotation:** Use descriptive names for your `Annotation.Root` definition (e.g., `AgentGraphState`, `FinancialAdvisorState`).
* **State Type:** Derive a type alias from your state annotation (e.g., `type AgentState = typeof AgentGraphState.State;`).
* **Node Names:** Use descriptive, kebab-case names for nodes (e.g., `generate_response`, `tool_lookup`).
* **Edge Names:** Clearly indicate the purpose of conditional edges (e.g., `decide_path`).

### 6.2 Code Structure

* Organize your LangGraph code into logical files. When implementing multiple agents, consider a structure like this:
  * `src/agents/`: Directory for individual agent implementations. Each agent should have its own subdirectory.
    * `src/agents/<agent_name>/`: Directory for a single agent (e.g., `src/agents/financial_advisor/`).
      * `index.ts`: The main entry point for the agent's graph definition and compilation (or `agent.ts`).
      * `state.ts`: Defines the `Annotation.Root` for this agent's specific `AgentState`.
      * `nodes.ts`: Contains the individual node functions for this agent's graph.
      * `tools.ts`: Contains definitions and implementations of any tools this agent uses.

### 6.3 Documentation

* Document your `Annotation.Root` definition and the derived `AgentState` type, explaining each property.
* Add JSDoc comments to each node function, describing its purpose, inputs, and expected state updates.
* Provide an overview of your graph's flow, especially for complex conditional paths, using comments or external documentation.

By following these guidelines, you can build robust, maintainable, and scalable LangGraph applications with TypeScript.
