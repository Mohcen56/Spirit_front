'use client';

import React, { useState, useMemo } from 'react';
import { PlusCircle, ChevronRight, Trash2, Edit } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  answer: string;
  points: number;
  image?: string;
  answer_image?: string;
  created_at?: string; // Add created_at for sorting
}

interface QuestionsListProps {
  questions: Question[];
  onAddQuestion?: () => void;
  onDeleteQuestion?: (questionId: number) => void;
  onEditQuestion?: (questionId: number) => void;
}

type SortType = 'newest' | 'oldest' | 'points-high' | 'points-low';

export default function QuestionsList({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  onEditQuestion,
}: QuestionsListProps) {
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debug: Log what we received
  console.log('📦 QuestionsList received questions:', questions);
  console.log('📦 QuestionsList questions type:', typeof questions);
  console.log('📦 QuestionsList is array?:', Array.isArray(questions));
  
  // Ensure questions is an array (wrapped in useMemo to avoid dependency issues)
  const questionsArray = useMemo(() => {
    return Array.isArray(questions) ? questions : [];
  }, [questions]);
  
  console.log('📦 QuestionsList questionsArray length:', questionsArray.length);
  
  // Filter and sort questions
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questionsArray;
    
    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(q => 
        q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          // If created_at exists, use it; otherwise use id (higher id = newer)
          return (b.id || 0) - (a.id || 0);
        case 'oldest':
          return (a.id || 0) - (b.id || 0);
        case 'points-high':
          return b.points - a.points;
        case 'points-low':
          return a.points - b.points;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [questionsArray, searchQuery, sortBy]);
  
  // Group questions by points
  const groupedQuestions = filteredAndSortedQuestions.reduce((acc, question) => {
    if (!acc[question.points]) {
      acc[question.points] = [];
    }
    acc[question.points].push(question);
    return acc;
  }, {} as Record<number, Question[]>);

  // If no questions, show add button (only if onAddQuestion is provided)
  if (questionsArray.length === 0) {
    if (!onAddQuestion) {
      return (
        <div className="p-10 w-full mb-6">
          <div className="flex justify-center">
            <p className="text-gray-500 text-lg">No questions available in this category</p>
          </div>
        </div>
      );
    }
    return (
      <div className=" p-10 w-full mb-6">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onAddQuestion}
            className="flex items-center justify-center space-x-3 text-balck px-10 py-5   transition-all transform hover:scale-105 text-xl font-bold"
          >
            <PlusCircle className="h-6 w-6" />
            <span>Add Questions</span>
          </button>
        </div>
      </div>
    );
  }

  // Show questions list
  return (
    <div className="rounded-xl shadow-xl p-6 w-full  bg-white mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold text-lg">
            Questions: {filteredAndSortedQuestions.length}
          </div>
        </div>
        {onAddQuestion && (
          <button
            type="button"
            onClick={onAddQuestion}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg shadow-md transition-all transform hover:scale-105 font-bold"
          >
            <PlusCircle className="h-5 w-5" />
            <span>+ Add Question</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search for a question..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-primary-600 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4 justify-content-center overflow-x-auto p-1">
        <button 
          onClick={() => setSortBy('oldest')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            sortBy === 'oldest' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-600 text-white hover:bg-slate-500'
          }`}
        >
          Oldest
        </button>
        <button 
          onClick={() => setSortBy('points-high')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            sortBy === 'points-high' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-600 text-white hover:bg-slate-500'
          }`}
        >
          Points (High to Low)
        </button>
        <button 
          onClick={() => setSortBy('points-low')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            sortBy === 'points-low' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-600 text-white hover:bg-slate-500'
          }`}
        >
          Points (Low to High)
        </button>
        <button 
          onClick={() => setSortBy('newest')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            sortBy === 'newest' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-600 text-white hover:bg-slate-500'
          }`}
        >
          Newest
        </button>
      

      {/* Points Selector */}
    
        {[ 200,  400, 600].map((points) => (
          <button
            key={points}
            className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-colors ${
              groupedQuestions[points]
                ? 'bg-slate-600 text-white hover:bg-slate-500'
                : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
            disabled={!groupedQuestions[points]}
          >
            {points}
          </button>
        ))}
      
    </div>
      {/* Questions List */}
      <div className="space-y-3">
        {filteredAndSortedQuestions.map((question) => (
          <div
            key={question.id}
            className="rounded-xl p-4 border border-primary-600 hover:border-slate-500 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              {/* Points Badge */}
              <div className=" absolute -mt-8 flex-shrink-0 bg-slate-900 text-white px-3 py-1 rounded-lg font-bold text-sm">
                {question.points}
              </div>

              {/* Question Content */}
              <div className="flex-1">
                <div className="flex">
                <div className=" text-black text-lg mb-2 font-semibold">
                  Question: 
                </div>
                <div className="flex text-black text-base leading-relaxed">
                  {question.text}
                </div>
                </div>
                   <div className="flex">
                <div className=" text-black text-lg mb-2 font-semibold">
                  answer: 
                </div>
                <div className="flex text-black text-base leading-relaxed">
                  {question.answer}
                </div>
                </div>

                {/* Images indicators */}
                <div className="mt-2 flex gap-2">
                  {question.image && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                      📷 Question Image
                    </span>
                  )}
                  {question.answer_image && (
                    <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                      📷 Answer Image
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow Icon */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {onEditQuestion && (
                  <button
                    type="button"
                    onClick={() => onEditQuestion(question.id)}
                    className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                    title="Edit question"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                )}
                {onDeleteQuestion && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this question?')) {
                        onDeleteQuestion(question.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                    title="Delete question"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
                <ChevronRight className="h-6 w-6 text-slate-400" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
