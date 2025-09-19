import {
  Body,
  Controller,
  Post,
  Route,
  Get,
  SuccessResponse,
  Request,
} from "tsoa";
import { ChatService } from "../services/chatService";
import {
  ChatRequest,
  AGUIRunStartedEvent,
  AGUITextMessageChunkEvent,
  AGUIRunFinishedEvent,
  AGUIRunErrorEvent,
  AGUIEvent,
} from "@llmops-demo/common";
import { AgentFactory, AgentInfo } from "../agents/agentFactory";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { randomUUID } from "crypto";
import type { AIMessageChunk } from "@langchain/core/messages";

@Route("chat")
export class ChatController extends Controller {
  private chatService: ChatService;

  constructor() {
    super();
    this.chatService = new ChatService();
  }

  /**
   * Processes a chat message and returns a complete response.
   * @param requestBody The chat request containing message, history, and agent type.
   */
  @SuccessResponse("200", "OK")
  @Post()
  public async processChatMessage(
    @Body() requestBody: ChatRequest,
  ): Promise<{ chunk: string }> {
    const {
      message,
      history = [],
      agentType = "default",
      modelName,
      sessionId,
    } = requestBody;

    if (!message) {
      this.setStatus(400);
      return { chunk: "Message is required" };
    }

    const response = await this.chatService.processMessage(
      message,
      history,
      agentType,
      undefined,
      modelName,
      sessionId, // Pass sessionId
    );
    return { chunk: response };
  }

  /**
   * Processes a chat message and streams the response using Server-Sent Events.
   * @param requestBody The chat request containing message, history, and agent type.
   */
  @SuccessResponse("200", "OK")
  @Post("stream")
  public async processChatMessageStream(
    @Body() requestBody: ChatRequest,
    @Request() request: ExpressRequest,
  ): Promise<void> {
    // Access the Express response object from the request
    const response = (request as any).res as ExpressResponse;
    const {
      message,
      history = [],
      agentType = "default",
      modelName,
      sessionId,
    } = requestBody;

    if (!message) {
      response.status(400).json({ error: "Message is required" });
      return;
    }

    // Set headers for Server-Sent Events
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control, Content-Type",
    });

    // Flush headers immediately if supported by the underlying response
    if (typeof (response as any).flushHeaders === "function") {
      (response as any).flushHeaders();
    }

    const runId = randomUUID();
    const messageId = randomUUID();
    const buildBaseEvent = <TType extends AGUIEvent["type"]>(
      type: TType,
    ) => ({
      type,
      eventId: randomUUID(),
      runId,
      createdAt: new Date().toISOString(),
    });

    let clientDisconnected = false;
    request.on("close", () => {
      clientDisconnected = true;
    });

    const sendEvent = (event: AGUIEvent) => {
      if (clientDisconnected) {
        return;
      }
      response.write(`event: ${event.type}\n`);
      response.write(`data: ${JSON.stringify(event)}\n\n`);
    };

    const finishStream = () => {
      if (!clientDisconnected) {
        clientDisconnected = true;
        response.end();
      }
    };

    const extractChunkText = (chunk: AIMessageChunk): string => {
      if (!chunk) {
        return "";
      }

      const { content } = chunk as AIMessageChunk;
      if (typeof content === "string") {
        return content;
      }

      if (Array.isArray(content)) {
        return content
          .map((part: unknown) => {
            if (!part) {
              return "";
            }
            if (typeof part === "string") {
              return part;
            }
            const candidate = part as { text?: string; content?: string };
            if (typeof candidate.text === "string") {
              return candidate.text;
            }
            if (typeof candidate.content === "string") {
              return candidate.content;
            }
            return "";
          })
          .join("");
      }

      return "";
    };

    const runStartedEvent: AGUIRunStartedEvent = {
      ...buildBaseEvent("RUN_STARTED"),
      run: {
        id: runId,
        rootId: runId,
        name: "chat-run",
        metadata: {
          agentType,
          modelName,
          sessionId,
        },
      },
    };

    sendEvent(runStartedEvent);

    let fullResponse = "";

    try {
      const responseStream = this.chatService.processMessageStream(
        message,
        history,
        agentType,
        undefined,
        modelName,
        sessionId,
      );

      for await (const chunk of responseStream) {
        if (clientDisconnected) {
          break;
        }

        const chunkText = extractChunkText(chunk);
        if (!chunkText) {
          continue;
        }

        fullResponse += chunkText;

        const textChunkEvent: AGUITextMessageChunkEvent = {
          ...buildBaseEvent("TEXT_MESSAGE_CHUNK"),
          message: {
            id: messageId,
            role: "assistant",
          },
          delta: {
            text: chunkText,
          },
        };

        sendEvent(textChunkEvent);
      }

      if (!clientDisconnected) {
        const runFinishedEvent: AGUIRunFinishedEvent = {
          ...buildBaseEvent("RUN_FINISHED"),
          result: {
            status: "SUCCESS",
            message: {
              id: messageId,
              role: "assistant",
              content: fullResponse,
            },
            metadata: {
              agentType,
              modelName,
              sessionId,
            },
          },
        };

        sendEvent(runFinishedEvent);
      }
    } catch (error) {
      if (!clientDisconnected) {
        const runErrorEvent: AGUIRunErrorEvent = {
          ...buildBaseEvent("RUN_ERROR"),
          error: {
            message:
              error instanceof Error
                ? error.message
                : "An error occurred while processing your request.",
          },
        };

        sendEvent(runErrorEvent);
      }
    } finally {
      finishStream();
    }
  }

  /**
   * Retrieves a list of available agent types.
   */
  @Get("/agent-types")
  public async getAgentTypes(): Promise<AgentInfo[]> {
    return AgentFactory.getAvailableAgents();
  }
}
