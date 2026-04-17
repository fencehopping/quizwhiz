import { SourceStory } from "@/lib/types";
import { getManualProvider, getMockProvider } from "@/lib/providers";
import { IngestedSourceStory } from "@/lib/providers/types";
import {
  createSourceStory,
  listSourceStoriesFromDb,
  sourceStoryCount,
  upsertSourceStories,
} from "@/lib/store";

function normalizeStories(stories: IngestedSourceStory[]) {
  return stories.map((story) => ({
    sourceTitle: story.sourceTitle,
    sourceSummary: story.sourceSummary,
    sourceUrl: story.sourceUrl,
    sourcePublishedAt: story.sourcePublishedAt.toISOString(),
    rawContent: story.rawContent,
  }));
}

export async function ingestMockStoriesIfEmpty(): Promise<void> {
  const count = await sourceStoryCount();
  if (count > 0) {
    return;
  }

  const provider = getMockProvider();
  const stories = await provider.fetchStories();
  await upsertSourceStories(normalizeStories(stories));
}

export async function refreshMockStories(): Promise<number> {
  const provider = getMockProvider();
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
  return listSourceStoriesFromDb();
}
