# Module 02: Beginner Agents - My First LLM Agent

**Target Audience:** Persona 1 (Beginners)

**Prerequisites:**

- Completed [Module 01: Environment Setup](./01_setup.md)
- Basic understanding of TypeScript/JavaScript
- Familiarity with text editors and command line
- `pnpm` installed (if not already):
  - `npm install -g pnpm` or `corepack enable pnpm`

This module teaches you the fundamentals of LLM application development by modifying existing agents. You'll learn how to customize agent behavior through prompt engineering, logic modifications, and advanced features like custom tools and structured outputs.

## Learning Objectives

By the end of this module, you will be able to:

1. Understand how system instructions control LLM behavior
2. Modify agent personalities and response styles
3. Customize agent logic for specific use cases
4. Implement custom tools (function calling) for agents
5. Force agents to return structured data (JSON)
6. Build a ReAct agent using `createAgent`
7. Test your modifications through the web interface

## Module 1: Customizing Agent Persona

### Concept: System Instructions & Roles

**System instructions** are special prompts that tell the LLM how to behave. They set the agent's personality, tone, and capabilities. Think of them as the "job description" for your AI assistant.

In this codebase, system instructions are defined in the `callModel` function within each agent's node file.

### Hands-on Exercise: Transform Default Agent into a Pirate

Let's modify the Default Agent to respond like a pirate!

1. **Open the Default Agent nodes file**:

   ```bash
   code packages/agents/src/agents/default_agent/defaultAgentNodes.ts
   ```

   Or open it in your preferred editor:

   ```text
   packages/agents/src/agents/default_agent/defaultAgentNodes.ts
   ```

2. **Locate the `callModel` function** (around line 12-74)

3. **Find the `systemInstruction`** (around line 43-44):

   ```typescript
   systemInstruction:
     "You are a helpful AI assistant. You are knowledgeable, friendly, and always try to provide accurate and useful information. When users ask questions, respond in a clear, helpful manner.",
   ```

4. **Replace it with a pirate persona**:

   ```typescript
   systemInstruction:
     "You are a friendly pirate AI assistant. You speak like a pirate from the golden age of piracy, using phrases like 'Ahoy!', 'Arr!', 'Shiver me timbers!', and 'Yo ho ho!'. You are knowledgeable and helpful, but always maintain your pirate persona. When users ask questions, respond in character as a pirate while still providing accurate and useful information.",
   ```

5. **Save the file**

6. **Rebuild the agents package**:

   ```bash
   cd packages/agents
   pnpm build
   ```

   Or from the root directory:

   ```bash
   pnpm build
   ```

7. **Restart the backend** (if it's running):
   - Stop the backend server (Ctrl+C)
   - Restart it: `cd packages/backend && pnpm dev`

8. **Test your changes**:
   - Open `http://localhost:4200` in your browser
   - Select "Default Agent" from the dropdown
   - Send a message like: "Hello, how are you?"
   - You should receive a response in pirate speak!

### Exercise: Try Different Personas

Now that you've seen how it works, try creating different personas:

- **Technical Expert**: Modify the system instruction to make the agent respond like a senior software engineer, using technical terminology and focusing on best practices.

- **Poet**: Make the agent respond in verse, always ending responses with a short poem.

- **Your Own Creation**: Come up with your own unique persona!

**Challenge**: Can you make the agent switch personas based on a keyword in the user's message? (Hint: You'll need to modify the logic before the `systemInstruction` is set)

## Module 2: Enhancing Research Logic

### Concept: Tool Use & Planning

The Research Agent uses a **multi-step workflow**:

1. **Plan Queries**: Generate search queries based on the user's question
2. **Execute Searches**: Run those queries using Google Search Tool
3. **Synthesize Results**: Combine search results into a comprehensive answer

This is a common pattern in LLM applications: break complex tasks into smaller steps, execute them, then combine the results.

### Hands-on Exercise: Force Minimum Search Queries

Currently, the Research Agent might generate only 1-2 search queries. Let's modify it to always generate at least 3 queries for better coverage.

1. **Open the Research Agent nodes file**:

   ```bash
   code packages/agents/src/agents/research_agent/researchAgentNodes.ts
   ```

   Or open:

   ```text
   packages/agents/src/agents/research_agent/researchAgentNodes.ts
   ```

