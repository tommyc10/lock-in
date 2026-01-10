# 🔒 Lock In

A minimal, focused productivity app to build better habits and track your daily progress.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

---

## ✨ Features

- **📋 Habit Tracking** — Create and track daily habits organized by morning, afternoon, and evening
- **🏋️ Workout Logger** — Log exercises, sets, reps, and weights
- **🎯 Daily Priorities** — Set your top priorities for each day
- **📝 Reflections** — Record wins, struggles, and plans for tomorrow
- **📊 Progress Stats** — View your 7-day completion rate and streaks

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/tommyc10/lock-in.git
cd lock-in

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

| Technology       | Purpose          |
| ---------------- | ---------------- |
| **Next.js 16**   | React framework  |
| **TypeScript**   | Type safety      |
| **Tailwind CSS** | Styling          |
| **shadcn/ui**    | UI components    |
| **localStorage** | Data persistence |

---

## 📁 Project Structure

```
src/
├── app/                # Next.js app router pages
│   ├── habits/         # Habit tracking page
│   ├── workout/        # Workout logging page
│   └── reflection/     # Daily reflection page
├── components/         # React components
│   ├── habits/         # Habit-related components
│   ├── layout/         # Header, Navigation
│   └── ui/             # shadcn/ui components
└── lib/                # Utilities & types
    ├── storage.ts      # localStorage helpers
    ├── types.ts        # TypeScript types
    └── utils.ts        # Utility functions
```

---

## 📜 Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

---

## 📄 License

MIT

---

<p align="center">
  <strong>Lock in. Level up. 🚀</strong>
</p>
