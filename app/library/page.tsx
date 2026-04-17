import { LibraryClient } from "@/components/LibraryClient";
import { TopNav } from "@/components/TopNav";
import { listWorksheetsFromDb } from "@/lib/store";

export default async function LibraryPage() {
  const worksheets = await listWorksheetsFromDb();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e6f7ff,white_35%)]">
      <TopNav title="Saved Materials" subtitle="Re-open and manage prior worksheets" />
      <LibraryClient initialItems={worksheets} />
    </div>
  );
}
