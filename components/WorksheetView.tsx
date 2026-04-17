"use client";

import { ReadingLevel, WorksheetGeneration, WorksheetQuestion, readingLevelOptions } from "@/lib/types";

type WorksheetViewProps = {
  worksheet: WorksheetGeneration;
  readingLevel: ReadingLevel;
  sourceTitle?: string;
};

function typeLabel(type: WorksheetQuestion["type"]) {
  if (type === "main_idea") return "Main Idea";
  if (type === "detail") return "Detail";
  return "Inferencing";
}

export function WorksheetView({ worksheet, readingLevel, sourceTitle }: WorksheetViewProps) {
  const readingLevelLabel =
    readingLevelOptions.find((option) => option.value === readingLevel)?.label ?? readingLevel;

  return (
    <article className="rounded-3xl border border-cyan-200 bg-white p-6 shadow-sm sm:p-8 print:border-none print:p-0 print:shadow-none">
      <p className="text-xs uppercase tracking-[0.16em] text-teal-600">Generated Worksheet</p>
      <h2 className="mt-1 text-2xl font-semibold text-teal-950">{worksheet.title}</h2>
      <p className="mt-2 text-sm text-teal-800">
        Reading level: <strong>{readingLevelLabel}</strong>
      </p>
      {sourceTitle ? (
        <p className="mt-1 text-sm text-teal-700">Topic source: {sourceTitle}</p>
      ) : null}

      <section className="mt-6">
        <h3 className="text-lg font-semibold text-teal-900">Story</h3>
        <p className="mt-2 leading-7 text-teal-950">{worksheet.story}</p>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-teal-900">Multiple Choice Questions</h3>
        <ol className="mt-3 space-y-4">
          {worksheet.questions.map((question, index) => (
            <li key={`${question.type}-${index}`} className="rounded-xl bg-cyan-50 p-4">
              <p className="font-medium text-teal-900">
                {index + 1}. ({typeLabel(question.type)}) {question.question}
              </p>
              <ul className="mt-2 grid gap-1 text-sm text-teal-900">
                {question.choices.map((choice, choiceIndex) => (
                  <li key={`${question.type}-${choiceIndex}`}>{choice}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-teal-900">Answer Key</h3>
        <ul className="mt-2 space-y-1 text-teal-900">
          {worksheet.questions.map((question, index) => (
            <li key={`answer-${question.type}-${index}`}>
              Question {index + 1}: {question.correctAnswer}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-teal-900">Vocabulary</h3>
        <ul className="mt-2 space-y-2">
          {worksheet.vocabulary.map((item) => (
            <li key={item.word}>
              <span className="font-semibold text-teal-950">{item.word}:</span>{" "}
              <span className="text-teal-900">{item.definition}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
