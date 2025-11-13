import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { NextResponse } from 'next/server';

function sortSubjects(subjects: Subject[]): Subject[] {
  return subjects.sort((a, b) => {
    // Items without place values go last
    const aHasPlace = a.place !== undefined;
    const bHasPlace = b.place !== undefined;

    if (aHasPlace && bHasPlace) {
      // Both have place values, sort by place (ascending)
      return a.place - b.place;
    }
    if (aHasPlace && !bHasPlace) {
      // A has place, B doesn't - A comes first
      return -1;
    }
    if (!aHasPlace && bHasPlace) {
      // A doesn't have place, B does - B comes first
      return 1;
    }
    // Neither has place value, sort alphabetically
    return a.subject.localeCompare(b.subject);
  });
}

function sortCategories(categories: Category[]): Category[] {
  return categories.sort((a, b) => {
    // Items without place values go last
    const aHasPlace = a.place !== undefined;
    const bHasPlace = b.place !== undefined;

    if (aHasPlace && bHasPlace) {
      // Both have place values, sort by place (ascending)
      return a.place - b.place;
    }
    if (aHasPlace && !bHasPlace) {
      // A has place, B doesn't - A comes first
      return -1;
    }
    if (!aHasPlace && bHasPlace) {
      // A doesn't have place, B does - B comes first
      return 1;
    }
    // Neither has place value, sort alphabetically
    return a.category.localeCompare(b.category);
  });
}

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

export interface CategoryMetadata {
  place?: number;
}

export interface Category {
  category: string;
  place?: number;
  subjects: Subject[];
}

export async function GET(request: Request) {
  const flashcardsDir = join(process.cwd(), 'flashcards');
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const mode = searchParams.get('mode'); // 'all' for all flashcards

  try {
    const categories: Category[] = [];

    // Get all directories (categories) in the flashcards folder
    const items = readdirSync(flashcardsDir, { withFileTypes: true });
    const categoryDirs = items.filter(item => item.isDirectory()).map(dir => dir.name);

    // If no categories found, check for direct YAML files (backward compatibility)
    if (categoryDirs.length === 0) {
      const files = readdirSync(flashcardsDir)
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
        .sort();

      const subjects: Subject[] = [];
      for (const file of files) {
        const filePath = join(flashcardsDir, file);
        const fileContent = readFileSync(filePath, 'utf8');
        const data = yaml.load(fileContent) as Subject;

        // Validate that the loaded data has required fields
        if (data && data.subject && Array.isArray(data.cards)) {
          subjects.push(data);
        } else {
          console.warn(`Invalid subject data in file: ${file}`);
        }
      }

      // Sort subjects by place, then alphabetically
      sortSubjects(subjects);

      // If mode is 'all', return a combined subject with all flashcards
      if (mode === 'all') {
        const allCards = subjects.flatMap(subject => subject.cards);
        return NextResponse.json([{
          subject: 'All Flashcards',
          description: `All flashcards from ${subjects.length} subjects`,
          cards: allCards
        }]);
      }

      return NextResponse.json(subjects);
    }

    // Process each category folder
    for (const categoryDir of categoryDirs) {
      const categoryPath = join(flashcardsDir, categoryDir);

      // Load metadata if it exists
      let categoryPlace: number | undefined;
      try {
        const metadataPath = join(categoryPath, 'metadata.yml');
        const metadataContent = readFileSync(metadataPath, 'utf8');
        const metadata = yaml.load(metadataContent) as CategoryMetadata;
        categoryPlace = metadata.place;
      } catch (error) {
        // metadata.yml doesn't exist, that's fine
      }

      const files = readdirSync(categoryPath)
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml') && file !== 'metadata.yml')
        .sort();

      const subjects: Subject[] = [];
      for (const file of files) {
        const filePath = join(categoryPath, file);
        const fileContent = readFileSync(filePath, 'utf8');
        const data = yaml.load(fileContent) as Subject;

        // Validate that the loaded data has required fields
        if (data && data.subject && Array.isArray(data.cards)) {
          subjects.push(data);
        } else {
          console.warn(`Invalid subject data in file: ${file}`);
        }
      }

      // Sort subjects by place, then alphabetically
      sortSubjects(subjects);

      if (subjects.length > 0) {
        categories.push({
          category: categoryDir,
          place: categoryPlace,
          subjects: subjects
        });
      }
    }

    // Sort categories by place, then alphabetically
    sortCategories(categories);

    // Handle specific category request
    if (category) {
      const requestedCategory = categories.find(cat =>
        cat.category.toLowerCase().replace(/\s+/g, '-') === category.toLowerCase()
      );

      if (!requestedCategory) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      // Return subjects for this category
      return NextResponse.json(requestedCategory.subjects);
    }

    // Handle "all" mode
    if (mode === 'all') {
      const allSubjects = categories.flatMap(cat => cat.subjects);
      const allCards = allSubjects.flatMap(subject => subject.cards);
      return NextResponse.json([{
        subject: 'All Flashcards',
        description: `All flashcards from ${allSubjects.length} subjects across ${categories.length} categories`,
        cards: allCards
      }]);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error loading flashcards:', error);
    return NextResponse.json([], { status: 500 });
  }
}