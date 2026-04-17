import { NextResponse } from "next/server";
import { generateWorksheetFromTopic } from "@/lib/generation";
import { createManualSourceStory } from "@/lib/sourceStories";
import { GenerateRequestBody, isReadingLevel } from "@/lib/types";
import { getSourceStoryById } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;

    if (!body.readingLevel || !isReadingLevel(body.readingLevel)) {
      return NextResponse.json(
        { error: "Please select a valid reading level." },
        { status: 400 },
      );
    }

    let sourceStoryId = body.sourceStoryId;

    if (!sourceStoryId) {
      if (!body.manualTitle?.trim() || !body.manualSummary?.trim()) {
        return NextResponse.json(
          { error: "Please provide a source story or manual title/summary." },
          { status: 400 },
        );
      }

      const manualStory = await createManualSourceStory({
        sourceTitle: body.manualTitle,
        sourceSummary: body.manualSummary,
      });
      sourceStoryId = manualStory.id;
    }

    const sourceStory = await getSourceStoryById(sourceStoryId);

    if (!sourceStory) {
      return NextResponse.json({ error: "Selected source story was not found." }, { status: 404 });
    }

    const worksheet = await generateWorksheetFromTopic({
      sourceTitle: sourceStory.sourceTitle,
      sourceSummary: sourceStory.sourceSummary,
      readingLevel: body.readingLevel,
      regenerateStyle: body.regenerateStyle ?? "default",
    });

    return NextResponse.json({
      sourceStoryId: sourceStory.id,
      readingLevel: body.readingLevel,
      ...worksheet,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Generation failed. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
