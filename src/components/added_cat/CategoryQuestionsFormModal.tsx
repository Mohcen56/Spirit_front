'use client';

import React, { useState } from 'react';
import { Category } from '@/types/game';
import { Plus, X, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { gameAPI } from '@/lib/api/index';

interface CategoryQuestionsFormProps {
  category: Category;
  onComplete: () => void;
  onSkip: () => void;
}

interface Question {
  text: string;
  answer: string;
  image?: File | null;
  answerImage?: File | null;
  imagePreview?: string;
  answerImagePreview?: string;
}

export default function CategoryQuestionsFormModal({ category, onComplete, onSkip }: CategoryQuestionsFormProps) {
  const [questions, setQuestions] = useState<Question[]>([
    { text: '', answer: '', image: null, answerImage: null }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', answer: '', image: null, answerImage: null }]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleImageChange = (index: number, field: 'image' | 'answerImage', file: File | null) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: file };
    
    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewField = field === 'image' ? 'imagePreview' : 'answerImagePreview';
        updated[index] = { ...updated[index], [previewField]: reader.result as string };
        setQuestions([...updated]);
      };
      reader.readAsDataURL(file);
    } else {
      const previewField = field === 'image' ? 'imagePreview' : 'answerImagePreview';
      updated[index] = { ...updated[index], [previewField]: undefined };
      setQuestions([...updated]);
    }
  };

  const handleSubmit = async () => {
    setError('');

    // Validate
    const validQuestions = questions.filter(q => q.text.trim() && q.answer.trim());
    
    if (validQuestions.length === 0) {
      setError('Please add at least one question with text and answer');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData
      const formData = new FormData();
      
      // Add questions as JSON array
      const questionsData = validQuestions.map((q, index) => ({
        text: q.text.trim(),
        answer: q.answer.trim(),
        has_image: !!q.image,
        has_answer_image: !!q.answerImage,
      }));
      
      formData.append('questions', JSON.stringify(questionsData));

      // Add images
      validQuestions.forEach((q, index) => {
        if (q.image) {
          formData.append(`question_${index}_image`, q.image);
        }
        if (q.answerImage) {
          formData.append(`question_${index}_answer_image`, q.answerImage);
        }
      });

      // Send to backend
      await gameAPI.addQuestionsToCategory(category.id, formData);

      // Success - call onComplete
      onComplete();
    } catch (err) {
      console.error('Error adding questions:', err);
      const errorObj = err as { message?: string; detail?: string };
      setError(errorObj?.message || errorObj?.detail || 'Failed to add questions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-800 to-purple-800 p-6 border-b border-white/20 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Add Questions to: {category.name}
            </h2>
            <button
              onClick={onSkip}
              disabled={isSubmitting}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {category.image && (
            <div className="mt-4 flex justify-center">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden">
                <Image src={category.image} alt={category.name} fill className="object-cover" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>Category created successfully! Now add some questions.</span>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Question {index + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      aria-label="Remove question"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Question Text</label>
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                      placeholder="Enter the question..."
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      rows={2}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Answer Text */}
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Answer</label>
                    <input
                      type="text"
                      value={question.answer}
                      onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                      placeholder="Enter the answer..."
                      className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Optional Images */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Question Image */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Question Image (Optional)</label>
                      {question.imagePreview ? (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-200">
                          <Image src={question.imagePreview} alt="Question" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleImageChange(index, 'image', null)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-32 bg-white/10 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:bg-white/20 transition-all flex items-center justify-center">
                          <span className="text-white/60 text-sm">+ Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, 'image', e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>

                    {/* Answer Image */}
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Answer Image (Optional)</label>
                      {question.answerImagePreview ? (
                        <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-200">
                          <Image src={question.answerImagePreview} alt="Answer" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => handleImageChange(index, 'answerImage', null)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-32 bg-white/10 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:bg-white/20 transition-all flex items-center justify-center">
                          <span className="text-white/60 text-sm">+ Add Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(index, 'answerImage', e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Question Button */}
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={isSubmitting}
            className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 border-2 border-dashed border-white/30"
          >
            <Plus className="h-5 w-5" />
            Add Another Question
          </button>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onSkip}
              disabled={isSubmitting}
              className="flex-1 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-semibold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
            >
              Skip for Now
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'Saving...' : 'Save Questions'}
            </button>
          </div>

          <p className="text-white/60 text-sm text-center">
            You can always add more questions later from the category edit page.
          </p>
        </div>
      </div>
    </div>
  );
}
