import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';
import { NextResponse } from 'next/server';

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
        subjects.push(data);
      }

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
      const files = readdirSync(categoryPath)
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
        .sort();

      const subjects: Subject[] = [];
      for (const file of files) {
        const filePath = join(categoryPath, file);
        const fileContent = readFileSync(filePath, 'utf8');
        const data = yaml.load(fileContent) as Subject;
        subjects.push(data);
      }

      if (subjects.length > 0) {
        categories.push({
          category: categoryDir,
          subjects: subjects
        });
      }
    }

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