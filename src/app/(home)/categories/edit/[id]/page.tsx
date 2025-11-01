'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CategoryFormFields from '@/components/added_cat/CategoryFormFields';
import QuestionsList from '@/components/added_cat/QuestionsList';
import { gameAPI } from '@/lib/api';
import { useHeader } from '@/app/(home)/layout';

interface Question {
  id: number;
  text: string;
  answer: string;
  points: number;
  image?: string;
  answer_image?: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
   const { setHeader } = useHeader();
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
 useEffect(() => {
    setHeader({ title: "Edit the category", backHref: "/categories" });
  }, [setHeader]);
  // Debug: Track when categoryImage changes
  useEffect(() => {
    console.log('🖼️ categoryImage changed:', categoryImage ? `${categoryImage.substring(0, 50)}...` : 'null');
  }, [categoryImage]);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        console.log('🔍 Loading category:', categoryId);
        
        // Fetch category details using gameAPI
        const data = await gameAPI.getUserCategory(categoryId);
        console.log('✅ Category loaded:', data);
        
        setCategoryName(data.name);
        setCategoryDescription(data.description || '');
        // Use image_url for display (backend sends full URL)
        setCategoryImage(data.image_url || null);
        setPrivacy(data.privacy || 'public');
        
        // Fetch questions for this category using gameAPI
        try {
          console.log('🔍 Loading questions for category:', categoryId);
          const questionsData = await gameAPI.getQuestionsByCategory(categoryId);
          console.log('✅ Questions loaded:', questionsData);
          console.log('📊 Questions count:', questionsData.length);
          console.log('📋 Questions array check:', Array.isArray(questionsData));
          setQuestions(questionsData);
        } catch (err) {
          console.error('❌ Error loading questions:', err);
          // Non-critical error, continue loading the page
          setQuestions([]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('❌ Error loading category:', err);
        setError('Failed to load category');
        setIsLoading(false);
      }
    };

    if (categoryId) {
      loadCategory();
    }
  }, [categoryId]);

  const handleImageChange = (file: File) => {
    console.log('📸 Edit page received file:', file.name, file.size, 'bytes');
    setCategoryImageFile(file);
    // Create a new preview from the cropped file
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      console.log('📸 Setting preview, length:', result.length);
      setCategoryImage(result);
    };
    reader.onerror = (err) => {
      console.error('❌ FileReader error:', err);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setError('');

      // Validate
      if (!categoryName.trim()) {
        setError('Category name is required');
        return;
      }

      console.log('💾 Saving category...');
      console.log('💾 categoryImageFile:', categoryImageFile);
     
      // Update category details using gameAPI
      const formData = new FormData();
      formData.append('name', categoryName);
      formData.append('description', categoryDescription);
      formData.append('privacy', privacy);
      
      if (categoryImageFile) {
        console.log('💾 Appending image to FormData:', categoryImageFile.name, categoryImageFile.size);
        formData.append('image', categoryImageFile);
      } else {
        console.log('⚠️ No categoryImageFile to upload');
      }

      console.log('💾 Sending update request...');
      const responseData = await gameAPI.updateUserCategory(categoryId, formData);
      console.log('✅ Update successful:', responseData);
     
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
      await gameAPI.deleteUserCategory(categoryId);
      alert('Category deleted successfully');
      router.push('/categories');
    } catch (err) {
      console.error('Error deleting category:', err);
      setError('Failed to delete category');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await gameAPI.deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      alert('Question deleted successfully');
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Failed to delete question');
    }
  };

  

  const handleEditQuestion = (questionId: number) => {
    // Navigate to edit question page (to be created later)
    router.push(`/categories/edit/${categoryId}/question/${questionId}/edit`);
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}
          <div className="rounded-xl   shadow-xl p-10 w-full bg-white mb-6">
            <CategoryFormFields
            categoryName={categoryName}
            setCategoryName={setCategoryName}
            categoryDescription={categoryDescription}
            setCategoryDescription={setCategoryDescription}
            categoryImage={categoryImage}
            onImageChange={handleImageChange}
            privacy={privacy}
            setPrivacy={setPrivacy}
            onSave={handleSave}
            onDelete={handleDelete}
          />

          {/* Action Buttons */}
          
        </div>

       
         {/* Questions Section */}
        <QuestionsList
          questions={questions}
          onAddQuestion={() => router.push(`/categories/edit/${categoryId}/addQ`)}
          onDeleteQuestion={handleDeleteQuestion}
          onEditQuestion={handleEditQuestion}
        />
        </div>
      </main>
    </div>
  );
}
