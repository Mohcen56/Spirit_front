'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import CategoryFormFields from '@/components/added_cat/CategoryFormFields';
import QuestionsList from '@/components/added_cat/QuestionsList';
import { gameAPI } from '@/lib/api';
import { useHeader } from '@/app/(home)/layout';
import { useAuthGate } from '@/hooks/useAuthGate';
import { Heart, Flag, Bookmark, BookmarkCheck } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { useQueryClient } from '@tanstack/react-query';

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
  const { user } = useAuthGate();
  const notify = useNotification();
    const queryClient = useQueryClient();
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryOwnerId, setCategoryOwnerId] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Determine if current user is the owner
  const isOwner = user?.id === categoryOwnerId;
 // Set header based on owner status
  useEffect(() => {
    if (isOwner) {
      setHeader({ title: " Edit the category", backHref: "/categories" });
    } else {
      setHeader({ title: categoryName || "Show the Category", backHref: "/categories" });
    }
  }, [setHeader, isOwner, categoryName]);
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
        setCategoryOwnerId(data.created_by_id || null);
  setIsSaved(data.is_saved || false);
  setLikesCount(data.likes_count ?? 0);
  setIsLiked(data.is_liked ?? false);
        
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

  const handleSave = async (): Promise<boolean> => {
    try {
      setError('');

      // Validate
      if (!categoryName.trim()) {
        setError('Category name is required');
        return false;
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
     
      // Invalidate queries to refresh the categories lists
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories', 'user'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['savedCategories'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['allCategoryData'], refetchType: 'active' })
      ]);
     
      notify.success('Success', 'Category updated successfully!');
      router.push('/categories');
      return true;
      
    } catch (err) {
      console.error('Error saving category:', err);
      setError('Failed to save category. Please try again.');
      return false;
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await gameAPI.deleteUserCategory(categoryId);
      
      // Invalidate queries to refresh the categories lists
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories', 'user'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['savedCategories'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['allCategoryData'], refetchType: 'active' })
      ]);
      
      notify.success('Deleted', 'Category deleted successfully');
      router.push('/categories');
    } catch (err) {
      console.error('Error deleting category:', err);
      notify.error('Delete Failed', 'Failed to delete category. Please try again.');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await gameAPI.deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      notify.success('Question Deleted', 'Question removed successfully');
    } catch (err) {
      console.error('Error deleting question:', err);
      notify.error('Delete Failed', 'Failed to delete question. Please try again.');
    }
  };

  

  const handleEditQuestion = (questionId: number) => {
    // Navigate to edit question page (to be created later)
    router.push(`/categories/edit/${categoryId}/question/${questionId}/edit`);
  };

  const handleToggleSave = async () => {
    try {
      if (isSaved) {
        await gameAPI.unsaveCategory(Number(categoryId));
        setIsSaved(false);
        notify.success('Category Unsaved', 'Category removed from your collection');
      } else {
        await gameAPI.saveCategory(Number(categoryId));
        setIsSaved(true);
        notify.success('Category Saved', 'Category added to your collection');
      }
        // Invalidate queries to refresh the category lists
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['allCategoryData'], refetchType: 'active' }),
          queryClient.invalidateQueries({ queryKey: ['categories', 'user'], refetchType: 'active' })
        ]);
    } catch (err) {
      console.error('Error toggling save:', err);
      notify.error('Failed', 'Could not update category. Please try again.');
    }
  };

  const handleLike = async () => {
    try {
      const idNum = Number(categoryId);
      if (!Number.isFinite(idNum)) return;
      if (isLiked) {
        const res = await gameAPI.unlikeCategory(idNum);
        setIsLiked(false);
        setLikesCount(res?.likes_count ?? Math.max(0, likesCount - 1));
        notify.success('Unliked', 'You removed your like');
      } else {
        const res = await gameAPI.likeCategory(idNum);
        setIsLiked(true);
        setLikesCount(res?.likes_count ?? likesCount + 1);
        notify.success('Liked', 'Thanks for the like!');
      }
      // Invalidate any lists showing this category preview
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['allCategoryData'], refetchType: 'active' }),
        queryClient.invalidateQueries({ queryKey: ['categories', 'user'], refetchType: 'active' })
      ]);
    } catch (err) {
      console.error('Error toggling like:', err);
      notify.error('Failed', 'Could not update like. Please try again.');
    }
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    notify.info('Report Feature', 'Report functionality will be added soon');
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

          {/* Owner Mode: Show edit form */}
          {isOwner && (
            <div className="rounded-xl shadow-xl p-10 w-full bg-white mb-6">
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
            </div>
          )}

          {/* Public Mode: Show category info and action buttons */}
          {!isOwner && (
            <div className="rounded-xl shadow-xl p-10 w-full bg-white mb-6">
              {/* Category Image */}
              {categoryImage && (
                <div className="mb-6 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={categoryImage}
                    alt={categoryName}
                    className="w-48 h-48 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              )}

              {/* Category Name */}
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                {categoryName}
              </h2>

              {/* Category Description */}
              {categoryDescription && (
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  {categoryDescription}
                </p>
              )}

              {/* Privacy Badge */}
              <div className="flex justify-center mb-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  privacy === 'public' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {privacy === 'public' ? '🌐 Public' : '🔒 Private'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4 flex-wrap">
                {/* Save/Unsave Toggle Button */}
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
                    isSaved
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="h-5 w-5" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-5 w-5" />
                      <span>Save Category</span>
                    </>
                  )}
                </button>

                {/* Like Button (for future functionality) */}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
                    isLiked ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span>{isLiked ? 'Liked' : 'Like'}</span>
                  <span className="ml-1 text-white/90">{likesCount}</span>
                </button>
                
                {/* Report Button */}
                <button
                  onClick={handleReport}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  <Flag className="h-5 w-5" />
                  <span>Report</span>
                </button>
              </div>
            </div>
          )}
       
         {/* Questions Section - Always show questions but control edit capabilities */}
        <QuestionsList
          questions={questions}
          {...(isOwner && {
            onAddQuestion: () => router.push(`/categories/edit/${categoryId}/addQ`),
            onDeleteQuestion: handleDeleteQuestion,
            onEditQuestion: handleEditQuestion,
          })}
        />
        </div>
      </main>
    </div>
  );
}
