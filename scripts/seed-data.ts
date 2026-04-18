import { ingestNewsForKidsStories } from "../lib/sourceStories";

async function main() {
  const inserted = await ingestNewsForKidsStories();

  console.log(`Fetched/updated ${inserted} NewsForKids stories.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
