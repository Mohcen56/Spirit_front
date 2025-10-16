'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gameAPI } from '@/lib/api/index';
import { Category } from '@/types/game';
import { ArrowLeft, Eye, Pencil, Crown } from 'lucide-react';
import Image from 'next/image';
import AddCategoryForm from '@/components/added_cat/AddCategoryForm';
import CategoryQuestionsFormModal from '@/components/added_cat/CategoryQuestionsFormModal';

export default function AddedCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [createdCategory, setCreatedCategory] = useState<Category | null>(null);
  const router = useRouter();

  // Function to handle image loading errors
  const handleImageError = (categoryId: number) => {
    setImageErrors(prev => new Set(prev).add(categoryId));
  };

  // Function to check if image has error
  const hasImageError = (categoryId: number) => {
    return imageErrors.has(categoryId);
  };

  


  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Loading user categories...');
        console.log('🔑 Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
        
        // Get categories from backend:
        // - User's own custom categories (approved or not)
        // - All approved public custom categories from other users
        const categoriesData = await gameAPI.getUserCategories();
        
        console.log('📦 Categories data received:', categoriesData);
        console.log('📊 Is array?', Array.isArray(categoriesData));
        console.log('📊 Length:', Array.isArray(categoriesData) ? categoriesData.length : 'N/A');
        
        // Handle paginated response from DRF
        const allCategories = Array.isArray(categoriesData) 
          ? categoriesData 
          : (categoriesData?.results || []);
        
        setCategories(allCategories);
        console.log('✅ Categories set in state:', allCategories.length);
        
        // Get current user ID
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            setCurrentUserId(user.id);
            console.log('👤 Current user ID:', user.id);
          } else {
            console.log('⚠️ No user data in localStorage');
          }
        }
      } catch (err) {
        console.error('❌ Error loading categories:', err);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCategoryClick = (category: Category) => {
    // If user owns this category, go to edit, otherwise show info
    if (category.created_by_id === currentUserId) {
      router.push(`/categories/edit/${category.id}`);
    } else {
      // Could show a modal or just navigate to play
      alert(`Category: ${category.name}\nCreated by user\nClick to play!`);
    }
  };

  const handleAddCategoryClick = () => {
    setShowAddForm(true);
  };

  const handleCategoryCreated = (category: Category) => {
    // Save the created category and show the questions form
    setCreatedCategory(category);
  };

  const handleCancelAddForm = () => {
    setShowAddForm(false);
    setCreatedCategory(null);
  };

  const handleQuestionsComplete = async () => {
    // Reload categories and close forms
    setShowAddForm(false);
    setCreatedCategory(null);
    
    // Refresh the categories list
    try {
      const categoriesData = await gameAPI.getUserCategories();
      // Handle paginated response from DRF
      const allCategories = Array.isArray(categoriesData) 
        ? categoriesData 
        : (categoriesData?.results || []);
      setCategories(allCategories);
    } catch (err) {
      console.error('Error reloading categories:', err);
    }
  };

  // If showing add form or questions form, render those instead
  if (showAddForm && !createdCategory) {
    return (
      <AddCategoryForm 
        onSuccess={handleCategoryCreated}
        onCancel={handleCancelAddForm}
      />
    );
  }

  if (createdCategory) {
    return (
      <CategoryQuestionsFormModal
        category={createdCategory}
        onComplete={handleQuestionsComplete}
        onSkip={handleQuestionsComplete}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eastern-blue-50 flex items-center justify-center">
        <div className="text-primary-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eastern-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/categories"
                className="flex items-center space-x-3 text-white hover:text-primary-100 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎮</span>
                <h1 className="text-xl font-bold text-white">Added Categories</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-primary-800 text-center">{error}</p>
            </div>
          )}

          {/* Categories Section */}
          <div className="bg-eastern-blue-100 backdrop-blur-md rounded-2xl p-6 mb-8 border border-primary-200 shadow-lg">
            {/* Section Header */}
            <div className="relative flex justify-center -mt-11 mb-4">
              <div className="bg-eastern-blue-700 text-white px-6 py-2 rounded-full shadow-md">
                <h3 className="text-xl font-bold text-center">Added Categories</h3>
              </div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-primary-600 text-sm bg-primary-50 px-3 py-1 rounded-full">
                {categories.length} categories
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Add Category Button */}
              <button
                onClick={handleAddCategoryClick}
                className="relative w-full aspect-[4/5] rounded-3xl border-2 border-dashed border-eastern-blue-400 overflow-hidden shadow-xl transition-all duration-200 transform hover:scale-105 hover:border-eastern-blue-600 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center group"
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-20 h-20 bg-gradient-to-br from-eastern-blue-400 to-eastern-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="text-sm font-normal text-eastern-blue-600 mt-1">Add your own Category</div>
                </div>
              </button>

              {/* Existing Categories */}
              {categories.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-primary-600 text-xl mb-4">
                    لا توجد فئات بعد
                  </div>
                  <p className="text-primary-400">
                    كن أول من يضيف فئة!
                  </p>
                </div>
              ) : (
                categories.map((category) => {
                  const isOwner = category.created_by_id === currentUserId;
                  const isPending = isOwner && !category.is_approved;

                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className={`relative w-full aspect-[4/5] rounded-3xl border-primary-300 overflow-hidden shadow-xl transition-all duration-200 transform hover:scale-105 ${
                        isPending ? 'opacity-75 ring-2 ring-orange-400' : ''
                      }`}
                    >
                      {/* Pending Approval Overlay */}
                      {isPending && (
                        <div className="absolute top-0 left-0 right-0 bg-orange-500 text-white text-xs font-bold py-1 px-2 text-center z-20">
                          Pending Approval
                        </div>
                      )}

                      {/* Top Section - Cream Background with User Profile Header */}
                      <div className="relative h-[80%]">
                        {/* User Profile Header */}
                        <div className="absolute top-0 left-0 right-0 bg-eastern-blue-500 rounded-t-3xl px-3 py-1 flex items-center justify-between z-20">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                              
                              
                            </div>
                            <div className="flex flex-col">
                              <span className="text-white text-xs font-semibold leading-tight">
                                {category.created_by_username || 'User'}
                              </span>
                              <span className="text-eastern-blue-100 text-[10px] leading-tight"> novice</span>
                            </div>
                          </div>
                          {/* Edit/View Icon */}
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={e => {
                              e.stopPropagation();
                              if (isOwner) {
                                router.push(`/categories/edit/${category.id}`);
                              }
                            }}
                            className="bg-slate-600 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                          >
                            {isOwner ? (
                              <Pencil className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </span>
                        </div>

                        {/* Category Image with Questions Count Badge */}
                        <div className="h-full w-full justify-center items-center flex ">
                          <div className="relative h-full w-full">
                            {category.image && !hasImageError(category.id) ? (
                              <Image
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover "
                                fill
                                sizes="(max-width: 768px) 100vw, 33vw"
                                style={{ objectFit: 'cover' }}
                                onError={() => handleImageError(category.id)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center rounded-xl">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                  {category.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                            
                            {/* Questions Count Badge */}
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-bold">
                              questions: {category.questions_count || 0}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Section - Dark Background with Actions */}
                      <div className="relative h-[20%] bg-gradient-to-br from-eastern-blue-600 to-eastern-blue-800 flex flex-col items-center justify-center p-2">
                        {/* Category Name */}
                           <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse w-full px-2">
                        <h3 className="text-white font-bold text-base text-center leading-tight  ">
                          {category.name}
                        </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement like functionality
                              console.log('Like category:', category.id);
                            }}
                            className="flex flex-col  "
                          >
                            <svg 
                              className="w-6 h-6 text-white group-hover:text-red-400 transition-colors" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-white text-xs">{category.questions_count || 0}</span>
                          </button>
                          </div>
                        {/* Action Buttons Row */}
                        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse w-full px-2">
                          {/* Like Button */}
                       

                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement add to my categories functionality
                              console.log('Add category to my list:', category.id);
                            }}
                            className="flex-1 bg-eastern-blue-500 hover:bg-eastern-blue-400 text-white text-xs font-bold py-1.5 px-3 rounded-full transition-colors flex items-center justify-center space-x-1 rtl:space-x-reverse"
                          >
                            <span>+</span>
                            <span>إضافة الفئة</span>
                          </button>
                        </div>

                        {/* Premium Indicator (if applicable) */}
                        {category.is_premium && (
                          <div className="absolute top-2 right-2">
                            <Crown className="h-4 w-4 text-yellow-400" />
                          </div>
                        )}

                        {/* Private Indicator */}
                        {category.privacy === 'private' && (
                          <div className="absolute top-2 left-2 bg-yellow-500/90 px-2 py-0.5 rounded text-xs text-white font-semibold">
                            Private
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
