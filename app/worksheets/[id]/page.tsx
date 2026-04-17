import { notFound } from "next/navigation";
import { SavedWorksheetActions } from "@/components/SavedWorksheetActions";
import { TopNav } from "@/components/TopNav";
import { WorksheetView } from "@/components/WorksheetView";
import { ReadingLevel, WorksheetGeneration } from "@/lib/types";
import { getWorksheetById } from "@/lib/store";

export default async function WorksheetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const worksheet = await getWorksheetById(id);

  if (!worksheet) {
    notFound();
  }

  const parsedWorksheet: WorksheetGeneration = {
    title: worksheet.title,
    story: worksheet.story,
    questions: worksheet.questionsJson,
    vocabulary: worksheet.vocabularyJson,
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e6f7ff,white_35%)]">
      <TopNav title="Worksheet" subtitle="Saved material" />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <SavedWorksheetActions worksheetId={worksheet.id} worksheet={parsedWorksheet} />
        <WorksheetView
          worksheet={parsedWorksheet}
          readingLevel={worksheet.readingLevel as ReadingLevel}
          sourceTitle={worksheet.sourceStory?.sourceTitle ?? "Unknown source"}
        />
      </main>
    </div>
  );
}
