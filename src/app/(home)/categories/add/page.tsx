'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gameAPI } from '@/lib/api/index';
import { Category, User } from '@/types/game';
import {  Crown } from 'lucide-react';
import Image from 'next/image';
import Usersprofiles from '@/components/User/Usersprofiles';

import { useHeader } from '../../layout';

export default function AddedCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();
   const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({ title: " Categories Added by Users", backHref: "/categories" });
  }, [setHeader]);

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

  const handleSaveCategory = async (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    
    try {
      if (category.is_saved) {
        // Unsave the category
        await gameAPI.unsaveCategory(category.id);
        // Update the local state
        setCategories(prev => prev.map(cat => 
          cat.id === category.id ? { ...cat, is_saved: false } : cat
        ));
      } else {
        // Save the category
        await gameAPI.saveCategory(category.id);
        // Update the local state
        setCategories(prev => prev.map(cat => 
          cat.id === category.id ? { ...cat, is_saved: true } : cat
        ));
      }
    } catch (err) {
      console.error('Error saving/unsaving category:', err);
      alert('Failed to update category. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-eastern-blue-50 flex items-center justify-center">
        <div className="text-primary-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {showProfile && selectedUser ? (
        <Usersprofiles
          user={selectedUser}
          onBack={() => setShowProfile(false)}
        />
      ) : (
        <div className="min-h-screen bg-eastern-blue-50">
 
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
              <Link
                href="/categories/create"
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
              </Link>

              {/* Existing Categories */}
              {categories.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-primary-600 text-xl mb-4">
                  there is no categories here yet   
                  </div>
                  <p className="text-primary-400">
                    Be the first to add a category!
                  </p>
                </div>
              ) : (
                categories.map((category) => {
                  const isOwner = category.created_by_id === currentUserId;
                  const isPending = isOwner && !category.is_approved;

                  return (
                    <div
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className={`relative w-full h-full aspect-[4/5] rounded-xl border-primary-300 overflow-hidden shadow-xl transition-all duration-200 transform hover:scale-105 cursor-pointer ${
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
                      <div className=" flex flex-col relative h-[80%]  ">
                        {/* User Profile Header */}
                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-br from-eastern-blue-600 to-eastern-blue-800 rounded-t-xl px-3 py-1 flex items-center justify-between z-20">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            {/* LEFT: Avatar + Username */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Create a User object from category data
                                  if (category.created_by_id) {
                                    setSelectedUser({
                                      id: category.created_by_id,
                                      username: category.created_by_username || 'Unknown',
                                      email: '', // We don't have email from category
                                      avatar: category.created_by_avatar || '/avatars/tanjiro.jpeg'// Default avatar for now
                                    });
                                    setShowProfile(true);
                                  }
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer overflow-hidden shadow-lg bg-white/20"
                                aria-label="View creator profile"
                              >
                                <Image
                                  src={category.created_by_avatar || '/avatars/tanjiro.jpeg'}
                                  alt="Creator Profile"
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              </button>
                              <span className="text-eastern-blue-100 text-[10px] leading-tight">
                                {category.created_by_username || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Category Image with Questions Count Badge */}
                        <div className= "relative flex-1 flex justify-center items-center overflow-hidden ">
                          <div className="relative h-full w-full">
                            {(category.image_url || category.image) && !hasImageError(category.id) ? (
                              <Image
                                src={(category.image_url || category.image)!}
                                alt={category.name}
                                className="w-full h-full object-contain "
                                fill
                                sizes="(max-width: 768px) 80vw, 33vw"
                                style={{ objectFit: 'contain' }}
                                onError={() => handleImageError(category.id)}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center rounded-4xl">
                                <div className="w-18 h-18 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-4xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
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
                           <div className="flex items-center justify-between space-x-3 rtl:space-x-reverse w-full px-2 mb-1 mt-2">
                        <h3 className="text-white font-bold text-base text-center leading-tight  ">
                          {category.name}
                        </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Implement like functionality
                              console.log('Like category:', category.id);
                            }}
                            className="flex flex-col  absolute right-0.5 top-0.5 "
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
                        <div className="flex items-center justify-end space-x-3 rtl:space-x-reverse w-full mb-3  mt-1 px-2.5">
                          {/* Save/Unsave Button */}
                          <button
                            onClick={(e) => handleSaveCategory(e, category)}
                            className={`flex-1 ${
                              category.is_saved 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-eastern-blue-500 hover:bg-eastern-blue-400'
                            } text-white text-xs font-bold py-1 px-2 rounded-full transition-colors flex items-center justify-center space-x-1 rtl:space-x-reverse`}
                          >
                            <span>{category.is_saved ? '✓' : '+'}</span>
                            <span>{category.is_saved ? 'Saved' : 'add category'}</span>
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
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
      )}
    </>
  );
}
