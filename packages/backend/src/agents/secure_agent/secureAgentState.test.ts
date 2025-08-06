import { Annotation } from "@langchain/langgraph";
import { SecureAgentStateAnnotation } from "./secureAgentState";
import { CommonAgentStateAnnotation } from "./commonAgentState";
import { InputSanitizerStateAnnotation } from "./subagents/input_sanitizer/inputSanitizerState";
import { OutputSanitizerStateAnnotation } from "./subagents/output_sanitizer/outputSanitizerState";
import { RequestAnswererStateAnnotation } from "./subagents/answer_agent/requestAnswererState";

describe("SecureAgentState", () => {
  it("should correctly compose all relevant state annotations", () => {
    // Assert that SecureAgentStateAnnotation.spec contains the next_step property
    expect(SecureAgentStateAnnotation.spec).toHaveProperty("next_step");

    // Assert that SecureAgentStateAnnotation.spec includes properties from CommonAgentStateAnnotation
    expect(SecureAgentStateAnnotation.spec).toHaveProperty("messages");

    // Assert that SecureAgentStateAnnotation.spec includes properties from InputSanitizerStateAnnotation
    expect(SecureAgentStateAnnotation.spec).toHaveProperty("sanitized_message");

    // Assert that SecureAgentStateAnnotation.spec includes properties from OutputSanitizerStateAnnotation
    expect(SecureAgentStateAnnotation.spec).toHaveProperty("is_sensitive");

    // Assert that SecureAgentStateAnnotation.spec includes properties from RequestAnswererStateAnnotation
    // expect(SecureAgentStateAnnotation.spec).toHaveProperty("request_answer");
  });
});
