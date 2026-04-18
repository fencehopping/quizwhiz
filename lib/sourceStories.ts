import { SourceStory } from "@/lib/types";
import { getGoogleNewsProvider, getManualProvider, getUrlProvider } from "@/lib/providers";
import { IngestedSourceStory } from "@/lib/providers/types";
import {
  createSourceStory,
  listSourceStoriesFromDb,
  upsertSourceStories,
} from "@/lib/store";

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function cleanText(input: string): string {
  return decodeHtmlEntities(input).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeStories(stories: IngestedSourceStory[]) {
  return stories.map((story) => ({
    sourceTitle: cleanText(story.sourceTitle),
    sourceSummary: cleanText(story.sourceSummary),
    sourceUrl: story.sourceUrl,
    sourcePublishedAt: story.sourcePublishedAt.toISOString(),
    rawContent: story.rawContent,
  }));
}

export async function ingestGoogleNewsStories(): Promise<number> {
  const provider = getGoogleNewsProvider();
  const stories = await provider.fetchStories();
  return upsertSourceStories(normalizeStories(stories));
}

export async function createManualSourceStory(input: {
  sourceTitle: string;
  sourceSummary: string;
}): Promise<SourceStory> {
  const provider = getManualProvider(input.sourceTitle, input.sourceSummary);
  const [manualStory] = await provider.fetchStories();

  if (!manualStory) {
    throw new Error("Manual source input cannot be empty.");
  }

  return createSourceStory({
    sourceTitle: manualStory.sourceTitle,
    sourceSummary: manualStory.sourceSummary,
    sourceUrl: manualStory.sourceUrl,
    sourcePublishedAt: manualStory.sourcePublishedAt.toISOString(),
    rawContent: manualStory.rawContent,
  });
}

export async function listSourceStories() {
  const stories = await listSourceStoriesFromDb();
  return stories
    .filter((story) => story.sourceUrl.includes("news.google.com"))
    .map((story) => ({
      ...story,
      sourceTitle: cleanText(story.sourceTitle),
      sourceSummary: cleanText(story.sourceSummary),
    }));
}

export async function importStoriesFromUrl(url: string): Promise<number> {
  const trimmed = url.trim();
  if (!trimmed) {
    throw new Error("Please provide a URL.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new Error("Please provide a valid URL.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only http/https URLs are supported.");
  }

  const provider = getUrlProvider(parsedUrl.toString());
  const stories = await provider.fetchStories();

  if (stories.length === 0) {
    throw new Error("No story candidates were found on that page.");
  }

  return upsertSourceStories(normalizeStories(stories));
}
