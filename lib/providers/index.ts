import { ManualSourceProvider } from "@/lib/providers/manualProvider";
import { MockSourceProvider } from "@/lib/providers/mockProvider";
import { SourceProvider } from "@/lib/providers/types";
import { UrlSourceProvider } from "@/lib/providers/urlProvider";

export function getMockProvider(): SourceProvider {
  return new MockSourceProvider();
}

export function getManualProvider(title: string, summary: string): SourceProvider {
  return new ManualSourceProvider(title, summary);
}

export function getUrlProvider(url: string): SourceProvider {
  return new UrlSourceProvider(url);
}
