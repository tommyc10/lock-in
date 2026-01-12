"use client";

import { useState } from "react";
import { TimeOfDay, HabitFrequency, DayOfWeek, HABIT_TEMPLATES, HabitTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" },
];

interface HabitFormData {
  name: string;
  timeOfDay: TimeOfDay;
  frequency: HabitFrequency;
  weeklyTarget?: number;
  specificDays?: DayOfWeek[];
}

interface HabitFormProps {
  onSubmit: (data: HabitFormData) => void;
  onCancel: () => void;
  initialName?: string;
  initialTimeOfDay?: TimeOfDay;
  initialFrequency?: HabitFrequency;
  initialWeeklyTarget?: number;
  initialSpecificDays?: DayOfWeek[];
  isEditing?: boolean;
}

export function HabitForm({
  onSubmit,
  onCancel,
  initialName = "",
  initialTimeOfDay = "morning",
  initialFrequency = "daily",
  initialWeeklyTarget = 4,
  initialSpecificDays = [],
  isEditing = false,
}: HabitFormProps) {
  const [name, setName] = useState(initialName);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialTimeOfDay);
  const [frequency, setFrequency] = useState<HabitFrequency>(initialFrequency);
  const [weeklyTarget, setWeeklyTarget] = useState(initialWeeklyTarget);
  const [specificDays, setSpecificDays] = useState<DayOfWeek[]>(initialSpecificDays);
  const [showTemplates, setShowTemplates] = useState(!isEditing && !initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        timeOfDay,
        frequency,
        weeklyTarget: frequency === "weekly" ? weeklyTarget : undefined,
        specificDays: frequency === "specific_days" ? specificDays : undefined,
      });
    }
  };

  const handleTemplateSelect = (template: HabitTemplate) => {
    setName(template.name);
    setTimeOfDay(template.timeOfDay);
    setShowTemplates(false);
  };

  const toggleDay = (day: DayOfWeek) => {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const templatesByTime = HABIT_TEMPLATES.reduce(
    (acc, template) => {
      acc[template.timeOfDay].push(template);
      return acc;
    },
    { morning: [], afternoon: [], evening: [] } as Record<TimeOfDay, HabitTemplate[]>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Habit" : "Add New Habit"}</CardTitle>
      </CardHeader>
      <CardContent>
        {showTemplates && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Quick start with a template:</p>
            <div className="space-y-4">
              {(["morning", "afternoon", "evening"] as TimeOfDay[]).map((time) => (
                <div key={time}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    {time}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {templatesByTime[time].map((template) => (
                      <button
                        key={template.name}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className="px-3 py-1.5 text-sm bg-background border border-border rounded-md hover:border-primary hover:bg-secondary transition-all"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4">
              <button
                type="button"
                onClick={() => setShowTemplates(false)}
                className="text-sm text-primary hover:underline"
              >
                Or create a custom habit
              </button>
            </div>
          </div>
        )}

        {!showTemplates && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit name</Label>
              <Input
                id="habit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning workout"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Time of day</Label>
              <div className="flex gap-2">
                {(["morning", "afternoon", "evening"] as TimeOfDay[]).map((time) => (
                  <Button
                    key={time}
                    type="button"
                    variant={timeOfDay === time ? "default" : "outline"}
                    onClick={() => setTimeOfDay(time)}
                    className="flex-1"
                  >
                    {time.charAt(0).toUpperCase() + time.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={frequency === "daily" ? "default" : "outline"}
                  onClick={() => setFrequency("daily")}
                  className="flex-1"
                >
                  Daily
                </Button>
                <Button
                  type="button"
                  variant={frequency === "weekly" ? "default" : "outline"}
                  onClick={() => setFrequency("weekly")}
                  className="flex-1"
                >
                  X per week
                </Button>
                <Button
                  type="button"
                  variant={frequency === "specific_days" ? "default" : "outline"}
                  onClick={() => setFrequency("specific_days")}
                  className="flex-1"
                >
                  Specific days
                </Button>
              </div>
            </div>

            {frequency === "weekly" && (
              <div className="space-y-2">
                <Label htmlFor="weekly-target">Times per week</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <Button
                      key={num}
                      type="button"
                      variant={weeklyTarget === num ? "default" : "outline"}
                      onClick={() => setWeeklyTarget(num)}
                      className="flex-1"
                      size="sm"
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {frequency === "specific_days" && (
              <div className="space-y-2">
                <Label>Select days</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={specificDays.includes(day.value) ? "default" : "outline"}
                      onClick={() => toggleDay(day.value)}
                      size="sm"
                      className="w-12"
                    >
                      {day.short}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={
                  !name.trim() ||
                  (frequency === "specific_days" && specificDays.length === 0)
                }
              >
                {isEditing ? "Save Changes" : "Add Habit"}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={() => setShowTemplates(true)}
                className="text-sm text-primary hover:underline"
              >
                Back to templates
              </button>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
