import { NextResponse } from "next/server";
import { ingestGoogleNewsStories, listSourceStories } from "@/lib/sourceStories";

export async function GET() {
  try {
    await ingestGoogleNewsStories();
  } catch {
    // Continue and return already-stored Google stories if live pull fails.
  }
  const stories = await listSourceStories();
  return NextResponse.json({ stories });
}
