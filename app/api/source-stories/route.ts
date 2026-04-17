import { NextResponse } from "next/server";
import { ingestMockStoriesIfEmpty, listSourceStories } from "@/lib/sourceStories";

export async function GET() {
  await ingestMockStoriesIfEmpty();
  const stories = await listSourceStories();
  return NextResponse.json({ stories });
}
