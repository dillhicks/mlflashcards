'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { loadAllFlashcards, Category, Subject } from '@/lib/flashcardLoader';
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const data = await loadAllFlashcards();

        // Check if we have categories or direct subjects
        if (Array.isArray(data) && data.length > 0 && 'subjects' in data[0]) {
          setCategories(data as Category[]);
        } else {
          // Convert direct subjects to a single category for consistency
          setCategories([{ category: 'All Subjects', subjects: data as Subject[] }]);
        }
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="text-center">
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Dillon's ML Flashcards
            </h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex justify-center mb-8">
          <Link
            href="/study/all"
            className={`inline-flex items-center px-6 py-3 text-base font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            Study All Flashcards
            <span className="ml-2 text-sm">
              ({categories.reduce((total, cat) => total + (cat.subjects?.reduce((subTotal, sub) => subTotal + (sub.cards?.length || 0), 0) || 0), 0)} cards)
            </span>
          </Link>
        </div>

        <div className="space-y-12">
          {categories.filter(cat => cat && cat.category)?.map((category) => (
            <div key={category.category}>
              <Link
                href={`/study/category/${encodeURIComponent(category.category.toLowerCase().replace(/\s+/g, '-'))}`}
                className="group"
              >
                <div className={`mb-6 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600 hover:bg-gray-900/70'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                      }`}></div>
                      <h2 className={`text-xl font-semibold transition-colors ${
                        isDarkMode
                          ? 'text-gray-200 group-hover:text-gray-100'
                          : 'text-gray-700 group-hover:text-gray-800'
                      }`}>
                        {category.category}
                      </h2>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {category.subjects?.reduce((total, sub) => total + (sub.cards?.length || 0), 0) || 0} cards
                      </span>
                      <span className={`text-sm font-medium transition-colors ${
                        isDarkMode
                          ? 'text-gray-400 group-hover:text-gray-300'
                          : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        View all →
                      </span>
                    </div>
                  </div>
                  <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {category.subjects?.length || 0} subjects
                  </p>
                </div>
              </Link>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.subjects?.filter(subject => subject && subject.subject)?.map((subject) => (
                  <Link
                    key={subject.subject}
                    href={`/subject/${encodeURIComponent(subject.subject.toLowerCase().replace(/\s+/g, '-'))}`}
                    className="group"
                  >
                    <div className={`rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full border cursor-pointer ${
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}>
                      <div className="flex flex-col h-full">
                        <h3 className={`text-xl font-bold mb-3 transition-colors ${
                          isDarkMode
                            ? 'text-white group-hover:text-blue-400'
                            : 'text-gray-900 group-hover:text-blue-600'
                        }`}>
                          {subject.subject}
                        </h3>
                        <p className={`mb-4 flex-grow text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {subject.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {subject.cards?.length || 0} cards
                          </span>
                          <span className={`font-medium ${
                            isDarkMode
                              ? 'text-blue-400 group-hover:text-blue-300'
                              : 'text-blue-600 group-hover:text-blue-700'
                          }`}>
                            Study →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No flashcard subjects found. Add YAML files to the flashcards directory to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
