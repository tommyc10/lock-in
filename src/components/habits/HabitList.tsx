"use client";

import { useMemo } from "react";
import { Habit, TimeOfDay, HABIT_TEMPLATES } from "@/lib/types";
import { HabitItem } from "./HabitItem";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Sunrise, Sun, Moon, Sparkles } from "lucide-react";

interface HabitListProps {
  habits: Habit[];
  onToggle?: () => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

// Hoisted static config (rule: rendering-hoist-jsx)
const TIME_CONFIG: Record<TimeOfDay, { title: string; description: string; Icon: typeof Sunrise }> = {
  morning: { title: "Morning", description: "Start your day right", Icon: Sunrise },
  afternoon: { title: "Afternoon", description: "Stay on track", Icon: Sun },
  evening: { title: "Evening", description: "Wind down well", Icon: Moon },
};

const TIME_ORDER: TimeOfDay[] = ["morning", "afternoon", "evening"];

export function HabitList({ habits, onToggle, onEdit, onDelete }: HabitListProps) {
  // Memoize grouped habits to prevent recalculation on each render (rule: rerender-memo)
  const habitsByTime = useMemo(() => {
    const grouped: Record<TimeOfDay, Habit[]> = { morning: [], afternoon: [], evening: [] };
    for (const habit of habits) {
      grouped[habit.timeOfDay].push(habit);
    }
    return grouped;
  }, [habits]);

  if (habits.length === 0) {
    return (
      <Card className="card-premium">
        <CardContent className="py-10">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>Build Your Routine</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start with a few habits and build from there
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {HABIT_TEMPLATES.slice(0, 6).map((t) => (
                <span
                  key={t.name}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {TIME_ORDER.map((timeOfDay) => {
        const timeHabits = habitsByTime[timeOfDay];
        if (timeHabits.length === 0) return null;

        const { title, description, Icon } = TIME_CONFIG[timeOfDay];

        return (
          <Card key={timeOfDay}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="w-4 h-4 text-primary" />
                {title}
              </CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {timeHabits.map((habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
