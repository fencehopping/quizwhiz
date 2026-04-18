import { NextResponse } from "next/server";
import { ingestNewsForKidsStories, listSourceStories } from "@/lib/sourceStories";

export async function GET() {
  try {
    await ingestNewsForKidsStories();
  } catch {
    // Continue and return already-stored NewsForKids stories if live pull fails.
  }
  const stories = await listSourceStories();
  return NextResponse.json({ stories });
}
