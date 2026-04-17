"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { READING_LEVELS, ReadingLevel, readingLevelOptions } from "@/lib/types";

type WorksheetListItem = {
  id: string;
  title: string;
  readingLevel: ReadingLevel;
  createdAt: string;
  sourceStory?: {
    sourceTitle: string;
  };
};

type LibraryClientProps = {
  initialItems: WorksheetListItem[];
};

export function LibraryClient({ initialItems }: LibraryClientProps) {
  const [readingLevel, setReadingLevel] = useState<"ALL" | ReadingLevel>("ALL");
  const [items, setItems] = useState<WorksheetListItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async (level: "ALL" | ReadingLevel) => {
    setLoading(true);
    setError(null);

    try {
      const suffix = level === "ALL" ? "" : `?readingLevel=${level}`;
      const response = await fetch(`/api/worksheets${suffix}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load saved worksheets.");
      }

      setItems(payload.worksheets);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Could not load saved worksheets.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleLevelChange(nextLevel: "ALL" | ReadingLevel) {
    setReadingLevel(nextLevel);
    await loadItems(nextLevel);
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm("Delete this saved worksheet?");
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/worksheets/${id}`, { method: "DELETE" });
    if (response.ok) {
      setItems((current) => current.filter((item) => item.id !== id));
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-cyan-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-teal-950">Saved Materials</h2>
          <label className="text-sm text-teal-900">
            Filter by Reading Level
            <select
              value={readingLevel}
              onChange={(event) =>
                void handleLevelChange(event.target.value as "ALL" | ReadingLevel)
              }
              className="ml-2 rounded-lg border border-cyan-300 bg-cyan-50 px-2 py-1"
            >
              <option value="ALL">All</option>
              {readingLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? <p className="mt-4 text-teal-800">Loading...</p> : null}
        {error ? <p className="mt-4 text-red-700">{error}</p> : null}

        {!loading && !error ? (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4"
              >
                <div>
                  <h3 className="font-semibold text-teal-950">{item.title}</h3>
                  <p className="text-sm text-teal-800">
                    From: {item.sourceStory?.sourceTitle ?? "Unknown source"}
                  </p>
                  <p className="text-xs text-teal-700">
                    {item.readingLevel === READING_LEVELS.EIGHTH_GRADE ? "8th Grade" : "High School"} ·{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/worksheets/${item.id}`}
                    className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {items.length === 0 ? (
              <li className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50 p-5 text-teal-800">
                No saved worksheets yet.
              </li>
            ) : null}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
