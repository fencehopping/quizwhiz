"use client";

import { useRouter } from "next/navigation";
import { WorksheetGeneration } from "@/lib/types";

type SavedWorksheetActionsProps = {
  worksheetId: string;
  worksheet: WorksheetGeneration;
};

function asText(worksheet: WorksheetGeneration) {
  const questions = worksheet.questions
    .map((q, index) => `${index + 1}. ${q.question}\n${q.choices.join("\n")}`)
    .join("\n\n");

  const answers = worksheet.questions
    .map((q, index) => `Question ${index + 1}: ${q.correctAnswer}`)
    .join("\n");

  return `${worksheet.title}\n\n${worksheet.story}\n\n${questions}\n\nAnswer Key\n${answers}`;
}

export function SavedWorksheetActions({ worksheetId, worksheet }: SavedWorksheetActionsProps) {
  const router = useRouter();

  async function deleteItem() {
    if (!window.confirm("Delete this worksheet?")) {
      return;
    }

    const response = await fetch(`/api/worksheets/${worksheetId}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/library");
      router.refresh();
    }
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2 print:hidden">
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(asText(worksheet))}
        className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100"
      >
        Copy Output
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-full border border-cyan-300 px-3 py-1.5 text-sm font-medium text-teal-900 hover:bg-cyan-100"
      >
        Print Quiz as PDF
      </button>
      <button
        type="button"
        onClick={deleteItem}
        className="rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}
