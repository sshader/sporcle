"use node";
import Anthropic from "@anthropic-ai/sdk";
import { action } from "../_generated/server";
import { v } from "convex/values";

export const checkQuiz = action({
  args: {
    title: v.string(),
    items: v.array(
      v.object({
        primary: v.string(),
        alternatives: v.array(v.string()),
      })
    ),
  },
  handler: async (_ctx, { title, items }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    const client = new Anthropic({ apiKey });

    const itemsList = items
      .map((item, i) => {
        const alts =
          item.alternatives.length > 0
            ? ` (alternatives: ${item.alternatives.join(", ")})`
            : "";
        return `${i}. "${item.primary}"${alts}`;
      })
      .join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are helping check a quiz titled "${title}". For each answer below, suggest additional alternative spellings, abbreviations, common misspellings, or other accepted forms that a quiz-taker might type. Only suggest alternatives that are NOT already listed.

Items:
${itemsList}

Respond with ONLY valid JSON — an array of objects with "itemIndex" (number) and "suggestedAlternatives" (string array). Only include items where you have suggestions. Example:
[{"itemIndex": 0, "suggestedAlternatives": ["alt1", "alt2"]}]

If no suggestions, respond with an empty array: []`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return [];
    }

    try {
      const parsed = JSON.parse(textBlock.text);
      if (!Array.isArray(parsed)) return [];
      return parsed as Array<{
        itemIndex: number;
        suggestedAlternatives: string[];
      }>;
    } catch {
      return [];
    }
  },
});