2. **Locate the `planQueries` function** (around line 51-94)

3. **Find the prompt** (around line 57):

   ```typescript
   const prompt = `Return the queries as a JSON array of strings under the key "queries".\nUser question: ${state.user_message}\nExample: { "queries": ["weather in Tokyo tomorrow", "weather in London tomorrow"] }`;
   ```

4. **Modify the prompt to enforce minimum queries**:

   ```typescript
   const prompt = `Return the queries as a JSON array of strings under the key "queries". You MUST generate at least 3 distinct search queries to ensure comprehensive coverage of the topic.\nUser question: ${state.user_message}\nExample: { "queries": ["weather in Tokyo tomorrow", "weather in London tomorrow", "weather forecast accuracy"] }`;
   ```

5. **Add validation logic** after parsing (around line 74):

   ```typescript
   const queries = jsonString ? JSON.parse(jsonString).queries : [];

   // Ensure at least 3 queries
   if (queries.length < 3) {
     logger.warn(
       `Only ${queries.length} queries generated, expected at least 3. Adding default queries.`,
     );
     // Add generic queries if needed
     while (queries.length < 3) {
       queries.push(
         `${state.user_message} - perspective ${queries.length + 1}`,
       );
     }
   }
   ```

6. **Save the file**

7. **Rebuild and restart** (same steps as Module 1)

8. **Test your changes**:
   - Select "Research Agent" from the dropdown
   - Ask a question like: "What are the benefits of renewable energy?"
   - Check the backend logs to see multiple search queries being executed

### Exercise: Improve Query Quality

Try these enhancements:

- **Add query diversity**: Modify the prompt to ensure queries cover different aspects (e.g., "benefits", "costs", "implementation")

- **Add query validation**: Check if queries are too similar and merge duplicates

- **Add query prioritization**: Sort queries by importance or expected relevance

## Module 3: Implementing Custom Tools

### Concept: Function Calling

**Function calling** (or tool use) allows LLMs to interact with external code and APIs. Instead of just generating text, the model can generate structured calls to functions you define.

The `DefaultAgent` has a `call_tool` node, but it might be inactive. Let's enable it and add a custom tool.

### Hands-on Exercise: Add a Calculator Tool

1. **Define the Tool**: Create a new file for your tool.

   Create `packages/agents/src/tools/calculator.ts`:

   ```typescript
   import { FunctionDeclaration, SchemaType } from "@google/genai";

   export const calculatorToolDeclaration: FunctionDeclaration = {
     name: "calculator",
     description:
       "Perform basic arithmetic operations (add, subtract, multiply, divide).",
     parameters: {
       type: SchemaType.OBJECT,
       properties: {
         operation: {
           type: SchemaType.STRING,
           description:
             "The operation to perform: 'add', 'subtract', 'multiply', 'divide'.",
         },
         a: {
           type: SchemaType.NUMBER,
           description: "The first number.",
         },
         b: {
           type: SchemaType.NUMBER,
           description: "The second number.",
         },
       },
       required: ["operation", "a", "b"],
     },
   };

   export function executeCalculator(
     operation: string,
     a: number,
     b: number,
   ): number {
     switch (operation) {
       case "add":
         return a + b;
       case "subtract":
         return a - b;
       case "multiply":
         return a * b;
       case "divide":
         return a / b;
       default:
         throw new Error("Unknown operation");
     }
   }
   ```

2. **Register the Tool in Default Agent**:

   Open `packages/agents/src/agents/default_agent/defaultAgentNodes.ts`.

   Import your tool:

   ```typescript
   import {
     calculatorToolDeclaration,
     executeCalculator,
   } from "../../tools/calculator";
   ```

   Update the `tools` config in `callModel`:

   ```typescript
   tools: [{ functionDeclarations: [getCurrentTimeToolDeclaration, calculatorToolDeclaration] }],
   ```

3. **Handle Tool Execution**:

   In `callTool` (or the function that handles tool execution), add logic to run your calculator:

   ```typescript
   // Inside the loop that processes tool calls
   if (toolCall.name === "calculator") {
     const { operation, a, b } = toolCall.args;
     const result = executeCalculator(operation, a, b);
     // Return the result to the model...
   }
   ```

4. **Rebuild and Restart**.

5. **Test**: Ask "What is 123 multiplied by 456?". The agent should use the tool and give the correct answer.

