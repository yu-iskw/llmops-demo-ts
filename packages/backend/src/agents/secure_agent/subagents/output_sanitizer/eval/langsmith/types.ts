export interface OutputSanitizerInputs {
  user_message: string;
  ai_response: string;
}

export interface OutputSanitizerOutputs {
  is_sensitive: boolean;
  reason: string;
}
