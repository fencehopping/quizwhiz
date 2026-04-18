import { GenerateWorksheetClient } from "@/components/GenerateWorksheetClient";
import { TopNav } from "@/components/TopNav";

export default function GenerateWorksheetPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,#f8fafc_38%)]">
      <TopNav title="Generating" subtitle="Building your worksheet now" />
      <GenerateWorksheetClient />
    </div>
  );
}
