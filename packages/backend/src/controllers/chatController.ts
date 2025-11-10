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
import { ChatRequest } from "@llmops-demo/common";
import { AgentFactory, AgentInfo } from "@llmops-demo-ts/agents";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";

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
    const response = request.res as ExpressResponse;
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
      "Access-Control-Allow-Headers": "Cache-Control",
    });

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
        if (chunk && chunk.content && typeof chunk.content === "string") {
          // Send chunk as Server-Sent Event
          response.write(
            `data: ${JSON.stringify({ chunk: chunk.content })}\n\n`,
          );
        }
      }

      // Send end-of-stream event
      response.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      response.end();
    } catch (error) {
      console.error("Streaming error:", error);
      response.write(
        `data: ${JSON.stringify({ error: "An error occurred while processing your request" })}\n\n`,
      );
      response.end();
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
