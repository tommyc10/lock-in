"use client";

import { useState } from "react";
import { Habit } from "@/lib/types";
import { isHabitCompleted, toggleCompletion, getTodayDate, getHabitStreak } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, Flame } from "lucide-react";

interface HabitItemProps {
  habit: Habit;
  onToggle?: () => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

export function HabitItem({ habit, onToggle, onEdit, onDelete }: HabitItemProps) {
  const today = getTodayDate();
  const [completed, setCompleted] = useState(isHabitCompleted(habit.id, today));
  const [animating, setAnimating] = useState(false);
  const [streak, setStreak] = useState(getHabitStreak(habit.id));

  const handleToggle = () => {
    toggleCompletion(habit.id, today);
    setCompleted(!completed);

    if (!completed) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 250);
    }

    // Update streak after toggling
    setTimeout(() => setStreak(getHabitStreak(habit.id)), 50);

    onToggle?.();
  };

  return (
    <div
      className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        completed
          ? "bg-success-bg"
          : "bg-muted/50 hover:bg-muted"
      }`}
    >
      <button
        onClick={handleToggle}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
          completed
            ? "bg-success border-success"
            : "border-muted-foreground/30 hover:border-primary hover:bg-primary/5"
        } ${animating ? "check-animation" : ""}`}
        aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </button>

      <span
        className={`flex-1 text-sm font-medium transition-all duration-200 ${
          completed ? "text-success line-through" : "text-foreground"
        }`}
      >
        {habit.name}
      </span>

      {/* Streak indicator */}
      {streak > 0 && (
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/10 mr-1">
          <Flame className="w-3 h-3 text-orange-500" />
          <span className="text-xs font-medium text-orange-500">{streak}</span>
        </div>
      )}

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onEdit(habit)}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="Edit habit"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(habit.id)}
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            aria-label="Delete habit"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
