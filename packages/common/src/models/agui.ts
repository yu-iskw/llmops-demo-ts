export type AGUIMessageRole = "user" | "assistant" | "system";

export type AGUIRunStatus = "SUCCESS" | "ERROR";

export interface AGUIEventBase<TType extends string> {
  type: TType;
  /**
   * Unique identifier for this event instance.
   */
  eventId: string;
  /**
   * Identifier for the run that emitted this event.
   */
  runId: string;
  /**
   * ISO 8601 timestamp representing when the event was emitted.
   */
  createdAt: string;
}

export interface AGUIRunStartedEvent extends AGUIEventBase<"RUN_STARTED"> {
  run: {
    /**
     * Unique identifier for the run.
     */
    id: string;
    /**
     * Identifier that groups all events that belong to the same logical run hierarchy.
     */
    rootId: string;
    /**
     * Identifier for the parent run when the current run is nested.
     */
    parentId?: string;
    /**
     * Optional human readable name for the run.
     */
    name?: string;
    /**
     * Arbitrary metadata provided by the agent.
     */
    metadata?: Record<string, unknown>;
  };
}

export interface AGUITextMessageChunkEvent
  extends AGUIEventBase<"TEXT_MESSAGE_CHUNK"> {
  message: {
    id: string;
    role: AGUIMessageRole;
  };
  delta: {
    text: string;
  };
}

export interface AGUIRunFinishedEvent extends AGUIEventBase<"RUN_FINISHED"> {
  result: {
    status: AGUIRunStatus;
    message?: {
      id: string;
      role: AGUIMessageRole;
      content: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export interface AGUIRunErrorEvent extends AGUIEventBase<"RUN_ERROR"> {
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
}

export type AGUIEvent =
  | AGUIRunStartedEvent
  | AGUITextMessageChunkEvent
  | AGUIRunFinishedEvent
  | AGUIRunErrorEvent;