## Module 4: Working with Structured Outputs

### Concept: Structured Output (JSON Mode)

Sometimes you need the LLM to output data in a specific format (like JSON) for your application to process, rather than free text. Gemini supports **response schemas** to enforce this.

### Hands-on Exercise: Extract User Info as JSON

Let's modify the Default Agent (or create a temporary test function) to extract user information.

1. **Modify `callModel` in Default Agent**:

   In `packages/agents/src/agents/default_agent/defaultAgentNodes.ts`.

   Import `SchemaType`:

   ```typescript
   import { SchemaType } from "@google/genai";
   ```

2. **Update the Config**:

   Change the `responseMimeType` and `responseSchema`:

   ```typescript
   const result = await genAI.models.generateContent({
     model: modelName,
     contents,
     config: {
       responseMimeType: "application/json",
       responseSchema: {
         type: SchemaType.OBJECT,
         properties: {
           name: { type: SchemaType.STRING, description: "User's name" },
           intent: {
             type: SchemaType.STRING,
             description: "User's intent or goal",
           },
           sentiment: {
             type: SchemaType.STRING,
             description:
               "Sentiment of the message (positive, negative, neutral)",
           },
         },
         required: ["intent", "sentiment"],
       },
       systemInstruction:
         "You are an entity extractor. Analyze the user's message and extract the required fields in JSON.",
     },
   });
   ```

   _Note: This will replace the normal chat behavior. You might want to create a separate "Extraction Agent" for this or toggle it with a flag._

3. **Rebuild and Test**:

   Send a message: "I'm frustrated that my order hasn't arrived yet. My name is John."

   The response should be a JSON string like:

   ```json
   {
     "name": "John",
     "intent": "check order status",
     "sentiment": "negative"
   }
   ```

## Module 5: Understanding Agent State

### Concept: State Management in LangGraph

Agents use **state** to track information throughout the conversation. The state is passed between nodes and updated as the agent processes the request.

### Explore Default Agent State

1. **Open the state definition**:

   ```text
   packages/agents/src/agents/default_agent/defaultAgentState.ts
   ```

2. **Examine the state structure**:

   ```typescript
   const DefaultAgentStateAnnotation = Annotation.Root({
     user_message: Annotation<string>,
     messages: Annotation<Array<BaseMessage>>,
     function_calls: Annotation<Array<FunctionCall>>,
     messageWindowSize: Annotation<number>,
   });
   ```

   - `user_message`: The current user input
   - `messages`: Conversation history (HumanMessage, AIMessage, FunctionMessage)
   - `function_calls`: Tools the model wants to call
   - `messageWindowSize`: How many past messages to include

3. **Try modifying `messageWindowSize`**:

   In `defaultAgent.ts`, change the constructor:

   ```typescript
   constructor(messageWindowSize: number = 5) {  // Changed from 3 to 5
   ```

   This increases the conversation context the agent remembers.

### Exercise: Add Custom State Fields

Try adding a new field to track something specific:

1. Add a `user_mood` field to track sentiment
2. Add a `conversation_topic` field to track the main topic
3. Modify nodes to update these fields

## Module 6: Testing Your Modifications

### Best Practices for Testing

1. **Start Simple**: Test with basic queries first
   - "Hello"
   - "What is 2+2?"
   - "Tell me a joke"

2. **Test Edge Cases**: Try unusual inputs
   - Very long messages
   - Empty messages
   - Special characters

3. **Check Logs**: Monitor backend console output for errors or unexpected behavior

4. **Compare Before/After**: Keep the original code commented out so you can compare behavior

### Debugging Tips

- **Check TypeScript compilation**: Run `pnpm build` to catch type errors
- **Check runtime logs**: Backend console shows detailed execution flow
- **Use browser DevTools**: Network tab shows API requests/responses
- **Test in isolation**: Use the CLI to test agents directly (see below)

### Testing via CLI

You can test agents directly without the web interface:

```bash
# Test Default Agent
pnpm --filter @llmops-demo-ts/agents cli default-agent run -t "Your message here"

# Test Research Agent
pnpm --filter @llmops-demo-ts/agents cli research-agent run -t "Your research question"
```

## Module 7: Advanced - ReAct Agent with `createAgent`

### Concept: The ReAct Pattern

