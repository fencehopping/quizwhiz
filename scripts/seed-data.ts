import { ingestGoogleNewsStories } from "../lib/sourceStories";

async function main() {
  const inserted = await ingestGoogleNewsStories();

  console.log(`Fetched/updated ${inserted} Google News stories.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
