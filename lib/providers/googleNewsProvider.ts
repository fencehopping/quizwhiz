import { IngestedSourceStory, SourceProvider } from "@/lib/providers/types";

const GOOGLE_NEWS_RSS_US = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";
const MAX_ITEMS = 25;

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(input: string): string {
  return decodeXmlEntities(input.replace(/<[^>]+>/g, " ")).trim();
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

export class GoogleNewsProvider implements SourceProvider {
  providerName = "google-news";

  async fetchStories(): Promise<IngestedSourceStory[]> {
    const response = await fetch(GOOGLE_NEWS_RSS_US, {
      headers: {
        accept: "application/rss+xml, application/xml, text/xml",
        "user-agent": "SpeechWhizBot/1.0 (+https://quizwhiz.vercel.app)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Google News fetch failed (${response.status}).`);
    }

    const xml = await response.text();
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gim) ?? [];

    const stories = itemMatches.slice(0, MAX_ITEMS).flatMap((item): IngestedSourceStory[] => {
      const title = decodeXmlEntities(extractTag(item, "title"));
      const summary = stripHtml(extractTag(item, "description"));
      const link = decodeXmlEntities(extractTag(item, "link"));
      const pubDateRaw = extractTag(item, "pubDate");
      const publishedAt = pubDateRaw ? new Date(pubDateRaw) : new Date();

      if (!title || !summary || !link || Number.isNaN(publishedAt.getTime())) {
        return [];
      }

      return [
        {
          sourceTitle: title,
          sourceSummary: summary,
          sourceUrl: link,
          sourcePublishedAt: publishedAt,
          rawContent: item,
        },
      ];
    });

    return stories;
  }
}
