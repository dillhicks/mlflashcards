'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface FlashcardProps {
  front: string;
  back: string;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalCards?: number;
  isDarkMode?: boolean;
}

export default function Flashcard({
  front,
  back,
  onNext,
  onPrevious,
  currentIndex = 0,
  totalCards = 1,
  isDarkMode = false
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'ArrowRight' && onNext) {
      onNext();
    } else if (e.key === 'ArrowLeft' && onPrevious) {
      onPrevious();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-2">
        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Card {currentIndex + 1} of {totalCards}
        </span>
      </div>

      <div className="flex items-center justify-center gap-4 md:gap-8">
        {/* Previous Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onPrevious && currentIndex > 0) {
              onPrevious();
            }
          }}
          disabled={!onPrevious || currentIndex === 0}
          className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors flex items-center gap-2
            ${currentIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 cursor-pointer'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer'
            }`}
          aria-label="Previous card"
        >
          <span className="text-lg">←</span>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Flashcard */}
        <div
          className="relative w-full max-w-5xl h-[calc(100vh-280px)] max-h-[600px] cursor-pointer"
          onClick={handleFlip}
          onKeyDown={handleKeyPress}
          tabIndex={0}
          role="button"
          aria-label="Flip card"
        >
          <motion.div
            className="absolute inset-0 w-full h-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front of card */}
            <motion.div
              className="absolute inset-0 w-full h-full bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-6 md:p-8 flex items-center justify-center"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-gray-800 w-full h-full flex flex-col">
                <div className="text-sm uppercase tracking-wide mb-4 text-gray-500 flex-shrink-0 text-center">
                  Question
                </div>
                <div className="text-sm md:text-base lg:text-lg leading-relaxed overflow-y-auto flex-1 px-2 markdown-content text-left"
                     style={{
                       minHeight: '0',
                       maxHeight: 'calc(100% - 40px)'
                     }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      h1: ({children}) => <h1 className="text-xl font-bold text-gray-800 mb-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-semibold text-gray-800 mb-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base font-semibold text-gray-800 mb-1">{children}</h3>,
                      p: ({children}) => <p className="mb-2">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-2 text-left">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-2 text-left">{children}</ol>,
                      li: ({children}) => <li className="mb-1">{children}</li>,
                      code: ({className, children}) => {
                        const isInline = !className;
                        return isInline
                          ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                          : <code className="block bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto">{children}</code>;
                      },
                      pre: ({children}) => <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-2">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2">{children}</blockquote>,
                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                      table: ({children}) => <table className="min-w-full border-collapse border border-gray-300 mb-2">{children}</table>,
                      thead: ({children}) => <thead className="bg-gray-100">{children}</thead>,
                      th: ({children}) => <th className="border border-gray-300 px-2 py-1 text-left font-semibold">{children}</th>,
                      td: ({children}) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                    }}
                  >
                    {front}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>

            {/* Back of card */}
            <motion.div
              className="absolute inset-0 w-full h-full bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-6 md:p-8 flex items-center justify-center"
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 180 }}
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="text-gray-800 w-full h-full flex flex-col">
                <div className="text-sm uppercase tracking-wide mb-4 text-gray-500 flex-shrink-0 text-center">
                  Answer
                </div>
                <div className="text-sm md:text-base lg:text-lg leading-relaxed overflow-y-auto flex-1 px-2 markdown-content text-left"
                     style={{
                       minHeight: '0',
                       maxHeight: 'calc(100% - 40px)'
                     }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      h1: ({children}) => <h1 className="text-xl font-bold text-gray-800 mb-2">{children}</h1>,
                      h2: ({children}) => <h2 className="text-lg font-semibold text-gray-800 mb-2">{children}</h2>,
                      h3: ({children}) => <h3 className="text-base font-semibold text-gray-800 mb-1">{children}</h3>,
                      p: ({children}) => <p className="mb-2">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside mb-2 text-left">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside mb-2 text-left">{children}</ol>,
                      li: ({children}) => <li className="mb-1">{children}</li>,
                      code: ({className, children}) => {
                        const isInline = !className;
                        return isInline
                          ? <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                          : <code className="block bg-gray-100 p-2 rounded text-sm font-mono overflow-x-auto">{children}</code>;
                      },
                      pre: ({children}) => <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mb-2">{children}</pre>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-2">{children}</blockquote>,
                      strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      a: ({href, children}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                      table: ({children}) => <table className="min-w-full border-collapse border border-gray-300 mb-2">{children}</table>,
                      thead: ({children}) => <thead className="bg-gray-100">{children}</thead>,
                      th: ({children}) => <th className="border border-gray-300 px-2 py-1 text-left font-semibold">{children}</th>,
                      td: ({children}) => <td className="border border-gray-300 px-2 py-1">{children}</td>,
                    }}
                  >
                    {back}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNext && currentIndex < totalCards - 1) {
              onNext();
            }
          }}
          disabled={!onNext || currentIndex === totalCards - 1}
          className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors flex items-center gap-2
            ${currentIndex === totalCards - 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 cursor-pointer'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer'
            }`}
          aria-label="Next card"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="text-lg">→</span>
        </button>
      </div>

      <div className="text-center mt-2">
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Press SPACE or click card to flip • Use arrow keys to navigate
        </p>
      </div>
    </div>
  );
}