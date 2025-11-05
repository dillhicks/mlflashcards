'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FlashcardStudy from '@/components/FlashcardStudy';
import { loadCategoryByName, Flashcard as FlashcardType } from '@/lib/flashcardLoader';

export default function StudyCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params.slug as string;

  const [subjects, setSubjects] = useState<{ subject: string; description: string; cards: FlashcardType[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const data = await loadCategoryByName(categorySlug);
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching category flashcards:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [categorySlug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-300">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-300">No cards available for this category</p>
          <a href="/" className="font-medium text-blue-400 hover:text-blue-300">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const allCards = subjects.flatMap(subject => subject.cards);

  if (allCards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-300">No cards available for this category</p>
          <a href="/" className="font-medium text-blue-400 hover:text-blue-300">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <FlashcardStudy
      title={categoryName}
      description={`${subjects.length} subjects • ${allCards.length} cards total`}
      cards={allCards}
      backHref="/"
      backText="Back to Subjects"
      isCompact={true}
    />
  );
}