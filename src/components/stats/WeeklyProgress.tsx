"use client";

import { useState, useEffect } from "react";
import { getDueHabits, getCompletions } from "@/lib/storage";

interface DayData {
  label: string;
  percent: number;
  isToday: boolean;
}

export function WeeklyProgress() {
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const days: DayData[] = [];
    const today = new Date();
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const due = getDueHabits(dateStr);
      const completions = getCompletions(dateStr);
      const dueIds = new Set(due.map(h => h.id));
      const completed = completions.filter(c => dueIds.has(c.habitId) && c.completed).length;
      const percent = due.length > 0 ? Math.round((completed / due.length) * 100) : 0;

      days.push({
        label: dayLabels[date.getDay()],
        percent,
        isToday: i === 0,
      });
    }

    setWeekData(days);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div>
      <div className="flex items-end gap-1.5 h-24">
        {weekData.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative" style={{ height: "80px" }}>
              <div
                className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${
                  day.isToday
                    ? "bg-primary"
                    : day.percent >= 80
                    ? "bg-primary/60"
                    : day.percent > 0
                    ? "bg-primary/30"
                    : "bg-muted"
                }`}
                style={{ height: `${Math.max(day.percent, 4)}%` }}
              />
            </div>
            <span className={`text-[10px] font-medium ${
              day.isToday ? "text-primary" : "text-muted-foreground"
            }`}>
              {day.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
