import { IngestedSourceStory, SourceProvider } from "@/lib/providers/types";

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)));
}

function stripTags(input: string): string {
  return decodeHtmlEntities(input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function getMetaContent(html: string, name: string): string | null {
  const match = html.match(
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
  );
  return match ? stripTags(match[1]) : null;
}

function uniqueByUrl(stories: IngestedSourceStory[]): IngestedSourceStory[] {
  const seen = new Set<string>();
  return stories.filter((story) => {
    if (seen.has(story.sourceUrl)) {
      return false;
    }
    seen.add(story.sourceUrl);
    return true;
  });
}

function parseArticleBlocks(html: string, baseUrl: URL): IngestedSourceStory[] {
  const articleMatches = html.match(/<article[\s\S]*?<\/article>/gi) ?? [];
  const stories: IngestedSourceStory[] = [];

  for (const block of articleMatches.slice(0, 20)) {
    const headingMatch = block.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/i);
    const paragraphMatch = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const hrefMatch = block.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/i);

    const sourceTitle = headingMatch ? stripTags(headingMatch[1]) : "";
    const sourceSummary = paragraphMatch ? stripTags(paragraphMatch[1]) : "";

    if (sourceTitle.length < 18 || sourceSummary.length < 40) {
      continue;
    }

    let sourceUrl = baseUrl.toString();
    if (hrefMatch) {
      try {
        sourceUrl = new URL(hrefMatch[1], baseUrl).toString();
      } catch {
        sourceUrl = baseUrl.toString();
      }
    }

    stories.push({
      sourceTitle,
      sourceSummary,
      sourceUrl,
      sourcePublishedAt: new Date(),
    });
  }

  return stories;
}

function parseAnchorStories(html: string, baseUrl: URL): IngestedSourceStory[] {
  const anchorRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const stories: IngestedSourceStory[] = [];

  for (const match of html.matchAll(anchorRegex)) {
    const href = match[1];
    const anchorText = stripTags(match[2] ?? "");

    if (anchorText.length < 24 || anchorText.length > 140) {
      continue;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(href, baseUrl);
    } catch {
      continue;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      continue;
    }

    const likelyStoryPath = /news|article|story|world|politics|business|science|health|sports|education/i.test(
      parsedUrl.pathname,
    );

    if (!likelyStoryPath && parsedUrl.hostname !== baseUrl.hostname) {
      continue;
    }

    stories.push({
      sourceTitle: anchorText,
      sourceSummary: `Story candidate discovered from ${baseUrl.hostname}. Open source to confirm details.`,
      sourceUrl: parsedUrl.toString(),
      sourcePublishedAt: new Date(),
    });
  }

  return stories.slice(0, 30);
}

function parseSingleArticle(html: string, pageUrl: URL): IngestedSourceStory[] {
  const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) ?? html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const summaryMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);

  const sourceTitle = titleMatch ? stripTags(titleMatch[1]) : "";
  const sourceSummary = summaryMatch ? stripTags(summaryMatch[1]) : getMetaContent(html, "description") ?? "";

  if (!sourceTitle || sourceSummary.length < 40) {
    return [];
  }

  return [
    {
      sourceTitle,
      sourceSummary,
      sourceUrl: pageUrl.toString(),
      sourcePublishedAt: new Date(),
    },
  ];
}

export class UrlSourceProvider implements SourceProvider {
  providerName = "url";

  constructor(private readonly pageUrl: string) {}

  async fetchStories(): Promise<IngestedSourceStory[]> {
    const url = new URL(this.pageUrl);
    const response = await fetch(url, {
      headers: {
        "user-agent": "SpeechWhizBot/1.0 (+https://quizwhiz.vercel.app)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL (${response.status}).`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("text/html")) {
      throw new Error("URL did not return an HTML page.");
    }

    const html = await response.text();
    const articleStories = parseArticleBlocks(html, url);
    if (articleStories.length > 0) {
      return uniqueByUrl(articleStories);
    }

    const anchorStories = parseAnchorStories(html, url);
    if (anchorStories.length > 0) {
      return uniqueByUrl(anchorStories);
    }

    const singleArticle = parseSingleArticle(html, url);
    return uniqueByUrl(singleArticle);
  }
}
