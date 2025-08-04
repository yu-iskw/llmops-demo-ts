# AI Chat Web Application

A modern AI chat application built with Vue.js frontend and Node.js backend, powered by Google Gemini AI.

## Features

- 🤖 **AI-Powered Chat**: Uses Google Gemini AI for intelligent conversations
- 💬 **Real-time Streaming**: Server-Sent Events (SSE) for live response streaming
- 🎨 **Modern UI**: Clean, responsive Vue.js interface
- 🔧 **Modular Architecture**: Separate backend and frontend packages, with a LangGraph-inspired logic flow
- 📱 **Mobile-Friendly**: Responsive design that works on all devices

## Tech Stack

### Backend

- **Node.js** with Express
- **Google Gemini AI** (`@google/genai`) for chat responses
- **TypeScript** for type safety
- **LangChain/LangGraph-inspired Logic**: Modular, graph-like structure for conversation flow
- **Server-Sent Events** for real-time streaming
- **tsoa** for OpenAPI specification generation

### Frontend

- **Vue.js 3** with Composition API
- **Vite** for fast development
- **TypeScript** for type safety
- **Modern CSS** with responsive design
- **Playwright** for end-to-end testing

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager
- Google Gemini API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd llmops-demo-ts
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the environment template file
   cp env_template.txt packages/backend/.env

   # Edit the file and add your Google Gemini API key
   # Get your API key from: https://aistudio.google.com/app/apikey
   ```

4. **Start the development servers**

   ```bash
   # Option 1: Use root-level scripts (recommended)
   pnpm start:backend    # Start backend
   pnpm start:frontend   # Start frontend

   # Option 2: Start individually
   # Terminal 1: Start backend
   cd packages/backend
   pnpm run dev

   # Terminal 2: Start frontend
   cd packages/frontend
   pnpm run dev
   ```

5. **Open the application**
   - Frontend: <http://localhost:4200>
   - Backend API: <http://localhost:3001>

## Development

### Project Structure

```text
llmops-demo-ts/
├── packages/
│   ├── backend/          # Node.js + Express server
│   │   ├── src/
│   │   │   ├── agents/   # LangGraph agent implementations
│   │   │   ├── controllers/ # tsoa API controllers
│   │   │   ├── services/ # Business logic services
│   │   │   ├── models/   # TypeScript interfaces
│   │   │   ├── utils/    # Utility functions
│   │   │   ├── index.ts  # Express server setup
│   │   │   └── cli.ts    # CLI interface
│   │   ├── build/        # Generated tsoa files
│   │   └── package.json
│   ├── frontend/         # Vue.js application
│   │   ├── src/
│   │   │   ├── components/ # Vue components
│   │   │   ├── services/   # API services
│   │   │   ├── stores/     # State management
│   │   │   ├── App.vue     # Root component
│   │   │   └── main.ts     # Application entry
│   │   ├── tests/          # E2E tests
│   │   └── package.json
│   └── common/            # Shared types and utilities
│       ├── src/
│       │   └── models/     # Shared TypeScript interfaces
│       └── package.json
├── env_template.txt       # Environment variables template
├── docker-compose.yml     # Docker configuration
└── README.md
```

### Available Scripts

#### Root-level Commands

```bash
pnpm build              # Build all packages
pnpm start:backend      # Start backend development server
pnpm start:frontend     # Start frontend development server
pnpm format             # Format code with trunk
pnpm format:all         # Format all files
pnpm lint               # Lint code with trunk
pnpm lint:all           # Lint all files
pnpm lint:security      # Security-focused linting
```

#### Backend Commands

```bash
cd packages/backend
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run start    # Start production server
pnpm run test     # Run unit tests
pnpm run cli      # Run CLI interface
```

#### Frontend Commands

```bash
cd packages/frontend
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run test:e2e # Run E2E tests
```
