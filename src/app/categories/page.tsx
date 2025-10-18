'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gameAPI } from '@/lib/api/index';
import { Category, Membership, Collection } from '@/types/game';
import { ArrowLeft, Users, Crown, Lock, Eye, Pencil } from 'lucide-react';
import Image from 'next/image';

export default function CategoriesPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [infoModal, setInfoModal] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const router = useRouter();

  // Function to handle image loading errors
  const handleImageError = (categoryName: string) => {
    setImageErrors(prev => new Set(prev).add(categoryName));
  };

  // Function to check if image has error
  const hasImageError = (categoryName: string) => {
    return imageErrors.has(categoryName);
  };

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

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get collections with categories from backend
        const collectionsData = await gameAPI.getCollectionsWithCategories();
        
        // Get user's saved categories
        let savedCategories: Category[] = [];
        try {
          const savedData = await gameAPI.getMySavedCategories();
          // Handle paginated response
          savedCategories = Array.isArray(savedData) 
            ? savedData 
            : (savedData?.results || []);
        } catch {
          console.log('No saved categories or user not authenticated');
        }
        
        // Ensure we have an array
        if (Array.isArray(collectionsData)) {
          // Create "Added Categories" collection with user's saved categories
          const addedCategoriesCollection: Collection = {
            id: 999, // Use a high ID to avoid conflicts
            name: 'Added Categories',
            order: -1, // Put it at the top
            categories: savedCategories,
            categories_count: savedCategories.length
          };
          
          // Add "Added Categories" collection at the beginning
          setCollections([addedCategoriesCollection, ...collectionsData]);
        } else {
          setError('Invalid data format');
        }
        
        // Get membership and user from stored user data (client-side only)
        if (typeof window !== 'undefined') {
          const storedMembership = localStorage.getItem('membership');
          if (storedMembership) {
            const membershipData = JSON.parse(storedMembership);
            setMembership(membershipData);
            if (membershipData.user?.id) {
              setCurrentUserId(membershipData.user.id);
            }
          }
        }
      } catch {
        setError('An error occurred while loading data');
        
        // Fallback to regular categories API if collections fail
        try {
          const categoriesData = await gameAPI.getCategories();
          if (Array.isArray(categoriesData)) {
            // Create a default collection for fallback
            setCollections([{
              id: 0,
              name: 'All Categories',
              order: 0,
              categories: categoriesData,
              categories_count: categoriesData.length
            }]);
          }
        } catch {
          // Silent fallback failure
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-3 text-white hover:text-primary-100 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-8 w-px bg-white/30"></div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎮</span>
                <h1 className="text-xl font-bold text-white">New Game Setup</h1>
              </div>
            </div>

            {/* Right: Membership Status */}
            {membership && (
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-md ${
                membership.is_premium 
                  ? 'bg-yellow-400 text-yellow-900' 
                  : 'bg-white/20 text-white backdrop-blur-sm'
              }`}>
                {membership.is_premium ? (
                  <>
                    <Crown className="h-5 w-5" />
                    <span className="font-semibold text-sm">Premium</span>
                  </>
                ) : (
                  <>
                    <Users className="h-5 w-5" />
                    <span className="font-medium text-sm">Free</span>
                  </>
                )}
              </div>
            )}
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

          {/* Categories Selection */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-eastern-blue-400 text-white px-8 py-2 mb-4 rounded-full shadow-lg">
                <h2 className="text-2xl font-bold text-center">
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
                    <h3 className="text-xl font-bold text-center">{collection.name}</h3>
                  </div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-primary-600 text-sm bg-primary-50 px-3 py-1 rounded-full">
                    {collection.categories?.length || 0} categories
                  </div>
                </div>
                
                {/* Categories in this collection */}
                <div className="grid grid-cols-3 md:grid-cols-3   lg:grid-cols-5 gap-4">
                  {/* Add Category Button - Only show in "Added Categories" collection */}
                  {collection.name.toLowerCase() === "added categories" && (
                    <Link
                      href="/categories/add"
                      className="relative w-full aspect-[4/5] rounded-3xl border-2 border-dashed border-eastern-blue-400 overflow-hidden shadow-xl transition-all duration-200 transform hover:scale-105 hover:border-eastern-blue-600 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center group"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-20 h-20 bg-gradient-to-br from-eastern-blue-400 to-eastern-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className={`relative w-full aspect-[4/5] rounded-3xl border-primary-300  overflow-hidden shadow-xl transition-all duration-200 transform hover:scale-105 ${
                      isSelected
                        ? 'ring-2 ring-green-400'
                        : ''
                    } ${(!canSelect || isLocked) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {/* Top Section - Cream Background */}
                    <div className="relative h-[80%] bg-gradient-to-br from-amber-50 to-amber-100 p-4">
                      {/* Info/Edit/View Icon Button */}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={e => {
                          e.stopPropagation();
                          // If user owns this custom category, navigate to edit page
                          if (category.is_custom && category.created_by_id === currentUserId) {
                            router.push(`/categories/edit/${category.id}`);
                          } else {
                            setInfoModal({ open: true, category });
                          }
                        }}
                        className="absolute top-2 left-2 bg-slate-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-base font-bold hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 z-10 cursor-pointer"
                      >
                        {category.is_custom && category.created_by_id === currentUserId ? (
                          <Pencil className="h-4 w-4" />
                        ) : category.is_custom ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          'i'
                        )}
                      </span>
                      {/* Percentage Badge */}
                      <div className="absolute top-2 right-2 bg-slate-600 text-white text-sm font-bold px-2 py-1  min-w-[40px] text-center z-10">
                        {playedPercent}%
                      </div>
                      {/* Category Illustration */}
                      <div className="h-full w-full">
                        {((category.image_url || category.image || getLocalIllustration(category.name))) && !hasImageError(category.name) ? (
                          <Image
                            src={(category.image_url || category.image || getLocalIllustration(category.name))!}
                            alt={category.name}
                            className="w-full h-full object-cover  "
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            style={{ objectFit: 'cover', borderRadius: '0.1rem' }}
                            onError={() => handleImageError(category.name)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                              {category.name.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Bottom Section - Dark Background */}
                    <div className="relative h-[20%] bg-gradient-to-br from-eastern-blue-500 to-eastern-blue-700 flex items-center justify-center p-4">
                      <h3 className="text-white font-bold text-lg text-center leading-tight">
                        {category.name}
                      </h3>
                      {/* Premium/Lock Indicator */}
                      {isPremium && (
                        <div className="absolute top-2 right-2">
                          {canSelect ? (
                            <Crown className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      )}
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                    {/* Gold Border for Premium */}
                    {isPremium && canSelect && (
                      <div className="absolute inset-0 rounded-3xl border-4 border-yellow-400 pointer-events-none"></div>
                    )}
                    {/* Selection Border */}
                    {isSelected && (
                      <div className="absolute inset-0 rounded-3xl border-4 border-green-400 pointer-events-none"></div>
                    )}
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