"use client";

import { useState } from "react";
import { WorksheetView } from "@/components/WorksheetView";
import { READING_LEVELS, ReadingLevel, WorksheetGeneration, readingLevelOptions } from "@/lib/types";

type GeneratedResponse = WorksheetGeneration & {
  sourceStoryId: string;
  readingLevel: ReadingLevel;
};

export function ManualEntryClient() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>(READING_LEVELS.EIGHTH_GRADE);
  const [generated, setGenerated] = useState<GeneratedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function generate() {
    if (!title.trim() || !summary.trim()) {
      setError("Please provide both a source title and summary.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualTitle: title,
          manualSummary: summary,
          readingLevel,
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

  async function saveWorksheet() {
    if (!generated) {
      return;
    }

    setSaving(true);
    setNotice(null);

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

      setNotice("Saved to library.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save worksheet.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-amber-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-amber-950">Manual Source Entry</h2>
        <p className="mt-1 text-sm text-amber-800">
          Paste a title and short summary, then generate a classroom-ready worksheet.
        </p>

        <div className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-amber-900">
            Article Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-xl border border-amber-300 bg-amber-50 px-3 py-2"
              placeholder="Paste title"
            />
          </label>

          <label className="block text-sm font-medium text-amber-900">
            Short Summary
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className="mt-1 h-32 w-full rounded-xl border border-amber-300 bg-amber-50 px-3 py-2"
              placeholder="Paste short source summary"
            />
          </label>

          <label className="block text-sm font-medium text-amber-900">
            Reading Level
            <select
              value={readingLevel}
              onChange={(event) => setReadingLevel(event.target.value as ReadingLevel)}
              className="mt-1 w-full rounded-xl border border-amber-300 bg-amber-50 px-3 py-2"
            >
              {readingLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="mt-4 rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Worksheet"}
        </button>

        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
      </section>

      {generated ? (
        <>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100"
            >
              Print Worksheet
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
            sourceTitle={title}
          />
        </>
      ) : null}
    </main>
  );
}
