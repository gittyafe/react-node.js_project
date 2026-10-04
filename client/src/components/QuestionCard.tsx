import React from 'react';
import type { Question } from '../types';

type QuestionCardProps = {
  question: Question;
  index: number;
  selectedAnswer?: string;
  onSelect: (questionId: string, answer: string) => void;
};

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, index, selectedAnswer, onSelect }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Question {index + 1}</h3>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{question.points} pts</span>
      </div>

      <p className="mb-4 text-base text-gray-700">{question.questionText}</p>

      <div className="space-y-3">
        {question.options.map((option) => {
          const checked = selectedAnswer === option;
          const questionId = question._id ?? question.id ?? `question-${index}`;

          return (
            <button
              key={option}
              type="button"
              aria-pressed={checked}
              onClick={() => onSelect(questionId, option)}
              className={`flex w-full items-center rounded-lg border px-4 py-3 text-left transition ${
                checked ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-gray-50 hover:border-blue-300'
              }`}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-bold">
                {String.fromCharCode(65 + question.options.indexOf(option))}
              </span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
