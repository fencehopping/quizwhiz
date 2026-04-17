import { IngestedSourceStory, SourceProvider } from "@/lib/providers/types";

export class ManualSourceProvider implements SourceProvider {
  providerName = "manual";

  constructor(
    private readonly sourceTitle: string,
    private readonly sourceSummary: string,
  ) {}

  async fetchStories(): Promise<IngestedSourceStory[]> {
    const trimmedTitle = this.sourceTitle.trim();
    const trimmedSummary = this.sourceSummary.trim();

    if (!trimmedTitle || !trimmedSummary) {
      return [];
    }

    const slug = `${trimmedTitle}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    return [
      {
        sourceTitle: trimmedTitle,
        sourceSummary: trimmedSummary,
        sourceUrl: `manual://story/${slug}`,
        sourcePublishedAt: new Date(),
      },
    ];
  }
}
