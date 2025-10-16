'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import CategoryDetailsForm from '@/components/added_cat/CategoryDetailsForm';
import CategoryQuestionsForm from '@/components/added_cat/CategoryQuestionsForm';

interface Question {
  id?: string;
  text: string;
  answer: string;
  points: number;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        // Fetch category details
        const response = await fetch(`http://localhost:8000/api/content/user-categories/${categoryId}/`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load category');
        }

        const data = await response.json();
        
        setCategoryName(data.name);
        setCategoryDescription(data.description || '');
        setCategoryImage(data.image || null);
        setPrivacy(data.privacy || 'public');
        
        // Fetch questions for this category
        const questionsResponse = await fetch(`http://localhost:8000/api/questions/?category_id=${categoryId}`, {
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
        });

        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          setQuestions(questionsData.map((q: any) => ({
            id: q.id,
            text: q.text,
            answer: q.answer,
            points: q.points,
          })));
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading category:', err);
        setError('Failed to load category');
        setIsLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImageFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCategoryImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', answer: '', points: 200 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, field: keyof Question, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleSave = async () => {
    try {
      setError('');

      // Validate
      if (!categoryName.trim()) {
        setError('Category name is required');
        return;
      }

      if (questions.length < 5) {
        setError('Please add at least 5 questions');
        return;
      }

      if (questions.some(q => !q.text || !q.answer)) {
        setError('All questions must have both text and answer');
        return;
      }

      // Update category details
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('description', categoryDescription);
      formData.append('privacy', privacy);
      
      if (categoryImageFile) {
        formData.append('image', categoryImageFile);
      }

      const updateResponse = await fetch(`http://localhost:8000/api/content/user-categories/${categoryId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update category');
      }

      // Update questions
      const questionsFormData = new FormData();
      questions.forEach((q, i) => {
        questionsFormData.append(`questions[${i}][text]`, q.text);
        questionsFormData.append(`questions[${i}][answer]`, q.answer);
        questionsFormData.append(`questions[${i}][points]`, q.points.toString());
      });

      const questionsResponse = await fetch(`http://localhost:8000/api/content/user-categories/${categoryId}/add_questions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: questionsFormData,
      });

      if (!questionsResponse.ok) {
        throw new Error('Failed to update questions');
      }

      alert('Category updated successfully! ✅');
      router.push('/categories');
      
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/content/user-categories/${categoryId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      alert('Category deleted successfully');
      router.push('/categories');
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-2xl text-gray-800">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/categories')}
              className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
              <span className="font-semibold">مصنع الفئات</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Edit Category</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Category Details Card */}
          <div className="rounded-2xl shadow-xl p-10 w-full bg-white mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Category Details</h2>
            
            {/* Image upload */}
            <div className="flex justify-center mb-8">
              <div
                className="w-40 h-40 rounded-xl bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-gray-300 overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {categoryImage ? (
                  <img src={categoryImage} alt="Category" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="h-12 w-12 text-gray-400" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Category name */}
            <input
              type="text"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
              placeholder="Category name"
              className="w-full px-6 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-6 text-left text-lg"
              maxLength={50}
            />

            {/* Category description */}
            <textarea
              value={categoryDescription}
              onChange={e => setCategoryDescription(e.target.value)}
              placeholder="Category description (optional)"
              className="w-full px-6 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mb-6 text-left text-lg resize-none"
              rows={3}
              maxLength={200}
            />

            {/* Privacy toggle */}
            <div className="flex w-full mb-6 gap-2">
              <button
                type="button"
                className={`flex-1 py-3 rounded-l-lg font-bold text-lg ${privacy === 'private' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} transition-all`}
                onClick={() => setPrivacy('private')}
              >
                🔒 Private
              </button>
              <button
                type="button"
                className={`flex-1 py-3 rounded-r-lg font-bold text-lg ${privacy === 'public' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'} transition-all`}
                onClick={() => setPrivacy('public')}
              >
                🌍 Public
              </button>
            </div>
          </div>

          {/* Questions Card */}
          <div className="rounded-2xl shadow-xl p-10 w-full bg-white mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Questions</h2>
            
            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-xl shadow-lg hover:bg-blue-700 transition-all mb-6"
            >
              اضافة سؤال
            </button>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-6 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">Question {index + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuestion(index)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2"
                        title="Remove question"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={question.text}
                      onChange={e => handleUpdateQuestion(index, 'text', e.target.value)}
                      placeholder="Question text"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    />
                    <input
                      type="text"
                      value={question.answer}
                      onChange={e => handleUpdateQuestion(index, 'answer', e.target.value)}
                      placeholder="Answer"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    />
                    <select
                      value={question.points}
                      onChange={e => handleUpdateQuestion(index, 'points', parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    >
                      <option value={200}>200 points</option>
                      <option value={400}>400 points</option>
                      <option value={600}>600 points</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {questions.length < 5 && (
              <p className="text-red-600 text-center mt-4">
                لعبوها {questions.length} / ضافوها 5 (You need at least 5 questions)
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-10 py-5 rounded-xl shadow-lg transition-all transform hover:scale-105 text-xl font-bold"
              disabled={questions.length < 5 || questions.some(q => !q.text || !q.answer)}
            >
              <Save className="h-6 w-6" />
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center space-x-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-10 py-5 rounded-xl shadow-lg transition-all transform hover:scale-105 text-xl font-bold"
            >
              <Trash2 className="h-6 w-6" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
