import { NextResponse } from "next/server";
import { ingestGoogleNewsStories } from "@/lib/sourceStories";

export async function POST() {
  try {
    const count = await ingestGoogleNewsStories();
    return NextResponse.json({ insertedOrUpdated: count });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not fetch latest stories from Google News.",
      },
      { status: 502 },
    );
  }
}
