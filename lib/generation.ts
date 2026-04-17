import { z } from "zod";
import { openai, openaiModel } from "@/lib/openai";
import { READING_LEVELS, ReadingLevel, WorksheetGeneration } from "@/lib/types";

const worksheetSchema = z.object({
  title: z.string().min(1),
  story: z.string().min(1),
  questions: z
    .array(
      z.object({
        type: z.enum(["main_idea", "detail", "inferencing"]),
        question: z.string().min(1),
        choices: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
        correctAnswer: z.enum(["A", "B", "C", "D"]),
      }),
    )
    .length(3),
  vocabulary: z.array(
    z.object({
      word: z.string().min(1),
      definition: z.string().min(1),
    }),
  ),
});

function sentenceCount(text: string): number {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

function normalizeChoices(
  choices: [string, string, string, string],
): [string, string, string, string] {
  const labels = ["A", "B", "C", "D"] as const;
  return choices.map((choice, index) => {
    const trimmed = choice.trim();
    return /^[A-D][\).\-\s]/.test(trimmed) ? trimmed : `${labels[index]}. ${trimmed}`;
  }) as [string, string, string, string];
}

function readingLevelInstruction(level: ReadingLevel): string {
  if (level === READING_LEVELS.EIGHTH_GRADE) {
    return "8th grade: simpler syntax, direct vocabulary, and clear sentence structure.";
  }

  return "High school: moderately advanced vocabulary, varied sentence structure, and subtler inferencing.";
}

function regenerateInstruction(mode: "default" | "simpler_vocabulary" | "harder_inferencing") {
  if (mode === "simpler_vocabulary") {
    return "Regeneration mode: simplify vocabulary while preserving meaning and grade appropriateness.";
  }

  if (mode === "harder_inferencing") {
    return "Regeneration mode: keep content age-appropriate but make inferencing question more challenging.";
  }

  return "Regeneration mode: standard balance of clarity and challenge.";
}

export async function generateWorksheetFromTopic(input: {
  sourceTitle: string;
  sourceSummary: string;
  readingLevel: ReadingLevel;
  regenerateStyle: "default" | "simpler_vocabulary" | "harder_inferencing";
}): Promise<WorksheetGeneration> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const prompt = [
    `Source title: ${input.sourceTitle}`,
    `Source summary: ${input.sourceSummary}`,
    `Reading level: ${readingLevelInstruction(input.readingLevel)}`,
    regenerateInstruction(input.regenerateStyle),
    "Return JSON only with this exact schema:",
    `{
  "title": "string",
  "story": "exactly 5 sentences",
  "questions": [
    {
      "type": "main_idea",
      "question": "string",
      "choices": ["A ...", "B ...", "C ...", "D ..."],
      "correctAnswer": "A"
    },
    {
      "type": "detail",
      "question": "string",
      "choices": ["A ...", "B ...", "C ...", "D ..."],
      "correctAnswer": "B"
    },
    {
      "type": "inferencing",
      "question": "string",
      "choices": ["A ...", "B ...", "C ...", "D ..."],
      "correctAnswer": "C"
    }
  ],
  "vocabulary": [
    { "word": "string", "definition": "string" }
  ]
}`,
    "Vocabulary count must be between 3 and 5.",
  ].join("\n\n");

  const response = await openai.chat.completions.create({
    model: openaiModel,
    temperature: 0.6,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "worksheet_response",
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["title", "story", "questions", "vocabulary"],
          properties: {
            title: { type: "string" },
            story: { type: "string" },
            questions: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["type", "question", "choices", "correctAnswer"],
                properties: {
                  type: { type: "string", enum: ["main_idea", "detail", "inferencing"] },
                  question: { type: "string" },
                  choices: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: { type: "string" },
                  },
                  correctAnswer: { type: "string", enum: ["A", "B", "C", "D"] },
                },
              },
            },
            vocabulary: {
              type: "array",
              minItems: 3,
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["word", "definition"],
                properties: {
                  word: { type: "string" },
                  definition: { type: "string" },
                },
              },
            },
          },
        },
        strict: true,
      },
    },
    messages: [
      {
        role: "system",
        content:
          "You are an educational content assistant for a licensed speech-language pathologist. Generate original reading comprehension materials inspired by a current-events topic. Do not copy source text. Keep outputs classroom-safe, concise, and readable.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw new Error("No content returned from the model.");
  }

  const parsed = worksheetSchema.parse(JSON.parse(content));

  if (sentenceCount(parsed.story) !== 5) {
    throw new Error("Generated story did not contain exactly 5 sentences.");
  }

  const typeSet = new Set(parsed.questions.map((question) => question.type));
  if (typeSet.size !== 3) {
    throw new Error("Generated questions did not include all required question types.");
  }

  return {
    title: parsed.title,
    story: parsed.story,
    questions: parsed.questions.map((question) => ({
      ...question,
      choices: normalizeChoices(question.choices),
    })) as WorksheetGeneration["questions"],
    vocabulary: parsed.vocabulary,
  };
}
