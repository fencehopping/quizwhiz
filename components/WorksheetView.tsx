"use client";

import { useState } from "react";
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
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, "A" | "B" | "C" | "D" | undefined>
  >({});

  const readingLevelLabel =
    readingLevelOptions.find((option) => option.value === readingLevel)?.label ?? readingLevel;

  function letterFromIndex(index: number): "A" | "B" | "C" | "D" {
    return (["A", "B", "C", "D"][index] ?? "A") as "A" | "B" | "C" | "D";
  }

  function selectAnswer(questionIndex: number, selectedLetter: "A" | "B" | "C" | "D") {
    if (selectedAnswers[questionIndex]) {
      return;
    }

    setSelectedAnswers((current) => ({
      ...current,
      [questionIndex]: selectedLetter,
    }));
  }

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 print:border-none print:p-0 print:shadow-none">
      <p className="text-xs uppercase tracking-[0.16em] text-blue-700">Generated Worksheet</p>
      <h2 className="mt-1 text-2xl font-semibold text-slate-950">{worksheet.title}</h2>
      <p className="mt-2 text-sm text-slate-700">
        Reading level: <strong>{readingLevelLabel}</strong>
      </p>
      {sourceTitle ? (
        <p className="mt-1 text-sm text-slate-600">Topic source: {sourceTitle}</p>
      ) : null}

      <section className="mt-6">
        <h3 className="text-lg font-semibold text-slate-900">Story</h3>
        <p className="mt-2 leading-7 text-slate-950">{worksheet.story}</p>
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900">Multiple Choice Questions</h3>
        <ol className="mt-3 space-y-4">
          {worksheet.questions.map((question, index) => (
            <li key={`${question.type}-${index}`} className="rounded-xl bg-slate-50 p-4">
              <p className="font-medium text-slate-900">
                {index + 1}. ({typeLabel(question.type)}) {question.question}
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-slate-900">
                {question.choices.map((choice, choiceIndex) => {
                  const letter = letterFromIndex(choiceIndex);
                  const selected = selectedAnswers[index];
                  const wasAnswered = Boolean(selected);
                  const isCorrectChoice = letter === question.correctAnswer;
                  const isSelected = selected === letter;
                  const selectedWrong = wasAnswered && isSelected && !isCorrectChoice;

                  const choiceClassName = isCorrectChoice && wasAnswered
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : selectedWrong
                      ? "border-red-500 bg-red-50 text-red-900"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-slate-50";

                  return (
                    <li key={`${question.type}-${choiceIndex}`}>
                      <button
                        type="button"
                        onClick={() => selectAnswer(index, letter)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition ${choiceClassName}`}
                      >
                        <span>{choice}</span>
                        {isSelected && isCorrectChoice ? (
                          <span className="ml-3 font-bold text-emerald-800">✓</span>
                        ) : null}
                        {selectedWrong ? <span className="ml-3 font-bold text-red-900">✕</span> : null}
                        {!isSelected && wasAnswered && isCorrectChoice ? (
                          <span className="ml-3 text-xs font-semibold text-emerald-800">
                            Correct
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">Answer Key</h3>
          <button
            type="button"
            onClick={() => setShowAnswerKey((current) => !current)}
            className="rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-blue-50"
          >
            {showAnswerKey ? "Hide Answer Key" : "Show Answer Key"}
          </button>
        </div>
        {showAnswerKey ? (
          <ul className="mt-2 space-y-1 text-slate-900">
            {worksheet.questions.map((question, index) => (
              <li key={`answer-${question.type}-${index}`}>
                Question {index + 1}: {question.correctAnswer}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Answer key is hidden until you reveal it.</p>
        )}
      </section>

      <section className="mt-8">
        <h3 className="text-lg font-semibold text-slate-900">Vocabulary</h3>
        <ul className="mt-2 space-y-2">
          {worksheet.vocabulary.map((item) => (
            <li key={item.word}>
              <span className="font-semibold text-slate-950">{item.word}:</span>{" "}
              <span className="text-slate-900">{item.definition}</span>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
