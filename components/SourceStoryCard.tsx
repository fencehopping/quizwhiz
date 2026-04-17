import { SourceStory } from "@/lib/types";

type SourceStoryCardProps = {
  story: SourceStory;
  selected: boolean;
  onSelect: (id: string) => void;
};

export function SourceStoryCard({ story, selected, onSelect }: SourceStoryCardProps) {
  return (
    <article
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-cyan-500 bg-cyan-100"
          : "border-cyan-200 bg-white hover:border-cyan-300 hover:bg-cyan-50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-teal-950">{story.sourceTitle}</h3>
        <button
          type="button"
          onClick={() => onSelect(story.id)}
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            selected
              ? "bg-cyan-500 text-white"
              : "bg-cyan-200 text-teal-900 hover:bg-cyan-300"
          }`}
        >
          {selected ? "Selected" : "Select"}
        </button>
      </div>
      <p className="mt-2 text-sm leading-6 text-teal-900">{story.sourceSummary}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-teal-700">
        <a href={story.sourceUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          Source link
        </a>
        <span>{new Date(story.sourcePublishedAt).toLocaleDateString()}</span>
      </div>
    </article>
  );
}
