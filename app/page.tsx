import { DashboardClient } from "@/components/DashboardClient";
import { TopNav } from "@/components/TopNav";
import { ingestMockStoriesIfEmpty, listSourceStories } from "@/lib/sourceStories";

export default async function HomePage() {
  await ingestMockStoriesIfEmpty();
  const stories = await listSourceStories();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#dbeafe,#f8fafc_38%)]">
      <TopNav title="Dashboard" subtitle="Build therapy-ready reading materials from today&apos;s stories" />
      <DashboardClient initialStories={stories} />
    </div>
  );
}
