# ML Flashcards

A collection of my flashcards used to study subjects within ML.


### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd mlflashcards
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Adding Flashcards

Flashcards are stored as YAML files in the `flashcards/` directory. Each YAML file represents a subject:

```yaml
subject: Subject Name
description: Brief description of the subject
cards:
  - front: Question or term on the front
    back: Answer or definition on the back
  - front: Another question
    back: Another answer
```

### File Structure

```
flashcards/
├── ml-basics.yml
├── deep-learning.yml
└── your-subject.yml
```

### Example YAML File

```yaml
subject: Machine Learning Basics
description: Fundamental concepts in machine learning
cards:
  - front: What is Machine Learning?
    back: A subset of artificial intelligence that enables systems to learn and improve from experience.
  - front: What is Supervised Learning?
    back: A type of ML where the algorithm learns from labeled training data.
```

## Usage

1. **Choose a Subject**: Select from available subjects on the home page
2. **Navigate Cards**: Use arrow keys or navigation buttons to move between cards
3. **Flip Cards**: Click the card or press spacebar to see the answer
4. **Study Modes**: Toggle between sequential and shuffled modes
5. **Track Progress**: Monitor your progress through the progress bar

## Technologies Used

- **Next.js 15**: React framework with App Router
- **React 19**: UI library with hooks for state management
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for card flip effects
- **js-yaml**: YAML parser for loading flashcard data

## Development

### Project Structure

```
├── app/                 # Next.js app directory
│   ├── page.tsx        # Home page with subject cards
│   ├── subject/[slug]/ # Dynamic subject pages
│   └── layout.tsx      # Root layout
├── components/         # React components
│   └── Flashcard.tsx   # Individual flashcard component
├── lib/               # Utility functions
│   └── flashcardLoader.ts # YAML loading logic
├── flashcards/        # YAML flashcard files
└── public/           # Static assets
```

### Adding New Features

- Components are in the `components/` directory
- Utility functions are in the `lib/` directory
- Styles use Tailwind CSS classes
- Animations are handled with Framer Motion

