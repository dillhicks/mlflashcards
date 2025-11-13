export interface Flashcard {
  front: string;
  back: string;
}

export interface Subject {
  subject: string;
  description: string;
  place?: number;
  cards: Flashcard[];
}

export interface Category {
  category: string;
  place?: number;
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

    // Handle new response format with categoryName
    if (data && typeof data === 'object' && 'subjects' in data) {
      return data.subjects;
    }

    // Fallback for old format (backward compatibility)
    return data;
  } catch (error) {
    console.error('Error loading category flashcards:', error);
    throw error;
  }
}

export async function loadCategoryByNameWithTitle(categoryName: string): Promise<{categoryName: string; subjects: Subject[]}> {
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

    // Handle new response format with categoryName
    if (data && typeof data === 'object' && 'categoryName' in data && 'subjects' in data) {
      return {
        categoryName: data.categoryName,
        subjects: data.subjects
      };
    }

    // Fallback for old format - construct from slug
    return {
      categoryName: categoryName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      subjects: data
    };
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

export async function loadSubjectByCategoryAndSubject(categoryName: string, subjectName: string): Promise<Subject | null> {
  try {
    const response = await fetch(`/api/flashcards?category=${encodeURIComponent(categoryName)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch category flashcards: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if the response contains an error message
    if (data && typeof data === 'object' && 'error' in data) {
      throw new Error((data as any).error);
    }

    // Handle new response format with categoryName and subjects
    let subjects: Subject[];
    if (data && typeof data === 'object' && 'subjects' in data) {
      subjects = data.subjects;
    } else {
      // Fallback for old format (backward compatibility)
      subjects = data;
    }

    return subjects.find(subject =>
      subject.subject.toLowerCase().replace(/\s+/g, '-') === subjectName.toLowerCase()
    ) || null;
  } catch (error) {
    console.error('Error loading subject by category and name:', error);
    return null;
  }
}