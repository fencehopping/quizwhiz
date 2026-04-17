export const READING_LEVELS = {
  EIGHTH_GRADE: "EIGHTH_GRADE",
  HIGH_SCHOOL: "HIGH_SCHOOL",
} as const;

export type ReadingLevel = (typeof READING_LEVELS)[keyof typeof READING_LEVELS];
export const readingLevels = Object.values(READING_LEVELS);
export const isReadingLevel = (value: unknown): value is ReadingLevel =>
  typeof value === "string" && readingLevels.includes(value as ReadingLevel);

export const readingLevelOptions: Array<{ value: ReadingLevel; label: string }> = [
  { value: READING_LEVELS.EIGHTH_GRADE, label: "8th Grade" },
  { value: READING_LEVELS.HIGH_SCHOOL, label: "High School" },
];

export type SourceStory = {
  id: string;
  sourceTitle: string;
  sourceSummary: string;
  sourceUrl: string;
  sourcePublishedAt: string;
  rawContent?: string;
  createdAt: string;
};

export type WorksheetQuestionType = "main_idea" | "detail" | "inferencing";

export type WorksheetQuestion = {
  type: WorksheetQuestionType;
  question: string;
  choices: [string, string, string, string];
  correctAnswer: "A" | "B" | "C" | "D";
};

export type VocabularyItem = {
  word: string;
  definition: string;
};

export type WorksheetGeneration = {
  title: string;
  story: string;
  questions: [WorksheetQuestion, WorksheetQuestion, WorksheetQuestion];
  vocabulary: VocabularyItem[];
};

export type GeneratedWorksheet = {
  id: string;
  sourceStoryId: string;
  readingLevel: ReadingLevel;
  title: string;
  story: string;
  questionsJson: WorksheetGeneration["questions"];
  answerKeyJson: Array<{ question: number; type: WorksheetQuestionType; correctAnswer: "A" | "B" | "C" | "D" }>;
  vocabularyJson: WorksheetGeneration["vocabulary"];
  createdAt: string;
};

export type GenerateRequestBody = {
  sourceStoryId?: string;
  manualTitle?: string;
  manualSummary?: string;
  readingLevel?: ReadingLevel;
  regenerateStyle?: "default" | "simpler_vocabulary" | "harder_inferencing";
};
