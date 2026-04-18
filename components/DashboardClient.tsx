"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReadingLevel, READING_LEVELS, SourceStory, readingLevelOptions } from "@/lib/types";

type GeneratedResponse = {
  sourceStoryId: string;
  readingLevel: ReadingLevel;
  title: string;
  story: string;
  questions: Array<{
    type: "main_idea" | "detail" | "inferencing";
    question: string;
    choices: [string, string, string, string];
    correctAnswer: "A" | "B" | "C" | "D";
  }>;
  vocabulary: Array<{
    word: string;
    definition: string;
  }>;
};

type DashboardClientProps = {
  initialStories: SourceStory[];
};

export function DashboardClient({ initialStories }: DashboardClientProps) {
  const router = useRouter();
  const [stories, setStories] = useState(initialStories);
  const [loadingStoryId, setLoadingStoryId] = useState<string | null>(null);
  const [urlImporting, setUrlImporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sourceUrlInput, setSourceUrlInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [readingLevelsByStory, setReadingLevelsByStory] = useState<Record<string, ReadingLevel>>(
    Object.fromEntries(initialStories.map((story) => [story.id, READING_LEVELS.EIGHTH_GRADE])),
  );

  async function refreshStories() {
    setRefreshing(true);
    setError(null);
    setNotice(null);

    try {
      await fetch("/api/source-stories/ingest", { method: "POST" });
      const response = await fetch("/api/source-stories");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not refresh stories.");
      }

      setStories(payload.stories);
      setReadingLevelsByStory((current) => {
        const next = { ...current };
        for (const story of payload.stories as SourceStory[]) {
          if (!next[story.id]) {
            next[story.id] = READING_LEVELS.EIGHTH_GRADE;
          }
        }
        return next;
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not refresh stories.");
    } finally {
      setRefreshing(false);
    }
  }

  async function importStoriesFromUrl() {
    const trimmedUrl = sourceUrlInput.trim();
    if (!trimmedUrl) {
      setError("Paste a URL to import stories.");
      return;
    }

    setUrlImporting(true);
    setError(null);
    setNotice(null);

    try {
      const importResponse = await fetch("/api/source-stories/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      const importPayload = (await importResponse.json()) as {
        insertedOrUpdated?: number;
        error?: string;
      };

      if (!importResponse.ok) {
        throw new Error(importPayload.error ?? "Could not import stories from URL.");
      }

      const response = await fetch("/api/source-stories");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Stories imported but list refresh failed.");
      }

      setStories(payload.stories);
      setReadingLevelsByStory((current) => {
        const next = { ...current };
        for (const story of payload.stories as SourceStory[]) {
          if (!next[story.id]) {
            next[story.id] = READING_LEVELS.EIGHTH_GRADE;
          }
        }
        return next;
      });
      setNotice(`Imported ${importPayload.insertedOrUpdated ?? 0} story candidates.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not import stories.");
    } finally {
      setUrlImporting(false);
    }
  }

  async function generateAndOpenWorksheet(storyId: string) {
    setLoadingStoryId(storyId);
    setError(null);
    setNotice(null);

    try {
      const readingLevel = readingLevelsByStory[storyId] ?? READING_LEVELS.EIGHTH_GRADE;

      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceStoryId: storyId,
          readingLevel,
          regenerateStyle: "default",
        }),
      });

      const generated = (await generateResponse.json()) as GeneratedResponse | { error?: string };
      if (!generateResponse.ok || !("title" in generated)) {
        throw new Error((generated as { error?: string }).error ?? "Generation failed.");
      }

      const saveResponse = await fetch("/api/worksheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceStoryId: generated.sourceStoryId,
          readingLevel: generated.readingLevel,
          worksheet: {
            title: generated.title,
            story: generated.story,
            questions: generated.questions,
            vocabulary: generated.vocabulary,
          },
        }),
      });

      const savedPayload = (await saveResponse.json()) as {
        worksheet?: { id: string };
        error?: string;
      };

      if (!saveResponse.ok || !savedPayload.worksheet?.id) {
        throw new Error(savedPayload.error ?? "Could not save worksheet.");
      }

      router.push(`/worksheets/${savedPayload.worksheet.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not create worksheet.");
    } finally {
      setLoadingStoryId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-cyan-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-teal-950">Today&apos;s Stories</h2>
            <p className="mt-1 text-sm text-teal-800">
              Pick a reading level in any row, then generate to jump directly to the worksheet.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshStories}
            disabled={refreshing}
            className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-cyan-200 bg-cyan-50/60 p-3 sm:flex-row sm:items-center">
          <input
            type="url"
            value={sourceUrlInput}
            onChange={(event) => setSourceUrlInput(event.target.value)}
            placeholder="Paste a news/category URL to extract story links..."
            className="w-full rounded-xl border border-cyan-300 bg-white px-3 py-2 text-sm text-teal-950 placeholder:text-teal-700/60"
          />
          <button
            type="button"
            onClick={importStoriesFromUrl}
            disabled={urlImporting}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
          >
            {urlImporting ? "Importing..." : "Import Stories"}
          </button>
        </div>

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        {notice ? <p className="mt-3 text-sm text-teal-700">{notice}</p> : null}

        <div className="mt-4 divide-y divide-cyan-100 overflow-hidden rounded-2xl border border-cyan-200">
          {stories.map((story) => {
            const isLoading = loadingStoryId === story.id;
            const currentLevel = readingLevelsByStory[story.id] ?? READING_LEVELS.EIGHTH_GRADE;

            return (
              <div key={story.id} className="grid gap-4 bg-cyan-50/40 p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div>
                  <h3 className="text-base font-semibold text-teal-950">{story.sourceTitle}</h3>
                  <p className="mt-1 text-sm text-teal-800">{story.sourceSummary}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-teal-700">
                    <a
                      href={story.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-2"
                    >
                      Source link
                    </a>
                    <span>{new Date(story.sourcePublishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <label className="text-sm font-medium text-teal-900">
                  Reading Level
                  <select
                    value={currentLevel}
                    onChange={(event) =>
                      setReadingLevelsByStory((current) => ({
                        ...current,
                        [story.id]: event.target.value as ReadingLevel,
                      }))
                    }
                    className="mt-1 w-full min-w-40 rounded-xl border border-cyan-300 bg-white px-3 py-2 text-teal-950"
                  >
                    {readingLevelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => generateAndOpenWorksheet(story.id)}
                  disabled={isLoading || loadingStoryId !== null}
                  className="h-fit rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
                >
                  {isLoading ? "Generating..." : "Generate Worksheet"}
                </button>
              </div>
            );
          })}

          {stories.length === 0 ? (
            <div className="p-6 text-center text-teal-800">No stories available yet.</div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
