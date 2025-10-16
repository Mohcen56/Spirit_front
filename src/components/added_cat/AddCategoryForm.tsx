'use client';

import React, { useState } from 'react';
import { gameAPI } from '@/lib/api/index';
import { Category } from '@/types/game';
import { X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface AddCategoryFormProps {
  onSuccess: (category: Category) => void;
  onCancel?: () => void;
}

export default function AddCategoryForm({ onSuccess, onCancel }: AddCategoryFormProps) {
  const [categoryName, setCategoryName] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }

    if (!image) {
      setError('Category image is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('name', categoryName.trim());
      formData.append('privacy', privacy);
      if (image) {
        formData.append('image', image);
      }

      // Send to backend
      const response = await gameAPI.createCategory(formData);
      
      // Extract category from response
      const category = response.category || response;

      // Call onSuccess callback with the created category
      onSuccess(category);
    } catch (err) {
      console.error('Error creating category:', err);
      const errorObj = err as { message?: string; detail?: string };
      setError(errorObj?.message || errorObj?.detail || 'Failed to create category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          مصنع الفئات
        </h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="flex flex-col items-center">
            {imagePreview ? (
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-gray-200 border-4 border-white/30">
                <Image
                  src={imagePreview}
                  alt="Category preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="w-48 h-48 flex flex-col items-center justify-center bg-white/20 border-2 border-dashed border-white/40 rounded-2xl cursor-pointer hover:bg-white/30 transition-all">
                <ImageIcon className="h-16 w-16 text-white/60 mb-2" />
                <span className="text-white/80 text-center px-4">
                  اختر صورة الفئة
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Category Name */}
          <div>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="اسم الفئة"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-right"
              disabled={isSubmitting}
            />
          </div>

          {/* Privacy Toggle */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setPrivacy('public')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                privacy === 'public'
                  ? 'bg-yellow-400 text-gray-900'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              disabled={isSubmitting}
            >
              عامة
            </button>
            <button
              type="button"
              onClick={() => setPrivacy('private')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                privacy === 'private'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              disabled={isSubmitting}
            >
              خاصة
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'جاري الإنشاء...' : 'اصنع فئة'}
          </button>

          {/* Cancel Button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          )}
        </form>

        <p className="text-white/60 text-sm text-center mt-6">
          ستظهر الفئة بعد موافقة الإدارة
        </p>
      </div>
    </div>
  );
}
