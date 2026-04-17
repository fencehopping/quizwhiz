import { mockStories } from "../lib/mockStories";
import { upsertSourceStories } from "../lib/store";

async function main() {
  const inserted = await upsertSourceStories(
    mockStories.map((story) => ({
      sourceTitle: story.sourceTitle,
      sourceSummary: story.sourceSummary,
      sourceUrl: story.sourceUrl,
      sourcePublishedAt: new Date(story.sourcePublishedAt).toISOString(),
      rawContent: story.rawContent,
    })),
  );

  console.log(`Seeded/updated ${inserted} mock stories.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
