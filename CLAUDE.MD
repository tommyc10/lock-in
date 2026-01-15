# Lock In - Project Context for Claude

## Project Overview

**Lock In** is a minimal, focused productivity app built to help users build better habits and track daily progress. It features habit tracking (organized by time of day), workout logging, daily priorities, reflections, and progress statistics.

**Live Demo:** https://lock-in-jade.vercel.app

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Data Persistence:** localStorage
- **Deployment:** Vercel

## Project Structure

```
lock-in/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── habits/             # Habit tracking page
│   │   ├── workout/            # Workout logging page
│   │   ├── reflection/         # Daily reflection page
│   │   ├── countdown/          # Countdown timer page
│   │   ├── vision/             # Vision board page
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Homepage/dashboard
│   ├── components/
│   │   ├── habits/             # Habit-related components
│   │   │   ├── HabitForm.tsx
│   │   │   ├── HabitItem.tsx
│   │   │   ├── HabitList.tsx
│   │   │   └── RecoveryModal.tsx
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Navigation.tsx
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── label.tsx
│   │       └── date-picker.tsx
│   └── lib/
│       ├── storage.ts          # localStorage helper functions
│       ├── types.ts            # TypeScript type definitions
│       └── utils.ts            # Utility functions (cn, etc.)
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Features & Pages

1. **Habits** (`/habits`) - Track daily habits organized by morning, afternoon, evening
2. **Workout** (`/workout`) - Log exercises with sets, reps, and weights
3. **Reflection** (`/reflection`) - Daily wins, struggles, and tomorrow's plans
4. **Countdown** (`/countdown`) - Timer functionality
5. **Vision** (`/vision`) - Vision board for goals
6. **Dashboard** (`/`) - Overview with priorities and progress stats

## Code Conventions

### Import Aliases
- Use `@/` alias for imports from `src/` directory
- Example: `import { Button } from "@/components/ui/button"`

### Component Structure
- Use TypeScript with React 19 and Next.js 16 App Router
- Components are organized by feature (habits, layout, ui)
- shadcn/ui components live in `src/components/ui/`

### Styling
- Tailwind CSS 4 for all styling
- Use `cn()` utility from `@/lib/utils` for conditional classes
- shadcn/ui components use class-variance-authority (CVA)

### Data Management
- **No external database** - all data stored in localStorage
- Storage helpers in `src/lib/storage.ts`
- Type definitions in `src/lib/types.ts`

### TypeScript Configuration
- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017
- JSX: react-jsx

## Dependencies

### Core
- `next` (16.1.1) - React framework
- `react` (19.2.3) - UI library
- `typescript` (^5) - Type safety

### UI & Styling
- `tailwindcss` (^4) - Utility-first CSS
- `@radix-ui/react-*` - Accessible component primitives
- `lucide-react` - Icon library
- `class-variance-authority` - CVA for component variants
- `tailwind-merge` & `clsx` - Class name utilities

## Important Notes

- **Client-side only data storage** - Uses localStorage, no backend/database
- **App Router** - Uses Next.js 16 App Router (not Pages Router)
- **React Server Components** - Default components are Server Components unless using 'use client'
- **No environment variables** currently configured
- **Deployed on Vercel** - Optimized for serverless deployment

## Common Tasks

### Adding a new page
1. Create page in `src/app/[route]/page.tsx`
2. Add navigation link in `src/components/layout/Navigation.tsx`

### Adding a new shadcn/ui component
```bash
npx shadcn-ui@latest add [component-name]
```

### Working with localStorage
- Use helpers from `src/lib/storage.ts`
- Define types in `src/lib/types.ts`
- All storage operations are client-side only

### Styling patterns
- Use Tailwind utility classes
- Combine with `cn()` for conditional styling
- Follow shadcn/ui patterns for component variants

## Git Repository

Repository: https://github.com/tommyc10/lock-in.git
Branch strategy: Standard (main branch)
