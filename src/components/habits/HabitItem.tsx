"use client";

import { useState } from "react";
import { Habit } from "@/lib/types";
import { isHabitCompleted, toggleCompletion, getTodayDate, isHabitDueOnDate, getWeeklyCompletionCount } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Check, Calendar, Repeat } from "lucide-react";

interface HabitItemProps {
  habit: Habit;
  onToggle?: () => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string) => void;
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getFrequencyLabel(habit: Habit): string | null {
  if (!habit.frequency || habit.frequency === "daily") return null;

  if (habit.frequency === "weekly" && habit.weeklyTarget) {
    return `${habit.weeklyTarget}x/week`;
  }

  if (habit.frequency === "specific_days" && habit.specificDays) {
    const days = habit.specificDays.sort((a, b) => {
      // Sort Mon-Sun (1,2,3,4,5,6,0)
      const order = [1, 2, 3, 4, 5, 6, 0];
      return order.indexOf(a) - order.indexOf(b);
    });
    return days.map((d) => DAYS_SHORT[d]).join(", ");
  }

  return null;
}

export function HabitItem({ habit, onToggle, onEdit, onDelete }: HabitItemProps) {
  const today = getTodayDate();
  const isDueToday = isHabitDueOnDate(habit, today);
  const [completed, setCompleted] = useState(isHabitCompleted(habit.id, today));
  const [animating, setAnimating] = useState(false);

  // For weekly habits, get progress
  const weeklyProgress = habit.frequency === "weekly" && habit.weeklyTarget
    ? getWeeklyCompletionCount(habit.id, today)
    : null;

  const handleToggle = () => {
    toggleCompletion(habit.id, today);
    setCompleted(!completed);

    if (!completed) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 250);
    }

    onToggle?.();
  };

  const frequencyLabel = getFrequencyLabel(habit);

  // Determine styling based on due status
  const isNotDue = !isDueToday && habit.frequency === "specific_days";
  const isWeeklyComplete = habit.frequency === "weekly" && weeklyProgress !== null && habit.weeklyTarget && weeklyProgress >= habit.weeklyTarget;

  return (
    <div
      className={`content-auto group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        completed
          ? "bg-success-bg"
          : isNotDue || isWeeklyComplete
          ? "bg-muted/30 opacity-60"
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

      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium transition-all duration-200 block ${
            completed ? "text-success line-through" : "text-foreground"
          }`}
        >
          {habit.name}
        </span>
        {frequencyLabel && (
          <div className="flex items-center gap-1 mt-0.5">
            {habit.frequency === "weekly" ? (
              <Repeat className="w-3 h-3 text-muted-foreground" />
            ) : (
              <Calendar className="w-3 h-3 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {frequencyLabel}
              {habit.frequency === "weekly" && weeklyProgress !== null && (
                <span className={weeklyProgress >= (habit.weeklyTarget || 0) ? "text-success" : ""}>
                  {" "}({weeklyProgress}/{habit.weeklyTarget})
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Not due indicator */}
      {isNotDue && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Rest day
        </span>
      )}

      {/* Weekly complete indicator */}
      {isWeeklyComplete && !completed && (
        <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
          Done this week
        </span>
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
