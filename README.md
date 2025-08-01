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
- **Google Gemini AI** (`@google/generative-ai`) for chat responses
- **TypeScript** for type safety
- **LangChain/LangGraph-inspired Logic**: Modular, graph-like structure for conversation flow
- **Server-Sent Events** for real-time streaming

### Frontend

- **Vue.js 3** with Composition API
- **Vite** for fast development
- **TypeScript** for type safety
- **Modern CSS** with responsive design

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
   # Copy the example environment file
   cp packages/backend/.env.example packages/backend/.env

   # Edit the file and add your Google Gemini API key
   # Get your API key from: https://makersuite.google.com/app/apikey
   ```

4. **Start the development servers**

   ```bash
   # Terminal 1: Start backend
   cd packages/backend
   pnpm run dev

   # Terminal 2: Start frontend
   cd packages/frontend
   pnpm run dev
   ```

5. **Open the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3001

## Development

### Project Structure

```
llmops-demo-ts/
├── packages/
│   ├── backend/          # Node.js + Express server
│   │   ├── src/
│   │   │   ├── index.ts      # Express server setup
│   │   │   ├── chat-service.ts # LangGraph-inspired chat logic
│   │   │   └── types.ts       # TypeScript types
│   │   └── package.json
│   └── frontend/         # Vue.js application
│       ├── src/
│       │   ├── components/
│       │   │   └── Chat.vue   # Main chat component
│       │   ├── App.vue        # Root component
│       │   └── main.ts        # Application entry
│       └── package.json
├── DESIGN_DOC.md         # Architecture documentation
├── API_DOCUMENTATION.md  # API reference
└── README.md
```

### Available Scripts

#### Backend

```bash
cd packages/backend
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run start    # Start production server
pnpm run test     # Run unit tests
```

#### Frontend

```bash
cd packages/frontend
pnpm run dev      # Start development server
pnpm run build    # Build for production
pnpm run preview  # Preview production build
pnpm run test:e2e # Run E2E tests
```

### Testing

Run the test suite to verify everything works:

```bash
./test-app.sh
```

## API Reference

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API documentation.

## Architecture

See [DESIGN_DOC.md](./DESIGN_DOC.md) for detailed architecture documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details.

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure you've set the `GOOGLE_GENAI_API_KEY` in `packages/backend/.env`
2. **Port Already in Use**: Change the port in the respective package.json files
3. **Build Errors**: Run `pnpm install` to ensure all dependencies are installed

### Getting Help

- Check the API documentation for endpoint details
- Review the design document for architecture information
- Run the test script to verify your setup
