"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReadingLevel, WorksheetGeneration } from "@/lib/types";

type GenerateJobPayload = {
  sourceStoryId: string;
  sourceTitle: string;
  sourceSummary: string;
  readingLevel: ReadingLevel;
};

type GeneratedResponse = WorksheetGeneration & {
  sourceStoryId: string;
  readingLevel: ReadingLevel;
};

function LoadingSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-900">Generating worksheet...</p>
      </div>
      <div className="h-6 w-2/3 animate-pulse rounded bg-slate-200" />
      <div className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-10/12 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-9/12 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-20 w-full animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function GenerateWorksheetClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStartedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const jobId = useMemo(() => searchParams.get("job"), [searchParams]);

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }
    hasStartedRef.current = true;

    async function run() {
      try {
        if (!jobId) {
          throw new Error("Generation job was missing. Please start from Today's Stories.");
        }

        const storageKey = `generate-job:${jobId}`;
        const rawPayload = sessionStorage.getItem(storageKey);
        if (!rawPayload) {
          throw new Error("Generation job expired. Please start again from Today's Stories.");
        }

        const payload = JSON.parse(rawPayload) as GenerateJobPayload;

        const generateResponse = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sourceStoryId: payload.sourceStoryId,
            sourceTitle: payload.sourceTitle,
            sourceSummary: payload.sourceSummary,
            readingLevel: payload.readingLevel,
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

        // Keep the payload until redirect is in flight to avoid false \"expired\"
        // errors if client effects rerun before navigation completes.
        router.replace(`/worksheets/${savedPayload.worksheet.id}`);
        setTimeout(() => {
          sessionStorage.removeItem(storageKey);
        }, 1000);
      } catch (generationError) {
        setError(
          generationError instanceof Error
            ? generationError.message
            : "Could not generate worksheet.",
        );
      }
    }

    void run();
  }, [jobId, router]);

  if (error) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-red-300 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-900">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Back to Stories
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <LoadingSkeleton />
    </main>
  );
}
