import { Type } from "@google/genai";

export const getCurrentTime = () => {
  return new Date().toISOString();
};

export const getCurrentTimeToolDeclaration = {
  name: "getCurrentTime",
  description: "Get the current timestamp in ISO format.",
  parameters: {
    type: Type.OBJECT, // Use Type.OBJECT
    properties: {},
    required: [],
  },
};
