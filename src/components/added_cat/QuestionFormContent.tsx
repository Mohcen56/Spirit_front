"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gameAPI } from "@/lib/api";
import { logger } from '@/lib/utils/logger';
import { Mic, Video, Image as ImageIcon, Lock, X, Check } from "lucide-react";
import ImageCropModal from "@/components/added_cat/ImageCropModal";
import { useNotification } from '@/hooks/useNotification';

interface QuestionFormContentProps {
  categoryId: string | number;
  questionId?: string | number | null;
  mode: "add" | "edit";
}

export default function QuestionFormContent({ categoryId, questionId, mode }: QuestionFormContentProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [points, setPoints] = useState(200);
  const [loading, setLoading] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [error, setError] = useState("");
  const notify = useNotification();

  // Question image states
  const [questionImage, setQuestionImage] = useState<string | null>(null);
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
  const [tempQuestionImage, setTempQuestionImage] = useState<string | null>(null);

  // Answer image states
  const [answerImage, setAnswerImage] = useState<string | null>(null);
  const [answerImageFile, setAnswerImageFile] = useState<File | null>(null);
  const [tempAnswerImage, setTempAnswerImage] = useState<string | null>(null);

  const questionImageInputRef = useRef<HTMLInputElement>(null);
  const answerImageInputRef = useRef<HTMLInputElement>(null);

  // Handle question image selection - Open crop modal
  const handleQuestionImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTempQuestionImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cropped question image
  const handleQuestionCropComplete = (croppedFile: File) => {
    setQuestionImageFile(croppedFile);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setQuestionImage(ev.target?.result as string);
    };
    reader.readAsDataURL(croppedFile);
    setTempQuestionImage(null);
  };

  // Handle question crop cancel
  const handleQuestionCropCancel = () => {
    setTempQuestionImage(null);
    if (questionImageInputRef.current) {
      questionImageInputRef.current.value = '';
    }
  };

  // Handle answer image selection - Open crop modal
  const handleAnswerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setTempAnswerImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cropped answer image
  const handleAnswerCropComplete = (croppedFile: File) => {
    setAnswerImageFile(croppedFile);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAnswerImage(ev.target?.result as string);
    };
    reader.readAsDataURL(croppedFile);
    setTempAnswerImage(null);
  };

  // Handle answer crop cancel
  const handleAnswerCropCancel = () => {
    setTempAnswerImage(null);
    if (answerImageInputRef.current) {
      answerImageInputRef.current.value = '';
    }
  };

  // Remove question image
  const removeQuestionImage = () => {
    setQuestionImage(null);
    setQuestionImageFile(null);
    if (questionImageInputRef.current) {
      questionImageInputRef.current.value = '';
    }
  };

  // Remove answer image
  const removeAnswerImage = () => {
    setAnswerImage(null);
    setAnswerImageFile(null);
    if (answerImageInputRef.current) {
      answerImageInputRef.current.value = '';
    }
  };

  // Fetch question data when in edit mode
  useEffect(() => {
    if (isEditMode && questionId) {
      setLoadingQuestion(true);
      gameAPI.getQuestion(Number(questionId))
        .then((data) => {
          setQuestion(data.text || "");
          setAnswer(data.answer || "");
          setPoints(data.points || 200);

          // Set existing images if they exist
          if (data.image) {
            setQuestionImage(data.image);
          }
          if (data.answer_image) {
            setAnswerImage(data.answer_image);
          }
        })
        .catch((err) => {
          logger.exception(err, { where: 'QuestionFormContent.loadQuestion' });
          setError("Failed to load question data");
        })
        .finally(() => {
          setLoadingQuestion(false);
        });
    }
  }, [isEditMode, questionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      if (isEditMode) {
        // Edit mode: Use flat structure for PUT request
        formData.append("text", question);
        formData.append("answer", answer);
        formData.append("points", points.toString());
        formData.append("category", categoryId.toString());

        // Add images if uploaded
        if (questionImageFile) {
          formData.append("image", questionImageFile);
        }
        if (answerImageFile) {
          formData.append("answer_image", answerImageFile);
        }

        // Update existing question
        await gameAPI.updateQuestion(Number(questionId), formData);
      } else {
        // Add mode: Use nested structure for POST request
        formData.append("questions[0][text]", question);
        formData.append("questions[0][answer]", answer);
        formData.append("questions[0][points]", points.toString());

        // Add images if uploaded
        if (questionImageFile) {
          formData.append("questions[0][image]", questionImageFile);
        }
        if (answerImageFile) {
          formData.append("questions[0][answer_image]", answerImageFile);
        }

        // Create new question
        await gameAPI.addQuestionsToCategory(Number(categoryId), formData);
      }

      // Show success toast then navigate
      notify.success(
        isEditMode ? 'Question Updated' : 'Question Added',
        isEditMode ? 'The question has been updated successfully.' : 'The question has been added successfully.',
        3000
      );
      setTimeout(() => {
        router.push(`/categories/edit/${categoryId}`);
      }, 250);
    } catch (err) {
      logger.exception(err, { where: 'QuestionFormContent.saveQuestion', isEditMode });
      const errorObj = err as { detail?: string; message?: string; error?: string; errors?: unknown };
      setError(errorObj?.error || errorObj?.detail || errorObj?.message || `There was an error ${isEditMode ? 'updating' : 'adding'} the question`);
      notify.error(
        isEditMode ? 'Update Failed' : 'Create Failed',
        `Unable to ${isEditMode ? 'update' : 'create'} the question. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingQuestion) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Image Crop Modals */}
      {tempQuestionImage && (
        <ImageCropModal
          imageSrc={tempQuestionImage}
          onCropComplete={handleQuestionCropComplete}
          onCancel={handleQuestionCropCancel}
        />
      )}

      {tempAnswerImage && (
        <ImageCropModal
          imageSrc={tempAnswerImage}
          onCropComplete={handleAnswerCropComplete}
          onCancel={handleAnswerCropCancel}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Question Section */}
        <div className="space-y-4">
          <label className="block text-gray-900 text-xl font-bold">
            the question:
          </label>

          {/* Question Input */}
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl border-2 border-blue-300 text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
            placeholder="write the question ..."
            rows={2}
            required
          />

          {/* Multiple Choice Toggle (Future Feature) */}
          <button
            type="button"
            className="flex items-center gap-3 px-5 py-3 rounded-2xl text-gray-900 border-2 border-blue-300 bg-white hover:bg-blue-50 transition-colors"
            title="multiple choices (soon)"
          >
            <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-blue-400"></div>
            <span className="font-medium">multiple choices (soon)</span>
          </button>

          {/* Question Image Preview */}
          {questionImage && (
            <div className="relative w-full max-w-xs mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={questionImage}
                src={questionImage}
                alt="Question preview"
                className="w-full h-48 object-cover rounded-xl border-2 border-primary-600"
              />
              <button
                type="button"
                onClick={removeQuestionImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-black rounded-full p-1.5 shadow-lg transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Question Media Buttons */}
          <div className="flex gap-4 justify-center">
            {/* Audio Button */}
            <button
              type="button"
              className="relative flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-white border-4 border-amber-400 hover:bg-amber-50 transition-colors shadow-md"
              title="add an audio"
            >
              <Mic className="h-10 w-10 text-gray-900 mb-2" />
              <span className="text-sm text-gray-900 font-medium">audio</span>
              <div className="absolute -bottom-3 px-3 py-1 bg-amber-400 text-gray-900 text-xs font-bold rounded-full">
                premium
              </div>
              <Lock className="absolute top-2 right-2 h-5 w-5 text-amber-500" />
            </button>

            {/* Video Button */}
            <button
              type="button"
              className="relative flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-white border-4 border-amber-400 hover:bg-amber-50 transition-colors shadow-md"
              title="add a video"
            >
              <Video className="h-10 w-10 text-gray-900 mb-2" />
              <span className="text-sm text-gray-900 font-medium">video</span>
              <div className="absolute -bottom-3 px-3 py-1 bg-amber-400 text-gray-900 text-xs font-bold rounded-full">
                premium
              </div>
              <Lock className="absolute top-2 right-2 h-5 w-5 text-amber-500" />
            </button>

            {/* Image Button */}
            <button
              type="button"
              onClick={() => questionImageInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-gray-200 border-4 border-gray-300 hover:bg-gray-300 transition-colors shadow-md"
              title="add an image"
            >
              <ImageIcon className="h-10 w-10 text-gray-900 mb-2" />
              <span className="text-sm text-gray-900 font-medium">image</span>
              {questionImage && (
                <Check className="absolute top-2 right-2 h-5 w-5 text-green-500" />
              )}
            </button>

            {/* Hidden file input for question image */}
            <input
              ref={questionImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleQuestionImageSelect}
              aria-label="Upload question image"
            />
          </div>
        </div>

        {/* Answer Section */}
        <div className="space-y-4">
          <label className="block text-gray-900 text-xl font-bold">
            the answer
          </label>

          {/* Answer Input */}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-6 py-4 rounded-2xl border-2 border-blue-300 text-gray-900 placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-base"
            placeholder="write the answere here ..."
            rows={2}
            required
          />

          {/* Answer Image Preview */}
          {answerImage && (
            <div className="relative w-full max-w-xs mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={answerImage}
                src={answerImage}
                alt="Answer preview"
                className="w-full h-48 object-cover rounded-xl border-2 border-slate-600"
              />
              <button
                type="button"
                onClick={removeAnswerImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-black rounded-full p-1.5 shadow-lg transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Answer Media Buttons */}
          <div className="flex gap-4 justify-center">
            {/* Audio Button */}
            <button
              type="button"
              className="relative flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-white border-4 border-amber-400 hover:bg-amber-50 transition-colors shadow-md"
              title="add an audio"
            >
              <Mic className="h-10 w-10 text-gray-900 mb-2" />
              <span className="text-sm text-gray-900 font-medium">audio</span>
              <div className="absolute -bottom-3 px-3 py-1 bg-amber-400 text-gray-900 text-xs font-bold rounded-full">
                premium
              </div>
              <Lock className="absolute top-2 right-2 h-5 w-5 text-amber-500" />
            </button>

            {/* Video Button */}
            <button
              type="button"
              className="relative flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-white border-4 border-amber-400 hover:bg-amber-50 transition-colors shadow-md"
              title="add a video"
            >
              <Video className="h-10 w-10 text-gray-900 mb-2" />
              <span className="text-sm text-gray-900 font-medium">video</span>
              <div className="absolute -bottom-3 px-3 py-1 bg-amber-400 text-gray-900 text-xs font-bold rounded-full">
                premium
              </div>
              <Lock className="absolute top-2 right-2 h-5 w-5 text-amber-500" />
            </button>

            {/* Image Button */}
            <button
              type="button"
              onClick={() => answerImageInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-gray-200 border-4 border-gray-300 hover:bg-gray-300 transition-colors shadow-md"
              title="add an image "
            >
              <ImageIcon className="h-10 w-10 text-gray-900 mb-2" />
              <span className="text-sm text-gray-900 font-medium">Image</span>
              {answerImage && (
                <Check className="absolute top-2 right-2 h-5 w-5 text-green-500" />
              )}
            </button>

            {/* Hidden file input for answer image */}
            <input
              ref={answerImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAnswerImageSelect}
              aria-label="Upload answer image"
            />
          </div>
        </div>

        {/* Points Section */}
        <div className="space-y-4">
          <label className="block text-gray-900 text-xl font-bold">
            points:
          </label>
          <div className="flex gap-4 justify-center flex-wrap">
            {[200, 400, 600].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPoints(p)}
                className={`px-12 py-4 rounded-2xl font-bold text-2xl transition-all shadow-md ${
                  points === p
                    ? 'bg-amber-400 text-gray-900 scale-105 border-2 border-amber-500'
                    : 'bg-blue-300 text-gray-900 hover:bg-blue-400 border-2 border-blue-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4">
            <p className="text-red-300 text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-6 pt-4">
          <button
            type="submit"
            disabled={loading || loadingQuestion || !question.trim() || !answer.trim()}
            className="w-full bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed py-5 rounded-2xl font-bold text-xl text-white shadow-lg transition-all transform hover:scale-[1.02] disabled:scale-100"
          >
            {loading ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update ✓" : "Save ✓")}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => router.push(`/categories/edit/${categoryId}`)}
            className="w-full bg-red-400 hover:bg-red-500 py-5 rounded-2xl font-bold text-xl text-white shadow-lg transition-all transform hover:scale-[1.02]"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
