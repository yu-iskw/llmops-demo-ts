import { Body, Controller, Post, Route, Get, SuccessResponse } from "tsoa";
import { ChatService } from "../services/chat-service";
import { ChatRequest, ChatMessage, AgentType } from "@llmops-demo/common";

@Route("chat")
export class ChatController extends Controller {
  private chatService: ChatService;

  constructor() {
    super();
    this.chatService = new ChatService();
  }

  /**
   * Processes a chat message and returns a response.
   * @param requestBody The chat request containing message, history, and agent type.
   */
  @SuccessResponse("200", "OK")
  @Post()
  public async processChatMessage(
    @Body() requestBody: ChatRequest,
  ): Promise<{ chunk: string }> {
    const { message, history = [], agentType = "default" } = requestBody;

    if (!message) {
      this.setStatus(400);
      return { chunk: "Message is required" };
    }

    const response = await this.chatService.processMessage(
      message,
      history,
      agentType,
    );
    return { chunk: response };
  }

  /**
   * Retrieves a list of available agent types.
   */
  @Get("/agent-types")
  public async getAgentTypes(): Promise<AgentType[]> {
    const agentTypes = [
      { name: "default", description: "A general-purpose AI assistant." },
      {
        name: "research",
        description:
          "An AI assistant specializing in research and information gathering.",
      },
      {
        name: "trip-planner",
        description:
          "An AI assistant for planning trips and generating itineraries.",
      },
    ];
    return agentTypes;
  }
}
