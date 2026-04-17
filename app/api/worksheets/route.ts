import { NextResponse } from "next/server";
import { ReadingLevel, WorksheetGeneration, isReadingLevel } from "@/lib/types";
import { createWorksheetInDb, listWorksheetsFromDb } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("readingLevel");

  const worksheets = await listWorksheetsFromDb(level && isReadingLevel(level) ? level : undefined);

  return NextResponse.json({ worksheets });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      sourceStoryId?: string;
      readingLevel?: ReadingLevel;
      worksheet?: WorksheetGeneration;
    };

    if (!body.sourceStoryId) {
      return NextResponse.json({ error: "Missing source story ID." }, { status: 400 });
    }

    if (!body.readingLevel || !isReadingLevel(body.readingLevel)) {
      return NextResponse.json({ error: "Missing reading level." }, { status: 400 });
    }

    if (!body.worksheet) {
      return NextResponse.json({ error: "Missing worksheet content." }, { status: 400 });
    }

    const created = await createWorksheetInDb({
      sourceStoryId: body.sourceStoryId,
      readingLevel: body.readingLevel,
      worksheet: body.worksheet,
    });

    return NextResponse.json({ worksheet: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not save worksheet.",
      },
      { status: 500 },
    );
  }
}
