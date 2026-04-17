import { ManualSourceProvider } from "@/lib/providers/manualProvider";
import { MockSourceProvider } from "@/lib/providers/mockProvider";
import { SourceProvider } from "@/lib/providers/types";

export function getMockProvider(): SourceProvider {
  return new MockSourceProvider();
}

export function getManualProvider(title: string, summary: string): SourceProvider {
  return new ManualSourceProvider(title, summary);
}
