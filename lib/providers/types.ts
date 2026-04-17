export type IngestedSourceStory = {
  sourceTitle: string;
  sourceSummary: string;
  sourceUrl: string;
  sourcePublishedAt: Date;
  rawContent?: string;
};

export interface SourceProvider {
  providerName: string;
  fetchStories(): Promise<IngestedSourceStory[]>;
}
