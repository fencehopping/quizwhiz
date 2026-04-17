import { NextResponse } from "next/server";
import { refreshMockStories } from "@/lib/sourceStories";

export async function POST() {
  const count = await refreshMockStories();
  return NextResponse.json({ insertedOrUpdated: count });
}
