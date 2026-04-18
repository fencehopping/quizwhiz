import { ManualSourceProvider } from "@/lib/providers/manualProvider";
import { NewsForKidsProvider } from "@/lib/providers/newsForKidsProvider";
import { SourceProvider } from "@/lib/providers/types";
import { UrlSourceProvider } from "@/lib/providers/urlProvider";

export function getNewsForKidsProvider(): SourceProvider {
  return new NewsForKidsProvider();
}

export function getManualProvider(title: string, summary: string): SourceProvider {
  return new ManualSourceProvider(title, summary);
}

export function getUrlProvider(url: string): SourceProvider {
  return new UrlSourceProvider(url);
}
