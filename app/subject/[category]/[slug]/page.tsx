'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import FlashcardStudy from '@/components/FlashcardStudy';
import { loadSubjectByCategoryAndSubject, Flashcard as FlashcardType } from '@/lib/flashcardLoader';

export default function CategorySubjectPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const slug = params.slug as string;

  const [subject, setSubject] = useState<{ subject: string; description: string; cards: FlashcardType[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const foundSubject = await loadSubjectByCategoryAndSubject(category, slug);

        if (foundSubject) {
          setSubject(foundSubject);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching subject:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchSubject();
  }, [category, slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-300">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-300">Subject not found</p>
          <a href="/" className="font-medium text-blue-400 hover:text-blue-300">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (subject.cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-300">No cards available for this subject</p>
          <a href="/" className="font-medium text-blue-400 hover:text-blue-300">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <FlashcardStudy
      title={subject.subject}
      description={subject.description}
      cards={subject.cards}
      backHref="/"
      backText="Back to Subjects"
      isCompact={true}
    />
  );
}