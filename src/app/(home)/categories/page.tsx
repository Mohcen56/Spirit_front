'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { categoriesAPI } from '@/lib/api';
import { Category, Collection } from '@/types/game';
import { Users, Crown, Lock, Eye, Pencil, Info } from 'lucide-react';
import Image from 'next/image';
import { useMembership } from '@/hooks/useMembership';
import { useImageError } from '@/hooks/useImageError';
import { useHeader } from '@/contexts/HeaderContext';

export default function CategoriesPage() {
  const { membership, currentUserId, error, setError } = useMembership();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [infoModal, setInfoModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const { setHeader } = useHeader();
  const router = useRouter();
  const { handleError: handleImageError, hasError: hasImageError } = useImageError<string>();
  
  // Fetch all category data using React Query
  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['allCategoryData'],
    queryFn: categoriesAPI.getAllCategoryData,
  });

  // Build collections array with added categories
  const collections = useMemo(() => {
    if (!data) return [];

    const addedCollection: Collection = {
      id: 999,
      name: 'Added Categories',
      order: -1,
      categories: data.saved_categories || [],
      categories_count: (data.saved_categories || []).length,
    };

    return [addedCollection, ...(data.collections || [])];
  }, [data]);

  useEffect(() => {
    setHeader({ title: "Categories", backHref: "/dashboard" });
  }, [setHeader]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      console.error('Error loading all category data:', queryError);
      setError('Failed to load categories');
    }
  }, [queryError, setError]);

  // Function to get played percentage for a category (user-specific)
  const getPlayedPercentage = (category: Category) => {
    console.log('Category data for user percentage calculation:', {
      name: category.name,
      total_questions: category.total_questions,
      user_played_questions: category.user_played_questions
    });
    
    if (
      typeof category.total_questions === 'number' &&
      typeof category.user_played_questions === 'number' &&
      category.total_questions > 0
    ) {
      const percentage = Math.min(100, Math.round((category.user_played_questions / category.total_questions) * 100));
      console.log(`Calculated user percentage for ${category.name}: ${percentage}%`);
      return percentage;
    }
    console.log(`No valid user data for ${category.name}, returning 0%`);
    return 0;
  };

  // Function to get local illustration path
  const getLocalIllustration = (categoryName: string) => {
    const illustrationMap: { [key: string]: string } = {
      'anime': '/category-illustrations/anime.svg',
      'anime 2': '/category-illustrations/anime2.svg',
      'Science': '/category-illustrations/science.svg',
      'History': '/category-illustrations/history.svg',
      'Premium Literature': '/category-illustrations/literature.svg',
      'Premium Geography': '/category-illustrations/geography.svg',
      'countries': '/category-illustrations/countries.svg',
      'Sports': '/category-illustrations/sports.svg',
    };
    return illustrationMap[categoryName];
  };

  const handleCategoryToggle = (categoryId: number, isPremium: boolean) => {
    if (isPremium && !membership?.is_premium) {
      setError('This category is available for premium members only');
      return;
    }

    setError('');
    
    // Check if we're trying to select more than 6 categories
    if (!selectedCategories.includes(categoryId) && selectedCategories.length >= 6) {
      setError('You can select a maximum of 6 categories');
      return;
    }

    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isValidToStart = () => {
    return selectedCategories.length >= 2;
  };

  const handleProceedToTeams = () => {
    if (!isValidToStart()) {
      setError('You must select at least two categories');
      return;
    }

    // Store selected categories in localStorage and navigate to teams page
    localStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
    router.push('/teams');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-custom-bg flex items-center justify-center">
        <div className="text-primary-800 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-eastern-blue-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <p className="text-primary-800 text-center">{error}</p>
            </div>
          )}

          {/* Categories Selection */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-eastern-blue-400 text-white px-8 py-2 mb-4 rounded-full shadow-lg">
                <h2 className="lg:text-2xl font-bold text-center">
                  Choose Categories (2-6 categories)
                </h2>
              </div>
            </div>
            
            {/* Collections Display */}
            {collections.map((collection) => (
              <div key={collection.id} className="bg-eastern-blue-100 backdrop-blur-md rounded-2xl p-6  mb-8 border border-primary-200 shadow-lg">
                {/* Collection Header */}
                <div className="relative flex justify-center  -mt-11 mb-4">
                  <div className="bg-eastern-blue-700 text-white px-6 py-2   rounded-full shadow-md">
                    <h3 className="lg:text-xl font-bold text-center">{collection.name}</h3>
                  </div>
                  <div className="absolute -right-3 lg:right-0 top-1/2 transform -translate-y-1/2 text-primary-600 text-sm bg-primary-50 px-3 py-1 rounded-full">
                    {collection.categories?.length || 0} categories
                  </div>
                </div>
                
                {/* Categories in this collection */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {/* Add Category Button - Only show in "Added Categories" collection */}
                  {collection.name.toLowerCase() === "added categories" && (
                    <Link
                      href="/categories/add"
                      className="relative w-full aspect-[3/4] min-h-[180px] sm:min-h-[220px] rounded-3xl border-2 border-dashed border-eastern-blue-400 overflow-hidden shadow-xl transition-all duration-200 transform hover:scale-105 hover:border-eastern-blue-600 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center group"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-15 h-15 lg:w-20 lg:h-20 bg-gradient-to-br from-eastern-blue-400 to-eastern-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-8 h-8 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        
                          <div className="text-sm font-normal text-eastern-blue-600 mt-1">Add Category</div>
                        </div>
                      
                    </Link>
                  )}
                  
                  {collection.categories?.map((category) => {
                    const isSelected = selectedCategories.includes(category.id);
                    const isPremium = category.is_premium;
                    const canSelect = !isPremium || membership?.is_premium;
                    const isLocked = !isSelected && selectedCategories.length >= 6; // Lock unselected categories when 6 are selected
                    const playedPercent = getPlayedPercentage(category);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id, isPremium)}
                    disabled={!canSelect || isLocked}
                    className={`relative w-full aspect-[3/4] min-h-[180px] sm:min-h-[220px] overflow-hidden border-5 rounded-4xl transition-all duration-200 transform hover:scale-105 ${
                      isSelected
                              ? 'border-amber-600' // Selected border color
                              : 'border-eastern-blue-500' // Default border color
                    } ${(!canSelect || isLocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Top Section - Cream Background */}
                    <div className="relative h-[75%]  ">
                      {/* Info/Edit/View Icon Button */}
                      <span
                        role="button"
                        tabIndex={3}
                        onClick={e => {
                          e.stopPropagation();
                          // If custom category, navigate to edit/view page
                          if (category.is_custom) {
                            router.push(`/categories/edit/${category.id}`);
                          } else {
                            // For official categories, show info modal
                            setInfoModal({ open: true, category });
                          }
                        }}
                        className="absolute top-2 right-2 bg-eastern-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-base font-bold hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 z-10 cursor-pointer"
                      >
                        {category.is_custom && category.created_by_id === currentUserId ? (
                          <Pencil className="h-4 w-4" />
                        ) : category.is_custom ? (
                          <Eye className="h-4 w-4" />
                      
                        ) : (
                          <Info className="h-9 w-9" />
                        )}
                      </span>
                      {/* Percentage Badge */}
                      <div className="absolute top-2   bg-eastern-blue-500 text-white text-xs lg:text-sm font-bold px-2 lg:px-3 py-1  lg:min-w-[45px] text-center z-20">
                        {playedPercent}%
                      </div>
                      {/* Category Illustration */}
                      <div className={`h-full w-full ${(!canSelect ? 'grayscale' : '')}`}>
                        {((category.image_url || category.image || getLocalIllustration(category.name))) && !hasImageError(category.name) ? (
                          <Image
                            src={(category.image_url || category.image || getLocalIllustration(category.name))!}
                            alt={category.name}
                            className="w-full h-full object-cover  "
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectFit: 'cover', borderRadius: '0 rem' }}
                            loading="lazy"
                            quality={85}
                            onError={() => handleImageError(category.name)}
                            unoptimized={(category.image_url || category.image || '').includes('r2.dev')}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                              {category.name.charAt(0)}
                            </div>
                          </div>
                        )}
                        {/* Locked Overlay */}
                        {isPremium && !membership?.is_premium && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                            <Lock className="h-8 w-8 text-white mb-2" />
                            <span className="text-white text-xs font-semibold">Premium</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Bottom Section - Dark Background */}
                    <div className="relative h-[25%] bg-gradient-to-br from-eastern-blue-500 to-eastern-blue-700 flex items-center justify-center p-4">
                      <h3 className="text-white  items-center font-bold text-sm lg:text-lg text-center leading-tight">
                        {category.name}
                      </h3>
                      {/* Premium/Lock Indicator */}
                      {isPremium && (
                        <div className="absolute top-1 text-center">
                          {canSelect ? (
                            <Crown className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      )}
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-0 left-2 lg:top-2 lg:left-2 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                    {/* Gold Border for Premium */}
                    
                    
                  </button>
                );
              })}
                </div>
              </div>
            ))}
            
            {/* Selected Categories Count */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-primary-200 shadow-lg text-center">
              <p className="text-primary-600 font-semibold">
                Selected: {selectedCategories.length}/6 categories
              </p>
            </div>
          </div>

          {/* Info Modal */}
          {infoModal.open && infoModal.category && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold focus:outline-none"
                  onClick={() => setInfoModal({ open: false, category: null })}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 className="text-xl font-bold mb-2 text-gray-900 text-center">
                  {infoModal.category.name}
                </h2>
                <div className="text-gray-700 text-center mb-4">
                  {infoModal.category.description || 'No description available for this category.'}
                </div>
              </div>
            </div>
          )}

          {/* Proceed to Teams Button */}
          <div className="text-center">
            <button
              onClick={handleProceedToTeams}
              disabled={!isValidToStart()}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center space-x-3 space-x-reverse mx-auto"
            >
              <Users className="h-6 w-6" />
              <span className="text-lg">
                Continue to Team Setup
              </span>
            </button>
            
            {!isValidToStart() && (
              <p className="text-gray-600 text-sm mt-3">
                You must select at least two categories
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
