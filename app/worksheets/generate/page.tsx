import { Suspense } from "react";
import { GenerateWorksheetClient } from "@/components/GenerateWorksheetClient";
import { TopNav } from "@/components/TopNav";

export default function GenerateWorksheetPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,#f8fafc_38%)]">
      <TopNav title="Generating" subtitle="Building your worksheet now" />
      <Suspense
        fallback={
          <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-700 border-t-transparent" />
                <p className="text-sm font-semibold text-slate-900">Preparing worksheet...</p>
              </div>
            </div>
          </main>
        }
      >
        <GenerateWorksheetClient />
      </Suspense>
    </div>
  );
}
