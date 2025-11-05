export interface Flashcard {
  front: string;
  back: string;
}

export interface Subject {
  subject: string;
  description: string;
  cards: Flashcard[];
}

export interface Category {
  category: string;
  subjects: Subject[];
}

export type FlashcardData = Subject[] | Category[];

export async function loadAllFlashcards(): Promise<FlashcardData> {
  try {
    const response = await fetch('/api/flashcards');
    if (!response.ok) {
      throw new Error('Failed to fetch flashcards');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading flashcards:', error);
    return [];
  }
}

export async function loadAllFlashcardsCombined(): Promise<Subject[]> {
  try {
    const response = await fetch('/api/flashcards?mode=all');
    if (!response.ok) {
      throw new Error('Failed to fetch all flashcards');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading all flashcards:', error);
    return [];
  }
}

export async function loadCategoryByName(categoryName: string): Promise<Subject[]> {
  try {
    const response = await fetch(`/api/flashcards?category=${encodeURIComponent(categoryName)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch category flashcards: ${response.statusText}`);
    }
    const data = await response.json();

    // Check if the response contains an error message
    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error loading category flashcards:', error);
    throw error;
  }
}

export function flattenSubjects(data: FlashcardData): Subject[] {
  if (Array.isArray(data) && data.length > 0) {
    // Check if this is categories array or subjects array
    if ('subjects' in data[0]) {
      // This is categories array
      return (data as Category[]).flatMap(category => category.subjects);
    } else {
      // This is subjects array
      return data as Subject[];
    }
  }
  return [];
}

export async function loadAllSubjects(): Promise<Subject[]> {
  const data = await loadAllFlashcards();
  return flattenSubjects(data);
}

export async function loadSubjectByName(subjectName: string): Promise<Subject | null> {
  const subjects = await loadAllSubjects();
  return subjects.find(subject =>
    subject.subject.toLowerCase().replace(/\s+/g, '-') === subjectName.toLowerCase()
  ) || null;
}