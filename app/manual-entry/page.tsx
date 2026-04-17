import { ManualEntryClient } from "@/components/ManualEntryClient";
import { TopNav } from "@/components/TopNav";

export default function ManualEntryPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e6f7ff,white_35%)]">
      <TopNav
        title="Manual Entry"
        subtitle="Paste your own source summary when needed"
      />
      <ManualEntryClient />
    </div>
  );
}
