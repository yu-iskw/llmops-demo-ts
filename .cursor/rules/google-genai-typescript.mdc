---
alwaysApply: true
description: Comprehensive guide for integrating the Google Gen AI SDK (@google/genai) into TypeScript applications, covering installation, initialization, and core capabilities like content generation, streaming, function calling, and structured output.
---
# Utilizing `@google/genai` in TypeScript

This guide provides comprehensive instructions and best practices for integrating the Google Gen AI SDK (`@google/genai`) into your TypeScript applications. This SDK allows you to build powerful applications leveraging Gemini models, supporting both the Gemini Developer API and Vertex AI.

## 1. Introduction to `@google/genai`

The `@google/genai` SDK is Google DeepMind’s primary SDK for its generative AI offerings, designed for TypeScript and JavaScript developers to build applications powered by Gemini. It is where new AI features are added.

## 2. Prerequisites

* **Node.js**: Version 20 or later.

### For Vertex AI Users (excluding Vertex AI Studio)

1. **Google Cloud Project**: Select or create one.
2. **Billing**: Enable billing for your project.
3. **Vertex AI API**: Enable the Vertex AI API.
4. **Authentication**:
    * Install the `gcloud` CLI.
    * Initialize the `gcloud` CLI.
    * Create local authentication credentials: `gcloud auth application-default login`

## 3. Installation

To install the SDK, use `pnpm`:

```bash
pnpm add @google/genai
```

## 4. Initialization

The SDK supports initialization for both Google AI Studio (API Key) and Vertex AI implementations.

### 4.1. Gemini Developer API (Using an API Key)

For server-side applications, obtain an API key from [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-keys) and initialize the client:

```typescript
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // It is recommended to use environment variables for API keys.

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
```

**Caution**: Avoid exposing API keys in client-side code. Use server-side implementations in production.

### 4.2. Vertex AI

Initialize the client for Vertex AI by specifying your Google Cloud project and location:

```typescript
import { GoogleGenAI } from '@google/genai';

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || "your-gcp-project-id";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1"; // e.g., "us-central1"

const ai = new GoogleGenAI({
    vertexai: true,
    project: PROJECT_ID,
    location: LOCATION,
});
```

### 4.3. (Optional) Using Environment Variables (Node.js only)

You can configure the client using environment variables:

* **Gemini Developer API**: Set `GOOGLE_API_KEY`.

    ```bash
    export GOOGLE_API_KEY='your-api-key'
    ```

* **Gemini API on Vertex AI**: Set `GOOGLE_GENAI_USE_VERTEXAI`, `GOOGLE_CLOUD_PROJECT`, and `GOOGLE_CLOUD_LOCATION`.

    ```bash
    export GOOGLE_GENAI_USE_VERTEXAI=true
    export GOOGLE_CLOUD_PROJECT='your-project-id'
    export GOOGLE_CLOUD_LOCATION='us-central1'
    ```

Then, initialize without explicit parameters:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();
```

## 5. Core Capabilities

The `GoogleGenAI` instance provides access to various API features through submodules like `ai.models`, `ai.caches`, `ai.chats`, `ai.files`, and `ai.live`.

### 5.1. Generate Content (Basic)

```typescript
async function generateText(modelName: string, prompt: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Or Vertex AI initialization
    const response = await ai.models.generateContent({
        model: modelName, // e.g., 'gemini-pro', 'gemini-2.0-flash-001'
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    console.log(response.text);
}

// Example usage:
// generateText('gemini-pro', 'Why is the sky blue?');
```

[Learn more about text generation](https://ai.google.dev/gemini-api/docs/text-generation)

### 5.2. Streaming Content

For quicker, more responsive interactions, use `generateContentStream`:

```typescript
async function streamText(modelName: string, prompt: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // Or Vertex AI initialization
    const response = await ai.models.generateContentStream({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    for await (const chunk of response) {
        console.log(chunk.text);
    }
}

// Example usage:
// streamText('gemini-pro', 'Write a 100-word poem about a forgotten city.');
```

### 5.3. Function Calling (Tool Use)

Enable Gemini to interact with external systems by providing `functionDeclaration` objects as `tools`. The process involves declaring the function, calling `generateContent` with function calling enabled, using the returned `FunctionCall` parameters to call your actual function, and sending the result back to the model as a `FunctionResponse`.

```typescript
import { GoogleGenAI, FunctionCallingConfigMode, FunctionDeclaration } from '@google/genai';

async function useFunctionCalling() {
    const controlLightDeclaration: FunctionDeclaration = {
        name: 'controlLight',
        description: 'Controls a smart light with brightness and color temperature settings.',
        parametersJsonSchema: {
            type: 'object',
            properties: {
                brightness: { type: 'number', description: 'Brightness level (0-100)' },
                colorTemperature: { type: 'string', description: 'Color temperature (e.g., "warm", "cool")' },
            },
            required: ['brightness', 'colorTemperature'],
        },
    };

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [{ role: 'user', parts: [{ text: 'Dim the lights so the room feels cozy and warm.' }] }],
        tools: [{ functionDeclarations: [controlLightDeclaration] }],
        toolConfig: {
            functionCallingConfig: {
                mode: FunctionCallingConfigMode.ANY, // Or FunctionCallingConfigMode.NONE, FunctionCallingConfigMode.AUTO
                allowedFunctionNames: ['controlLight'],
            }
        }
    });

    console.log(response.functionCalls); // Contains the FunctionCall object
    // You would then execute the actual 'controlLight' function based on these parameters.
}

// Example usage:
// useFunctionCalling();
```

[Learn more about function calling](https://ai.google.dev/gemini-api/docs/function-calling)

### 5.4. Structured Output

For cases where you need structured output (e.g., JSON), refer to the official guide.
[Learn more about structured output](https://ai.google.dev/gemini-api/docs/structured-output)

### 5.5. Prompting Tips

For effective text generation, consider using system instructions or few-shot prompting.
[Learn more about prompting strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

## 6. Important Considerations

### API Key Security

Always handle API keys securely. For client-side applications, use server-side implementations to prevent exposing keys.

### `contents` Argument Structure

When specifying `FunctionCall` and `FunctionResponse` parts, you must explicitly provide the full `Content[]` structure, making it clear which parts are from the model and which are from the user.

## 7. References

* **Google Gen AI SDK for TypeScript and JavaScript**: [https://googleapis.github.io/js-genai/release_docs/index.html](https://googleapis.github.io/js-genai/release_docs/index.html)
* **Gemini API Docs**: [https://ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
* **Text Generation**: [https://ai.google.dev/gemini-api/docs/text-generation](https://ai.google.dev/gemini-api/docs/text-generation)
* **Function Calling**: [https://ai.google.dev/gemini-api/docs/function-calling](https://ai.google.dev/gemini-api/docs/function-calling)
* **Structured Output**: [https://ai.google.dev/gemini-api/docs/structured-output](https://ai.google.dev/gemini-api/docs/structured-output)
* **Prompting Strategies**: [https://ai.google.dev/gemini-api/docs/prompting-strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)
* **Google Search (Tool)**: [https://ai.google.dev/gemini-api/docs/google-search](https://ai.google.dev/gemini-api/docs/google-search)
