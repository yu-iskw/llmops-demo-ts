import {
  ChatMessage as CommonChatMessage,
  ChatRequest as CommonChatRequest,
  AGUIRunStartedEvent,
  AGUITextMessageChunkEvent,
  AGUIRunFinishedEvent,
  AGUIRunErrorEvent,
} from "@llmops-demo/common"; // Shared models

export interface UIChatMessage {
  id: string;
  text: string; // Changed from Ref<string> to plain string
  fromUser: boolean;
}

export interface AgentType {
  name: string;
  description: string;
}

export interface ChatStreamHandlers {
  onRunStarted?: (event: AGUIRunStartedEvent) => void;
  onTextChunk?: (chunk: string, event: AGUITextMessageChunkEvent) => void;
  onRunFinished?: (event: AGUIRunFinishedEvent) => void;
  onRunError?: (event: AGUIRunErrorEvent) => void;
  onEvent?: (eventName: string, payload: unknown) => void;
}

interface SSEEvent {
  event: string;
  data?: string;
  id?: string;
}

// Temporarily removed debugLog utility as part of phased refactor.
// It will be re-added if necessary after core reactivity issue is resolved.

export class ChatService {
  private static mapHistoryToCommon(
    history: UIChatMessage[],
  ): CommonChatMessage[] {
    return history.map(
      (message): CommonChatMessage => ({
        role: message.fromUser ? "user" : "assistant",
        content: message.text ?? "",
      }),
    );
  }

  private static parseSSEEvent(rawEvent: string): SSEEvent | null {
    const lines = rawEvent.split("\n");
    let eventName = "message";
    const dataLines: string[] = [];
    let id: string | undefined;

    for (const line of lines) {
      if (!line) {
        continue;
      }

      if (line.startsWith(":")) {
        continue;
      }

      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        continue;
      }

      const field = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trimStart();

      switch (field) {
        case "event":
          if (value) {
            eventName = value;
          }
          break;
        case "data":
          dataLines.push(value);
          break;
        case "id":
          id = value;
          break;
        default:
          break;
      }
    }

    if (!id && dataLines.length === 0 && eventName === "message") {
      return null;
    }

    return {
      event: eventName || "message",
      data: dataLines.length > 0 ? dataLines.join("\n") : undefined,
      id,
    };
  }

  static async sendMessage(
    message: string,
    history: UIChatMessage[],
    agentType: string = "default",
    modelName: string = "gemini-2.5-flash",
    sessionId?: string,
    handlers: ChatStreamHandlers = {},
  ): Promise<string> {
    const payload: CommonChatRequest = {
      message,
      history: ChatService.mapHistoryToCommon(history),
      agentType,
      modelName,
      sessionId,
    };

    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to start chat stream: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    if (!response.body) {
      throw new Error(
        "Streaming is not supported in this environment. Please use a modern browser.",
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let aggregatedText = "";
    let runCompleted = false;
    let shouldClose = false;

    const invokeEventHandler = (eventName: string, payload: unknown) => {
      if (handlers.onEvent) {
        try {
          handlers.onEvent(eventName, payload);
        } catch (handlerError) {
          console.warn("ChatService onEvent handler threw an error", handlerError);
        }
      }
    };

    const handleParsedEvent = async (event: SSEEvent, payload: unknown) => {
      invokeEventHandler(event.event, payload);

      switch (event.event) {
        case "RUN_STARTED": {
          if (handlers.onRunStarted && payload && typeof payload === "object") {
            handlers.onRunStarted(payload as AGUIRunStartedEvent);
          }
          break;
        }
        case "TEXT_MESSAGE_CHUNK": {
          if (payload && typeof payload === "object") {
            const chunkEvent = payload as AGUITextMessageChunkEvent;
            const deltaText = chunkEvent?.delta?.text ?? "";
            if (deltaText) {
              aggregatedText += deltaText;
              handlers.onTextChunk?.(deltaText, chunkEvent);
            }
          }
          break;
        }
        case "RUN_FINISHED": {
          if (payload && typeof payload === "object") {
            const finishedEvent = payload as AGUIRunFinishedEvent;
            handlers.onRunFinished?.(finishedEvent);
            const finalContent = finishedEvent?.result?.message?.content;
            if (typeof finalContent === "string") {
              aggregatedText = finalContent;
            }
          }
          runCompleted = true;
          shouldClose = true;
          break;
        }
        case "RUN_ERROR": {
          if (payload && typeof payload === "object") {
            const errorEvent = payload as AGUIRunErrorEvent;
            handlers.onRunError?.(errorEvent);
            const errorMessage =
              errorEvent?.error?.message ||
              "An unknown error occurred while processing the request.";
            throw new Error(errorMessage);
          }
          throw new Error(
            "An unknown error occurred while processing the request.",
          );
        }
        default:
          break;
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          buffer += decoder.decode(new Uint8Array(), { stream: false });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, "\n");

        let boundaryIndex = buffer.indexOf("\n\n");

        while (boundaryIndex !== -1) {
          const rawEvent = buffer.slice(0, boundaryIndex);
          buffer = buffer.slice(boundaryIndex + 2);

          if (rawEvent.length === 0) {
            boundaryIndex = buffer.indexOf("\n\n");
            continue;
          }

          const parsedEvent = ChatService.parseSSEEvent(rawEvent);
          if (!parsedEvent || !parsedEvent.data) {
            boundaryIndex = buffer.indexOf("\n\n");
            continue;
          }

          let parsedPayload: unknown = parsedEvent.data;
          try {
            parsedPayload = JSON.parse(parsedEvent.data);
          } catch {
            // Non-JSON payloads are ignored for typed handlers but still passed to onEvent
          }

          await handleParsedEvent(parsedEvent, parsedPayload);

          if (shouldClose) {
            break;
          }

          boundaryIndex = buffer.indexOf("\n\n");
        }

        if (shouldClose) {
          break;
        }
      }

      if (!shouldClose && buffer.length > 0) {
        const parsedEvent = ChatService.parseSSEEvent(buffer);
        if (parsedEvent && parsedEvent.data) {
          let parsedPayload: unknown = parsedEvent.data;
          try {
            parsedPayload = JSON.parse(parsedEvent.data);
          } catch {
            // Ignore JSON parse errors for trailing payloads
          }
          await handleParsedEvent(parsedEvent, parsedPayload);
        }
      }
    } catch (streamError) {
      await reader.cancel().catch(() => undefined);
      throw streamError;
    } finally {
      if (shouldClose) {
        await reader.cancel().catch(() => undefined);
      }
      if (typeof reader.releaseLock === "function") {
        reader.releaseLock();
      }
    }

    if (!runCompleted) {
      throw new Error("Stream ended before the run completed.");
    }

    return aggregatedText;
  }

  static async getAgentTypes(): Promise<AgentType[]> {
    const response = await fetch("/api/chat/agent-types");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch agent types: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }
    const data = await response.json();
    return data;
  }
}
