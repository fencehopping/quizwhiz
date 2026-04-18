import { NextResponse } from "next/server";
import { importStoriesFromUrl } from "@/lib/sourceStories";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const insertedOrUpdated = await importStoriesFromUrl(body.url ?? "");

    return NextResponse.json({ insertedOrUpdated });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not import stories from that URL.",
      },
      { status: 400 },
    );
  }
}
