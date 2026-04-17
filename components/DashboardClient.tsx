"use client";

import { useMemo, useState } from "react";
import { SourceStoryCard } from "@/components/SourceStoryCard";
import { WorksheetView } from "@/components/WorksheetView";
import {
  READING_LEVELS,
  ReadingLevel,
  SourceStory,
  WorksheetGeneration,
  readingLevelOptions,
} from "@/lib/types";

type GeneratedResponse = WorksheetGeneration & {
  sourceStoryId: string;
  readingLevel: ReadingLevel;
};

type DashboardClientProps = {
  initialStories: SourceStory[];
};

function worksheetAsPlainText(worksheet: WorksheetGeneration): string {
  const questionText = worksheet.questions
    .map((question, index) => {
      return `${index + 1}. (${question.type}) ${question.question}\n${question.choices.join("\n")}`;
    })
    .join("\n\n");

  const answerText = worksheet.questions
    .map((question, index) => `Question ${index + 1}: ${question.correctAnswer}`)
    .join("\n");

  const vocabText = worksheet.vocabulary
    .map((item) => `${item.word}: ${item.definition}`)
    .join("\n");

  return `${worksheet.title}\n\nStory:\n${worksheet.story}\n\nMultiple Choice Questions:\n${questionText}\n\nAnswer Key:\n${answerText}\n\nVocabulary:\n${vocabText}`;
}

export function DashboardClient({ initialStories }: DashboardClientProps) {
  const [stories, setStories] = useState(initialStories);
  const [selectedStoryId, setSelectedStoryId] = useState(initialStories[0]?.id ?? "");
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(READING_LEVELS.EIGHTH_GRADE);
  const [generated, setGenerated] = useState<GeneratedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const selectedStory = useMemo(
    () => stories.find((story) => story.id === selectedStoryId),
    [selectedStoryId, stories],
  );

  async function generate(regenerateStyle: "default" | "simpler_vocabulary" | "harder_inferencing") {
    if (!selectedStoryId) {
      setError("Please select a story first.");
      return;
    }

    setLoading(true);
    setSavedMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceStoryId: selectedStoryId,
          readingLevel,
          regenerateStyle,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Generation failed.");
      }

      setGenerated(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshStories() {
    setRefreshing(true);
    setError(null);

    try {
      await fetch("/api/source-stories/ingest", { method: "POST" });
      const response = await fetch("/api/source-stories");
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not refresh stories.");
      }

      setStories(payload.stories);
      if (!selectedStoryId && payload.stories.length > 0) {
        setSelectedStoryId(payload.stories[0].id);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not refresh stories.");
    } finally {
      setRefreshing(false);
    }
  }

  async function saveWorksheet() {
    if (!generated) {
      return;
    }

    setSaving(true);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/worksheets", {
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

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save worksheet.");
      }

      setSavedMessage("Saved to library.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save worksheet.");
    } finally {
      setSaving(false);
    }
  }

  function copyWorksheet() {
    if (!generated) {
      return;
    }

    navigator.clipboard.writeText(
      worksheetAsPlainText({
        title: generated.title,
        story: generated.story,
        questions: generated.questions,
        vocabulary: generated.vocabulary,
      }),
    );
    setSavedMessage("Copied to clipboard.");
  }

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8">
      <section className="space-y-4">
        <div className="rounded-3xl border border-cyan-200 bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-teal-950">Today&apos;s Stories</h2>
            <button
              type="button"
              onClick={refreshStories}
              disabled={refreshing}
              className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <p className="mt-1 text-sm text-teal-800">Choose one source and a reading level, then generate.</p>

          <div className="mt-4 space-y-3">
            {stories.map((story) => (
              <SourceStoryCard
                key={story.id}
                story={story}
                selected={story.id === selectedStoryId}
                onSelect={setSelectedStoryId}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-cyan-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-teal-950">Generate Worksheet</h2>
          <label htmlFor="reading-level" className="mt-4 block text-sm font-medium text-teal-900">
            Reading Level
          </label>
          <select
            id="reading-level"
            value={readingLevel}
            onChange={(event) => setReadingLevel(event.target.value as ReadingLevel)}
            className="mt-1 w-full rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2 text-teal-950"
          >
            {readingLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => generate("default")}
            disabled={loading || !selectedStoryId}
            className="mt-4 w-full rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
          >
            {loading ? "Generating..." : "Generate Worksheet"}
          </button>

          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          {savedMessage ? <p className="mt-3 text-sm text-emerald-700">{savedMessage}</p> : null}
        </div>

        {generated ? (
          <>
            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                type="button"
                onClick={copyWorksheet}
                className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100"
              >
                Copy Output
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100"
              >
                Print Worksheet
              </button>
              <button
                type="button"
                onClick={() => generate("default")}
                disabled={loading}
                className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100 disabled:opacity-50"
              >
                Regenerate
              </button>
              <button
                type="button"
                onClick={() => generate("simpler_vocabulary")}
                disabled={loading}
                className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100 disabled:opacity-50"
              >
                Regenerate with Simpler Vocabulary
              </button>
              <button
                type="button"
                onClick={() => generate("harder_inferencing")}
                disabled={loading}
                className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100 disabled:opacity-50"
              >
                Regenerate with Harder Inferencing
              </button>
              <button
                type="button"
                onClick={saveWorksheet}
                disabled={saving}
                className="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save to Library"}
              </button>
            </div>

            <WorksheetView
              worksheet={{
                title: generated.title,
                story: generated.story,
                questions: generated.questions,
                vocabulary: generated.vocabulary,
              }}
              readingLevel={generated.readingLevel}
              sourceTitle={selectedStory?.sourceTitle}
            />
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-cyan-300 bg-cyan-50 p-8 text-center text-teal-800">
            Worksheet output will appear here after generation.
          </div>
        )}
      </section>
    </main>
  );
}
