"use node";
import Anthropic from "@anthropic-ai/sdk";
import { action } from "../_generated/server";
import { v } from "convex/values";

export const generateQuiz = action({
  args: {
    prompt: v.string(),
  },
  handler: async (_ctx, { prompt }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Generate a quiz based on this description: "${prompt}"

Return ONLY valid JSON with this exact structure:
{
  "title": "Quiz Title",
  "items": [
    { "primary": "Answer 1", "alternatives": ["alt1", "alt2"] },
    { "primary": "Answer 2", "alternatives": [] }
  ]
}

Rules:
- The title should be a concise, descriptive quiz title
- Each item represents one answer the quiz-taker needs to guess
- Include common alternative spellings, abbreviations, or accepted names in the alternatives array
- Generate a reasonable number of items for the topic (e.g. 50 for US states, ~30 for European countries, etc.)
- Return ONLY the JSON, no other text`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from AI");
    }

    try {
      const parsed = JSON.parse(textBlock.text);
      return parsed as {
        title: string;
        items: Array<{ primary: string; alternatives: string[] }>;
      };
    } catch {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed as {
          title: string;
          items: Array<{ primary: string; alternatives: string[] }>;
        };
      }
      throw new Error("Failed to parse AI response as JSON");
    }
  },
});
