import { mockStories } from "@/lib/mockStories";
import { IngestedSourceStory, SourceProvider } from "@/lib/providers/types";

export class MockSourceProvider implements SourceProvider {
  providerName = "mock";

  async fetchStories(): Promise<IngestedSourceStory[]> {
    return mockStories.map((story) => ({
      ...story,
      sourcePublishedAt: new Date(story.sourcePublishedAt),
    }));
  }
}
