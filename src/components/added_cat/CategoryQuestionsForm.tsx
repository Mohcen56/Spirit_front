"use client";

import React from "react";
import { Trash2, Save } from "lucide-react";

interface Question {
  id: string;
  text: string;
  answer: string;
  points: number;
}

interface CategoryQuestionsFormProps {
  questions: Question[];
  onAddQuestion: () => void;
  onRemoveQuestion: (id: string) => void;
  onUpdateQuestion: (id: string, field: keyof Question, value: string | number) => void;
  onSave: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  saveButtonText?: string;
  minQuestions?: number;
}

export default function CategoryQuestionsForm({
  questions,
  onAddQuestion,
  onRemoveQuestion,
  onUpdateQuestion,
  onSave,
  onCancel,
  showCancelButton = false,
  saveButtonText = "Save Category",
  minQuestions = 0,
}: CategoryQuestionsFormProps) {
  const isValid = questions.length >= minQuestions && !questions.some(q => !q.text || !q.answer);

  return (
    <div className="rounded-2xl shadow-xl p-10 w-full max-w-2xl bg-white">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Questions</h2>
      
      {/* Add Question Button */}
      <button
        type="button"
        onClick={onAddQuestion}
        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg hover:bg-blue-700 transition-all mb-6"
      >
        اضافة سؤال (Add Question)
      </button>

      {/* Questions List */}
      <div className="space-y-6 mb-8">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="border border-gray-200 rounded-xl p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Question {index + 1}</h3>
              {questions.length > 0 && (
                <button
                  onClick={() => onRemoveQuestion(question.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-2"
                  title="Remove question"
                  aria-label="Remove question"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={question.text}
                onChange={e => onUpdateQuestion(question.id, 'text', e.target.value)}
                placeholder="Question text"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              />
              <input
                type="text"
                value={question.answer}
                onChange={e => onUpdateQuestion(question.id, 'answer', e.target.value)}
                placeholder="Answer"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
              />
              <select
                value={question.points}
                onChange={e => onUpdateQuestion(question.id, 'points', parseInt(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                aria-label="Select points for question"
              >
                <option value={200}>200 points</option>
                <option value={400}>400 points</option>
                <option value={600}>600 points</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Validation Message */}
      {questions.length < minQuestions && (
        <p className="text-red-600 text-center mb-6">
          لعبوها {questions.length} / ضافوها {minQuestions} (You need at least {minQuestions} questions)
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        {showCancelButton && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center space-x-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-10 py-5 rounded-xl shadow-lg transition-all transform hover:scale-105 text-xl font-bold"
          >
            <span>Cancel</span>
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-5 rounded-xl shadow-lg transition-all transform hover:scale-105 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Save className="h-6 w-6" />
          <span>{saveButtonText}</span>
        </button>
      </div>
    </div>
  );
}