**ReAct (Reasoning + Acting)** is a paradigm where the model explicitly plans its actions (Reasoning), executes them using tools (Acting), and then observes the results. This loop continues until the task is complete.

While LangGraph gives you full control over the graph structure, LangChain provides a high-level API called `createAgent` that pre-configures a robust ReAct loop for you.

### Hands-on Exercise: Build a Simple ReAct Agent

In this exercise, we'll create a standalone script to demonstrate `createAgent`. Note that this uses the **LangChain** wrapper libraries (`@langchain/google-vertexai` and `langchain`), which provide a higher-level abstraction than the core `@google/genai` SDK used in other modules.

1. **Create a new file**: `packages/agents/src/simple-react-agent.ts`

2. **Add the following code**:

   ```typescript
   import { z } from "zod";
   import { tool } from "@langchain/core/tools";
   import { ChatGoogleVertexAI } from "@langchain/google-vertexai";
   import { createReactAgent } from "@langchain/langgraph/prebuilt";

   // 1. Define a tool
   const magicNumberTool = tool(
     async ({ input }) => {
       console.log(`[Tool] magicNumberTool called with: ${input}`);
       return "The magic number is 42.";
     },
     {
       name: "get_magic_number",
       description: "Returns the magic number.",
       schema: z.object({
         input: z.string().describe("Any input string"),
       }),
     },
   );

   async function main() {
     // 2. Initialize the model
     const model = new ChatGoogleVertexAI({
       model: "gemini-1.5-flash",
       temperature: 0,
     });

     // 3. Create the agent
     // createReactAgent is a prebuilt LangGraph agent that implements the ReAct pattern
     const agent = createReactAgent({
       llm: model,
       tools: [magicNumberTool],
     });

     // 4. Invoke the agent
     console.log("--- Invoking Agent ---");
     const result = await agent.invoke({
       messages: [
         {
           role: "user",
           content: "What is the magic number?",
         },
       ],
     });

     // 5. Output the result
     const lastMessage = result.messages[result.messages.length - 1];
     console.log("--- Final Response ---");
     console.log(lastMessage.content);
   }

   main().catch(console.error);
   ```

   _Note: We use `createReactAgent` from `@langchain/langgraph/prebuilt` which is the modern way to create ReAct agents compatible with LangGraph._

3. **Run the script**:

   You can run this using `tsx` (TypeScript Executor) which is included in dev dependencies.

   ```bash
   # From the root directory
   cd packages/agents
   npx tsx src/simple-react-agent.ts
   ```

   **Expected Output:**
   You should see the agent "Reason" that it needs to call the tool, "Act" by calling `get_magic_number`, observe the result ("42"), and then provide the final answer.

### Why use `createAgent` / `createReactAgent`?

- **Simplicity**: You don't need to define nodes and edges manually.
- **Speed**: Faster to prototype simple agents.
- **Standardization**: Uses proven patterns for tool calling and reasoning.

However, for complex, custom workflows (like the Research Agent), building the graph manually (as we did in previous modules) gives you more control.

## Key Takeaways

1. **System Instructions** are powerful tools for controlling LLM behavior
2. **Multi-step workflows** break complex tasks into manageable pieces
3. **Custom Tools** extend the capabilities of your agent beyond text generation
4. **Structured Outputs** ensure reliable data processing for downstream applications
5. **State management** allows agents to maintain context across steps
6. **Testing** is crucial - always verify your changes work as expected

## Common Pitfalls

1. **Forgetting to rebuild**: Always run `pnpm build` after making changes
2. **Not restarting backend**: Changes require a server restart
3. **Breaking TypeScript types**: Ensure your modifications maintain type safety
4. **Over-complicating prompts**: Start simple, then add complexity

## Next Steps

- **Intermediate Learners**: Proceed to [Module 03: Intermediate Security](./03_intermediate_security.md) to learn about LLM security guardrails
- **Continue Experimenting**: Try more modifications to the Default and Research agents
- **Read the Code**: Explore other files in the agent directories to understand the full architecture

## Additional Resources

- [Default Agent README](../../../packages/agents/src/agents/default_agent/README.md) - Detailed architecture documentation
- [Research Agent README](../../../packages/agents/src/agents/research_agent/README.md) - Detailed architecture documentation
- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/) - Learn more about graph-based agent workflows
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs) - Understand model capabilities
