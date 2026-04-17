import OpenAI from "openai";

export const openaiModel = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}
