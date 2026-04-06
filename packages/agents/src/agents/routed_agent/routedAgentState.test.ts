import { RoutedAgentStateAnnotation } from "./routedAgentState";

describe("RoutedAgentState", () => {
  it("composes output sanitizer and route channels", () => {
    expect(RoutedAgentStateAnnotation.spec).toHaveProperty("route");
    expect(RoutedAgentStateAnnotation.spec).toHaveProperty("messages");
    expect(RoutedAgentStateAnnotation.spec).toHaveProperty("is_sensitive");
    expect(RoutedAgentStateAnnotation.spec).toHaveProperty(
      "confidence_probability",
    );
    expect(RoutedAgentStateAnnotation.spec).toHaveProperty(
      "suspicious_probability",
    );
    expect(RoutedAgentStateAnnotation.spec).toHaveProperty("user_message");
    expect(RoutedAgentStateAnnotation.spec).toHaveProperty("ai_response");
  });
});
