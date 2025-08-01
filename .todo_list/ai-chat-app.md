# AI Chat Web App - TODO List

## Phase 1: Project Setup

- [ ] 1.1: Initialize `pnpm` workspace.
- [ ] 1.2: Create `backend` and `frontend` packages.
- [ ] 1.3: Configure `typescript` for both packages.
- [ ] 1.4: Install initial dependencies for the `backend` (`@google/genai`, `langgraph`, `express`, `cors`, `dotenv`).
- [ ] 1.5: Install initial dependencies for the `frontend` (`vue`, other necessary libraries).

## Phase 2: Backend Implementation (using LangGraph.js)

- [ ] 2.1: Set up a basic Express server in `packages/backend/src/index.ts`.
- [ ] 2.2: Implement API key management using `dotenv`.
- [ ] 2.3: Define the LangGraph state.
- [ ] 2.4: Create nodes for the chat graph (e.g., `call_model`, `should_continue`).
- [ ] 2.5: Assemble the graph and compile it.
- [ ] 2.6: Create an API endpoint (e.g., `/chat`) to receive user messages and stream responses from the LangGraph.
- [ ] 2.7: Implement SSE (Server-Sent Events) for streaming responses.

## Phase 3: Frontend Implementation (using Vue.js)

- [ ] 3.1: Set up the basic Vue.js application structure in `packages/frontend`.
- [ ] 3.2: Create a `Chat` component.
- [ ] 3.3: Implement the chat UI with a message display area and an input form.
- [ ] 3.4: Implement state management for messages.
- [ ] 3.5: Connect the frontend to the backend `/chat` endpoint.
- [ ] 3.6: Handle the streaming response from the backend and update the UI in real-time.

## Phase 4: Integration and Testing

- [ ] 4.1: Write unit tests for the backend graph logic.
- [ ] 4.2: Write E2E tests for the chat flow.
- [ ] 4.3: Manually test the application for usability and correctness.
- [ ] 4.4: Document the API endpoints.
- [ ] 4.5: Finalize the `README.md` with setup and usage instructions.
