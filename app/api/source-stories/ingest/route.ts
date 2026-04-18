import { NextResponse } from "next/server";
import { ingestNewsForKidsStories } from "@/lib/sourceStories";

export async function POST() {
  try {
    const count = await ingestNewsForKidsStories();
    return NextResponse.json({ insertedOrUpdated: count });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not fetch latest stories from NewsForKids.",
      },
      { status: 502 },
    );
  }
}
