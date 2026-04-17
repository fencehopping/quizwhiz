import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { GeneratedWorksheet, ReadingLevel, SourceStory, WorksheetGeneration } from "@/lib/types";

type DatabaseShape = {
  sourceStories: SourceStory[];
  generatedWorksheets: GeneratedWorksheet[];
};

const dataDir = path.join(process.cwd(), "data");
const dbFileName = process.env.DATABASE_FILE ?? "db.json";
const dbPath = path.join(dataDir, dbFileName);

async function ensureDb(): Promise<void> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    const emptyDb: DatabaseShape = { sourceStories: [], generatedWorksheets: [] };
    await fs.writeFile(dbPath, JSON.stringify(emptyDb, null, 2), "utf8");
  }
}

async function readDb(): Promise<DatabaseShape> {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw) as DatabaseShape;
}

async function writeDb(db: DatabaseShape): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export async function upsertSourceStories(
  stories: Array<Omit<SourceStory, "id" | "createdAt">>,
): Promise<number> {
  const db = await readDb();
  let touched = 0;

  for (const story of stories) {
    const idx = db.sourceStories.findIndex((item) => item.sourceUrl === story.sourceUrl);

    if (idx >= 0) {
      db.sourceStories[idx] = {
        ...db.sourceStories[idx],
        ...story,
      };
      touched += 1;
      continue;
    }

    db.sourceStories.push({
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...story,
    });
    touched += 1;
  }

  await writeDb(db);
  return touched;
}

export async function createSourceStory(
  story: Omit<SourceStory, "id" | "createdAt">,
): Promise<SourceStory> {
  const db = await readDb();
  const created: SourceStory = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...story,
  };
  db.sourceStories.push(created);
  await writeDb(db);
  return created;
}

export async function getSourceStoryById(id: string): Promise<SourceStory | undefined> {
  const db = await readDb();
  return db.sourceStories.find((story) => story.id === id);
}

export async function listSourceStoriesFromDb(): Promise<SourceStory[]> {
  const db = await readDb();
  return [...db.sourceStories].sort(
    (a, b) => new Date(b.sourcePublishedAt).getTime() - new Date(a.sourcePublishedAt).getTime(),
  );
}

export async function listWorksheetsFromDb(readingLevel?: ReadingLevel) {
  const db = await readDb();
  const filtered = readingLevel
    ? db.generatedWorksheets.filter((worksheet) => worksheet.readingLevel === readingLevel)
    : db.generatedWorksheets;

  const byId = new Map(db.sourceStories.map((story) => [story.id, story]));

  return filtered
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((worksheet) => ({
      ...worksheet,
      sourceStory: byId.get(worksheet.sourceStoryId),
    }));
}

export async function createWorksheetInDb(input: {
  sourceStoryId: string;
  readingLevel: ReadingLevel;
  worksheet: WorksheetGeneration;
}): Promise<GeneratedWorksheet> {
  const db = await readDb();
  const answerKey = input.worksheet.questions.map((q, index) => ({
    question: index + 1,
    type: q.type,
    correctAnswer: q.correctAnswer,
  }));

  const created: GeneratedWorksheet = {
    id: randomUUID(),
    sourceStoryId: input.sourceStoryId,
    readingLevel: input.readingLevel,
    title: input.worksheet.title,
    story: input.worksheet.story,
    questionsJson: input.worksheet.questions,
    answerKeyJson: answerKey,
    vocabularyJson: input.worksheet.vocabulary,
    createdAt: new Date().toISOString(),
  };

  db.generatedWorksheets.push(created);
  await writeDb(db);
  return created;
}

export async function getWorksheetById(id: string) {
  const db = await readDb();
  const worksheet = db.generatedWorksheets.find((item) => item.id === id);

  if (!worksheet) {
    return undefined;
  }

  return {
    ...worksheet,
    sourceStory: db.sourceStories.find((story) => story.id === worksheet.sourceStoryId),
  };
}

export async function deleteWorksheetById(id: string): Promise<boolean> {
  const db = await readDb();
  const before = db.generatedWorksheets.length;
  db.generatedWorksheets = db.generatedWorksheets.filter((worksheet) => worksheet.id !== id);
  await writeDb(db);
  return db.generatedWorksheets.length < before;
}

export async function sourceStoryCount(): Promise<number> {
  const db = await readDb();
  return db.sourceStories.length;
}
