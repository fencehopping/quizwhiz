import { GoogleNewsProvider } from "@/lib/providers/googleNewsProvider";
import { ManualSourceProvider } from "@/lib/providers/manualProvider";
import { SourceProvider } from "@/lib/providers/types";
import { UrlSourceProvider } from "@/lib/providers/urlProvider";

export function getGoogleNewsProvider(): SourceProvider {
  return new GoogleNewsProvider();
}

export function getManualProvider(title: string, summary: string): SourceProvider {
  return new ManualSourceProvider(title, summary);
}

export function getUrlProvider(url: string): SourceProvider {
  return new UrlSourceProvider(url);
}
