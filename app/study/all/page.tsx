'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FlashcardStudy from '@/components/FlashcardStudy';
import { loadAllFlashcardsCombined, Flashcard as FlashcardType } from '@/lib/flashcardLoader';

export default function StudyAllPage() {
  const router = useRouter();
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const data = await loadAllFlashcardsCombined();
        if (data.length > 0) {
          setCards(data[0].cards);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-300">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-300">No cards available</p>
          <a href="/" className="font-medium text-blue-400 hover:text-blue-300">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <FlashcardStudy
      title="All Flashcards"
      description={`All flashcards from multiple subjects`}
      cards={cards}
      backHref="/"
      backText="Back to Subjects"
      isCompact={true}
    />
  );
}