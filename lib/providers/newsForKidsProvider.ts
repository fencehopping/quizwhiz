import { IngestedSourceStory, SourceProvider } from "@/lib/providers/types";

const NEWS_FOR_KIDS_RSS = "https://newsforkids.net/feed/";
const MAX_ITEMS = 25;

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;?/g, " ")
    .replace(/&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\u00a0/g, " ")
    .replace(/\u202f/g, " ");
}

function stripHtml(input: string): string {
  return decodeEntities(input).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function cleanDescription(description: string): string {
  const cleaned = stripHtml(description)
    .replace(/The post .*? appeared first on NewsForKids\.net\.?/i, "")
    .replace(/Read more\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.slice(0, 520);
}

export class NewsForKidsProvider implements SourceProvider {
  providerName = "newsforkids";

  async fetchStories(): Promise<IngestedSourceStory[]> {
    const response = await fetch(NEWS_FOR_KIDS_RSS, {
      headers: {
        accept: "application/rss+xml, application/xml, text/xml",
        "user-agent": "SpeechWhizBot/1.0 (+https://quizwhiz.vercel.app)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`NewsForKids fetch failed (${response.status}).`);
    }

    const xml = await response.text();
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gim) ?? [];

    return itemMatches.slice(0, MAX_ITEMS).flatMap((item): IngestedSourceStory[] => {
      const sourceTitle = stripHtml(extractTag(item, "title"));
      const sourceSummary = cleanDescription(extractTag(item, "description"));
      const sourceUrl = decodeEntities(extractTag(item, "link")).trim();
      const pubDate = extractTag(item, "pubDate");
      const sourcePublishedAt = pubDate ? new Date(pubDate) : new Date();

      if (!sourceTitle || !sourceSummary || !sourceUrl || Number.isNaN(sourcePublishedAt.getTime())) {
        return [];
      }

      return [
        {
          sourceTitle,
          sourceSummary,
          sourceUrl,
          sourcePublishedAt,
          rawContent: item,
        },
      ];
    });
  }
}
