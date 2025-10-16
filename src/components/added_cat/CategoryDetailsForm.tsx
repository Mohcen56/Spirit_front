"use client";

import React, { useRef } from "react";
import { ImagePlus } from "lucide-react";

interface CategoryDetailsFormProps {
  categoryName: string;
  setCategoryName: (name: string) => void;
  categoryDescription: string;
  setCategoryDescription: (desc: string) => void;
  categoryImage: string | null;
  setCategoryImage: (image: string | null) => void;
  categoryImageFile: File | null;
  setCategoryImageFile: (file: File | null) => void;
  privacy: 'public' | 'private';
  setPrivacy: (privacy: 'public' | 'private') => void;
  onNext?: () => void;
  onCancel?: () => void;
  submitButtonText?: string;
  showCancelButton?: boolean;
}

export default function CategoryDetailsForm({
  categoryName,
  setCategoryName,
  categoryDescription,
  setCategoryDescription,
  categoryImage,
  setCategoryImage,
  categoryImageFile,
  setCategoryImageFile,
  privacy,
  setPrivacy,
  onNext,
  onCancel,
  submitButtonText = "Next",
  showCancelButton = false,
}: CategoryDetailsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className="rounded-2xl shadow-xl p-10 w-full max-w-2xl bg-white">
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
            <div className="flex flex-col items-center justify-center">
              <ImagePlus className="h-12 w-12 text-gray-400 mb-2" />
              <span className="text-gray-500 text-center text-sm px-4">Choose category image</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleImageChange}
            aria-label="Upload category image"
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
      <div className="flex w-full mb-8 gap-2">
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

      {/* Buttons */}
      <div className="flex gap-4">
        {showCancelButton && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-xl bg-gray-500 text-white font-bold text-xl shadow-lg hover:bg-gray-600 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          className={`${showCancelButton ? 'flex-1' : 'w-full'} py-4 rounded-xl bg-green-600 text-white font-bold text-xl shadow-lg hover:bg-green-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed`}
          disabled={!categoryName || !categoryImage}
          onClick={onNext}
        >
          {submitButtonText}
        </button>
      </div>
    </div>
  );
}
