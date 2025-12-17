# Module 01: Environment Setup

**Target Audience:** All Personas (Beginners, Intermediate, Advanced)

This module ensures every learner can successfully launch the full application stack (Frontend + Backend + Agents) before proceeding to agent-specific courses.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **pnpm**: Package manager ([Installation Guide](https://pnpm.io/installation))
  - To install pnpm using npm: `npm install -g pnpm`
  - To install pnpm using corepack: `corepack enable pnpm`
- **Trunk IO**: Code linting and formatting tool ([Installation](https://trunk.io/))
  - To install Trunk IO using Homebrew (macOS): `brew install trunk-io`
- **Google Cloud Account** (for Vertex AI) OR **Google Gemini API Key** (for direct API access)
  - For Vertex AI: A Google Cloud Project with Vertex AI API enabled
  - For Gemini API: An API key from [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-keys)
- **LangSmith Account** (Optional, but recommended for observability and evaluation)
  - Sign up at [LangSmith](https://smith.langchain.com/)
  - Obtain your API key from the settings page

## Step 1: Clone and Install Dependencies

1. **Clone the repository** (if you haven't already):

   ```bash
   git clone <repository-url>
   cd llmops-demo-ts
   ```

2. **Install all dependencies** using pnpm:

   ```bash
   pnpm install
   ```

   This will install dependencies for all packages in the monorepo (frontend, backend, agents, and common).

## Step 2: Configure Environment Variables

1. **Copy the environment template**:

   ```bash
   cp env_template.txt .env
   ```

2. **Open `.env` in your editor** and configure the following variables:

   ### Option A: Using Vertex AI (Recommended)

   We recommend using this option whenever possible as Vertex AI offers higher rate limits and enterprise-grade features.

   ```bash
   GOOGLE_GENAI_USE_VERTEXAI=true
   GOOGLE_CLOUD_PROJECT=your-gcp-project-id
   GOOGLE_CLOUD_LOCATION=us-central1
   ```

   > **Note:**
   >
   > - Replace `your-gcp-project-id` with your Google Cloud Project ID
   > - Ensure Vertex AI API is enabled in your GCP project
   > - Set up authentication: `gcloud auth application-default login`

   ### Option B: Using Gemini API (Fallback if Vertex AI is not available)

   If you cannot use Vertex AI, you can use the Gemini API.

   ```bash
   GOOGLE_API_KEY=your-gemini-api-key-here
   GOOGLE_GENAI_USE_VERTEXAI=false
   ```

   > **Note:** Replace `your-gemini-api-key-here` with your actual Gemini API key from [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-keys).
   >
   > **Warning:** The direct Gemini API has relatively small rate limits, which may not be sufficient for extensive testing or development work.

   ### Optional: LangSmith Configuration (Recommended for observability)

   For details on creating a LangSmith account and obtaining an API key, please refer to the [official documentation](https://docs.langchain.com/langsmith/create-account-api-key).

   ```bash
   LANGSMITH_TRACING=true
   LANGSMITH_TRACING_V2=true
   LANGSMITH_ENDPOINT=https://api.smith.langchain.com
   LANGSMITH_PROJECT=llmops-demo-ts
   LANGSMITH_API_KEY=your-langsmith-api-key-here
   ```

   > **Note:** Replace `your-langsmith-api-key-here` with your LangSmith API key. This enables tracing and evaluation features used in later modules.

## Step 3: Build the Project

Build all packages to ensure everything compiles correctly:

```bash
pnpm build
```

This command will:

- Generate TypeScript types
- Compile all packages
- Generate tsoa routes and OpenAPI specifications for the backend

## Step 4: Launch the Backend Server

1. **Start the backend development server from the root directory**:

   ```bash
   pnpm start:backend
   ```

   The backend server will start on `http://localhost:3000`.

   You should see output similar to:

   ```text
   Server running on port 3000
   ```

2. **Verify the backend is running**:

   Open a new terminal and test the health endpoint:

   ```bash
   curl http://localhost:3000/health
   ```

   You should receive a response indicating the server is healthy.

## Step 5: Launch the Frontend Application

1. **Open a new terminal window** (keep the backend running)

2. **Start the frontend development server from the root directory**:

   ```bash
   pnpm start:frontend
   ```

   The frontend development server will start on `http://localhost:4200`.

   You should see output similar to:

   ```text
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:4200/
   ```

## Step 6: Verify the Application

1. **Open your browser** and navigate to `http://localhost:4200`

2. **You should see the chat interface** with:
   - A message input field at the bottom
   - A dropdown to select different agents (Default Agent, Research Agent, Secure Agent)
   - An empty message list

3. **Test the application**:
   - Select "Default Agent" from the dropdown
   - Type a simple message: `Hello, how are you?`
   - Press Enter or click Send
   - You should see the AI's response appear in the chat

   ![UI Example](../../images/ui_example.png)

## Troubleshooting

### Backend won't start

- **Check if port 3000 is already in use**:

  ```bash
   lsof -i :3000
  ```

  If another process is using port 3000, either stop it or change the port in `packages/backend/src/index.ts`

- **Verify environment variables**: Ensure `.env` file exists and contains valid credentials

- **Check for build errors**: Run `pnpm build` from the root directory and fix any TypeScript errors

### Frontend won't start

- **Check if port 4200 is already in use**:

  ```bash
   lsof -i :4200
  ```

  If another process is using port 4200, Vite will automatically try the next available port

- **Verify backend is running**: The frontend requires the backend API to be accessible

### API calls fail

- **Check browser console**: Open Developer Tools (F12) and check the Console tab for error messages

- **Verify CORS settings**: Ensure the backend allows requests from `http://localhost:4200`

- **Check network tab**: Verify that API requests are being made to `http://localhost:3000`

### Environment variable issues

- **Ensure `.env` file is in the root directory**: Not in `packages/backend` or `packages/frontend`

- **Restart servers after changing `.env`**: Environment variables are loaded at startup

- **Verify API key format**: Gemini API keys typically start with a specific prefix. Check the [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-keys) documentation

## Next Steps

Once you've successfully launched both the backend and frontend, you're ready to proceed to the course modules:

- **Beginners**: Proceed to [Module 02: Beginner Agents](./02_beginner_agents.md)
- **Intermediate**: Proceed to [Module 03: Intermediate Security](./03_intermediate_security.md) (after completing Module 02)
- **Advanced**: Proceed to [Module 04: Advanced Evaluation](./04_advanced_evaluation.md) (after completing Module 03)

## Additional Resources

- [Project README](../../../README.md) - Overview of the entire project
- [Google Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)
