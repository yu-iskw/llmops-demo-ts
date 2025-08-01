import { FinancialAdvisorState } from "./state";
import { GoogleGenAI } from "@google/genai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { Runnable } from "@langchain/core/runnables";

const genAI = new GoogleGenAI({}); // [[memory:4951926]]

export const validateInvestmentQuery: Runnable<FinancialAdvisorState, Partial<FinancialAdvisorState>> = async (state: FinancialAdvisorState) => {
  // In a real scenario, this node would validate the user's investment query
  // For now, it simply extracts the query from the latest message.
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage && lastMessage._getType() === "human") {
    return { investment_query: lastMessage.content as string };
  }
  return { investment_query: "" };
};

export const provideInvestmentAdvice: Runnable<FinancialAdvisorState, Partial<FinancialAdvisorState>> = async (state: FinancialAdvisorState) => {
  const prompt = `Based on the following investment query, provide detailed investment advice:\nQuery: ${state.investment_query}\nAdvice:`;
  try {
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
    });
    const aiMessage = new AIMessage(result.text || '');
    return { investment_advice: aiMessage.content as string, messages: [aiMessage] };
  } catch (error) {
    console.error("Error providing investment advice:", error);
    throw error;
  }
};

export const assessRisk: Runnable<FinancialAdvisorState, Partial<FinancialAdvisorState>> = async (state: FinancialAdvisorState) => {
  const prompt = `Given the investment advice: \n\"${state.investment_advice}\"\n Assess the potential risks involved and provide a summary:\nRisk Assessment:`;
  try {
    const contents = [{ role: "user", parts: [{ text: prompt }] }];
    const result = await genAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents,
    });
    const aiMessage = new AIMessage(result.text || '');
    return { risk_assessment: aiMessage.content as string, messages: [aiMessage] };
  } catch (error) {
    console.error("Error assessing risk:", error);
    throw error;
  }
};
