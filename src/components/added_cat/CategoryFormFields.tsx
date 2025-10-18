'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Save, Trash2, Edit3, Lock, Globe } from 'lucide-react';
import ImageCropModal from './ImageCropModal';

interface CategoryFormFieldsProps {
  categoryName: string;
  setCategoryName: (value: string) => void;
  categoryDescription: string;
  setCategoryDescription: (value: string) => void;
  categoryImage: string | null;
  onImageChange: (file: File) => void;
  privacy: 'public' | 'private';
  setPrivacy: (value: 'public' | 'private') => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function CategoryFormFields({
  categoryName,
  setCategoryName,
  categoryDescription,
  setCategoryDescription,
  categoryImage,
  onImageChange,
  privacy,
  setPrivacy,
  onSave,
  onDelete,
}: CategoryFormFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImageForCrop, setTempImageForCrop] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTempImageForCrop(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    onImageChange(croppedFile);
    setTempImageForCrop(null);
  };

  const handleCropCancel = () => {
    setTempImageForCrop(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Crop Modal */}
      {tempImageForCrop && (
        <ImageCropModal
          imageSrc={tempImageForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* ===================== VIEW MODE ===================== */}
      {!isEditing && (
        <div className="p-6   mx-auto">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Image */}
            <div className="w-48 h-48 bg-gray-100 border rounded-xl overflow-hidden flex items-center justify-center">
              {categoryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={categoryImage}
                  alt={categoryName}
                  className="object-cover w-full h-full"
                />
              ) : (
                <ImagePlus className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* Text info */}
            <div className="flex-1">
              <h2 className="text-2xl  text-primary-800 font-bold mb-2">{categoryName || 'Untitled Category'}</h2>
              <p className="text-primary-700 mb-4">
                {categoryDescription || 'No description provided.'}
              </p>
              <div className="flex items-center gap-2">
                {privacy === 'private' ? (
                  <>
                    <Lock className="text-gray-500" />
                    <span className="text-gray-700 font-semibold">Private</span>
                  </>
                ) : (
                  <>
                    <Globe className="text-gray-500" />
                    <span className="text-gray-700 font-semibold">Public</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 font-semibold"
            >
              <Trash2 className="h-5 w-5" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 font-semibold"
            >
              <Edit3 className="h-5 w-5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      )}

      {/* ===================== EDIT MODE (FORM) ===================== */}
      {isEditing && (
        <div className="p-6 bg-white shadow-lg rounded-2xl max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image upload */}
            <div
              className="w-48 h-48 rounded-xl bg-gray-100 cursor-pointer border-2 border-gray-300 overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {categoryImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={categoryImage}
                  src={categoryImage}
                  alt="Category"
                  className="object-cover w-full h-full"
                />
              ) : (
                <ImagePlus className="h-12 w-12 text-gray-400 mx-auto mt-16" />
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>

            {/* Form fields */}
            <div className="flex-1">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full px-6 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 mb-6 text-lg"
                maxLength={50}
              />

              <textarea
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Category description (optional)"
                className="w-full px-6 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 mb-6 text-lg resize-none"
                rows={3}
                maxLength={200}
              />

              {/* Privacy toggle */}
              <div className="flex w-full mb-6 gap-2">
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-l-lg font-bold text-lg ${
                    privacy === 'private'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                  onClick={() => setPrivacy('private')}
                >
                  🔒 Private
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 rounded-r-lg font-bold text-lg ${
                    privacy === 'public'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                  onClick={() => setPrivacy('public')}
                >
                  🌍 Public
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-4 mt-6">
             <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="flex items-center space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-4 rounded-xl shadow-md transition-all transform hover:scale-105 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave();
                setIsEditing(false);
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 font-semibold"
            >
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
        
          </div>
        </div>
      )}
    </>
  );
}
