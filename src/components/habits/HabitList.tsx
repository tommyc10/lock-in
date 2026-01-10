"use client";

import { Habit, TimeOfDay } from "@/lib/types";
import { HabitItem } from "./HabitItem";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Sunrise, Sun, Moon, ListChecks } from "lucide-react";

interface HabitListProps {
  habits: Habit[];
  onToggle?: () => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

const TIME_CONFIG: Record<TimeOfDay, { title: string; description: string; Icon: typeof Sunrise }> = {
  morning: { title: "Morning", description: "Start your day right", Icon: Sunrise },
  afternoon: { title: "Afternoon", description: "Stay on track", Icon: Sun },
  evening: { title: "Evening", description: "Wind down well", Icon: Moon },
};

export function HabitList({ habits, onToggle, onEdit, onDelete }: HabitListProps) {
  const habitsByTime = habits.reduce(
    (acc, habit) => {
      acc[habit.timeOfDay].push(habit);
      return acc;
    },
    { morning: [], afternoon: [], evening: [] } as Record<TimeOfDay, Habit[]>
  );

  const timeOrder: TimeOfDay[] = ["morning", "afternoon", "evening"];

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <ListChecks className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No habits yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Add your first habit to start building consistency
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {timeOrder.map((timeOfDay) => {
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
