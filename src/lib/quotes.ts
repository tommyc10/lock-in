const QUOTES = [
  "Small daily improvements over time lead to stunning results.",
  "Discipline is choosing between what you want now and what you want most.",
  "The body achieves what the mind believes.",
  "You don't have to be extreme, just consistent.",
  "Success is the sum of small efforts repeated day in and day out.",
  "The only bad workout is the one that didn't happen.",
  "Take care of your body. It's the only place you have to live.",
  "What you do every day matters more than what you do once in a while.",
  "Progress, not perfection.",
  "Your future self will thank you.",
  "It's not about being the best. It's about being better than you were yesterday.",
  "The pain you feel today will be the strength you feel tomorrow.",
  "Champions are made when nobody is watching.",
  "Motivation gets you started. Habit keeps you going.",
  "A year from now you'll wish you had started today.",
  "The secret of getting ahead is getting started.",
  "Don't stop until you're proud.",
  "Your only limit is you.",
  "Invest in yourself. It pays the best interest.",
  "Consistency is what transforms average into excellence.",
  "The harder you work, the luckier you get.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Be stronger than your excuses.",
  "Results happen over time, not overnight. Stay patient and stay focused.",
  "You are one decision away from a completely different life.",
  "The grind includes days you don't feel like grinding.",
  "Confidence comes from discipline and training.",
  "Fall in love with taking care of yourself.",
  "Every expert was once a beginner.",
  "Trust the process. Your time is coming.",
  "The best project you'll ever work on is you.",
];

export function getTodayQuote(): string {
  const today = new Date().toISOString().split("T")[0];
  const hash = today.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return QUOTES[hash % QUOTES.length];
}
