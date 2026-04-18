import { DashboardClient } from "@/components/DashboardClient";
import { TopNav } from "@/components/TopNav";
import { ingestNewsForKidsStories, listSourceStories } from "@/lib/sourceStories";

export default async function HomePage() {
  try {
    await ingestNewsForKidsStories();
  } catch {
    // Allow page render with previously cached Google stories if live fetch fails.
  }
  const stories = await listSourceStories();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,#f8fafc_38%)]">
      <TopNav title="Dashboard" subtitle="Build therapy-ready reading materials from today&apos;s stories" />
      <DashboardClient initialStories={stories} />
    </div>
  );
}
