'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Flashcard from './Flashcard';
import { Shuffle, RotateCcw, Moon, Sun, Eye } from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { Flashcard as FlashcardType } from '@/lib/flashcardLoader';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface FlashcardStudyProps {
  title: string;
  description: string;
  cards: FlashcardType[];
  backHref?: string;
  backText?: string;
  isCompact?: boolean;
}

export default function FlashcardStudy({
  title,
  description,
  cards,
  backHref = "/",
  backText = "Back",
  isCompact = false
}: FlashcardStudyProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [displayCards, setDisplayCards] = useState<FlashcardType[]>([...cards]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const flashcardRef = useRef<HTMLDivElement>(null);

  const handleNext = () => {
    if (currentCardIndex < displayCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Show completion modal when reaching the last card
  useEffect(() => {
    if (currentCardIndex === displayCards.length - 1 && displayCards.length > 0) {
      setShowCompletionModal(true);
    }
  }, [currentCardIndex, displayCards.length]);

  const closeModal = () => {
    setShowCompletionModal(false);
  };

  const closeShowAllModal = () => {
    setShowAllModal(false);
  };

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with typing in input fields
      }

      // Close modal with Escape or any key when modal is open
      if (showCompletionModal) {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          closeModal();
          return;
        }
      }

      // Close show all modal with Escape
      if (showAllModal && e.key === 'Escape') {
        e.preventDefault();
        closeShowAllModal();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        // Find the actual clickable flashcard element and trigger click
        const flashcardElement = flashcardRef.current?.querySelector('[role="button"]');
        if (flashcardElement) {
          (flashcardElement as HTMLElement).click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentCardIndex, displayCards.length, showCompletionModal, showAllModal]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleShuffle = () => {
    if (isShuffled) {
      setDisplayCards([...cards]);
      setCurrentCardIndex(0);
    } else {
      const shuffled = shuffleArray(cards);
      setDisplayCards(shuffled);
      setCurrentCardIndex(0);
    }
    setIsShuffled(!isShuffled);
  };

  const handleReset = () => {
    setCurrentCardIndex(0);
  };

  if (displayCards.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="text-center">
          <p className={`text-xl mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>No cards available</p>
          <Link
            href={backHref}
            className={`font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
          >
            {backText}
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = displayCards[currentCardIndex];

  return (
    <div className={`min-h-screen ${isCompact ? 'py-4' : 'py-8'} px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`mb-3`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.history.back()}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-blue-400 hover:bg-gray-700' : 'bg-gray-200 text-blue-600 hover:bg-gray-300'}`}
              aria-label="Go back"
            >
              ←
            </button>
            <div className="text-center flex-1 mx-4">
              <h1 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {description}
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className={`w-full rounded-full h-1.5 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentCardIndex + 1) / displayCards.length) * 100}%` }}
            />
          </div>
          <div className={`flex justify-between text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <span>{currentCardIndex + 1} / {displayCards.length}</span>
            <span>{Math.round(((currentCardIndex + 1) / displayCards.length) * 100)}%</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-6" ref={flashcardRef}>
          <Flashcard
            front={currentCard.front}
            back={currentCard.back}
            onNext={handleNext}
            onPrevious={handlePrevious}
            currentIndex={currentCardIndex}
            totalCards={displayCards.length}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <button
            onClick={handleShuffle}
            className={`p-3 rounded-lg transition-colors ${
              isShuffled
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            aria-label={isShuffled ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <Shuffle size={20} />
          </button>

          <button
            onClick={() => setShowAllModal(true)}
            className={`p-3 rounded-lg transition-colors ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
            aria-label="Show all cards"
          >
            <Eye size={20} />
          </button>

          <button
            onClick={handleReset}
            className="p-3 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
            aria-label="Reset cards"
          >
            <RotateCcw size={20} />
          </button>
        </div>

      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className={`relative max-w-md w-full rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-colors z-10 ${
                isDarkMode
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Congratulations!
              </h3>
              <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                You've completed all <span className="font-semibold">{displayCards.length}</span> cards.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    handleReset();
                    closeModal();
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Study Again
                </button>
                <Link
                  href={backHref}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
                >
                  {backText === "Back" ? "Choose Another" : backText}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show All Modal */}
      {showAllModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeShowAllModal}
        >
          <div
            className={`relative w-full max-w-4xl h-5/6 max-h-[800px] rounded-xl shadow-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                All Flashcards ({displayCards.length})
              </h2>
              <button
                onClick={closeShowAllModal}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {displayCards.map((card, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Card {index + 1}
                    </div>
                    <div className={`mb-3 p-3 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        Front:
                      </div>
                      <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-sm leading-relaxed`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            h1: ({children}) => <h1 className="text-base font-bold mb-1">{children}</h1>,
                            h2: ({children}) => <h2 className="text-sm font-semibold mb-1">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                            p: ({children}) => <p className="mb-1">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-1 text-left">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-1 text-left">{children}</ol>,
                            li: ({children}) => <li className="mb-0.5">{children}</li>,
                            code: ({className, children}) => {
                              const isInline = !className;
                              return isInline
                                ? <code className={`px-1 py-0.5 rounded text-xs font-mono ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{children}</code>
                                : <code className={`block p-1 rounded text-xs font-mono overflow-x-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{children}</code>;
                            },
                            pre: ({children}) => <pre className={`p-1 rounded text-xs overflow-x-auto mb-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{children}</pre>,
                            blockquote: ({children}) => <blockquote className={`border-l-4 pl-2 italic mb-1 ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'}`}>{children}</blockquote>,
                            strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                            a: ({href, children}) => <a href={href} className="text-blue-500 hover:text-blue-400 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                            table: ({children}) => <table className="min-w-full border-collapse border border-gray-300 mb-1 text-xs">{children}</table>,
                            thead: ({children}) => <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>{children}</thead>,
                            th: ({children}) => <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-xs">{children}</th>,
                            td: ({children}) => <td className="border border-gray-300 px-1 py-0.5 text-xs">{children}</td>,
                          }}
                        >
                          {card.front}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className={`p-3 rounded ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <div className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Back:
                      </div>
                      <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'} text-sm leading-relaxed`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                            h1: ({children}) => <h1 className="text-base font-bold mb-1">{children}</h1>,
                            h2: ({children}) => <h2 className="text-sm font-semibold mb-1">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                            p: ({children}) => <p className="mb-1">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-1 text-left">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-1 text-left">{children}</ol>,
                            li: ({children}) => <li className="mb-0.5">{children}</li>,
                            code: ({className, children}) => {
                              const isInline = !className;
                              return isInline
                                ? <code className={`px-1 py-0.5 rounded text-xs font-mono ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{children}</code>
                                : <code className={`block p-1 rounded text-xs font-mono overflow-x-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{children}</code>;
                            },
                            pre: ({children}) => <pre className={`p-1 rounded text-xs overflow-x-auto mb-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>{children}</pre>,
                            blockquote: ({children}) => <blockquote className={`border-l-4 pl-2 italic mb-1 ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-600'}`}>{children}</blockquote>,
                            strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                            em: ({children}) => <em className="italic">{children}</em>,
                            a: ({href, children}) => <a href={href} className="text-blue-500 hover:text-blue-400 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                            table: ({children}) => <table className="min-w-full border-collapse border border-gray-300 mb-1 text-xs">{children}</table>,
                            thead: ({children}) => <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>{children}</thead>,
                            th: ({children}) => <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-xs">{children}</th>,
                            td: ({children}) => <td className="border border-gray-300 px-1 py-0.5 text-xs">{children}</td>,
                          }}
                        >
                          {card.back}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-center">
                <button
                  onClick={closeShowAllModal}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Back to Flashcards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}