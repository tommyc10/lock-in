"use client";

import { useState } from "react";
import { TimeOfDay, HABIT_TEMPLATES, HabitTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface HabitFormProps {
  onSubmit: (name: string, timeOfDay: TimeOfDay) => void;
  onCancel: () => void;
  initialName?: string;
  initialTimeOfDay?: TimeOfDay;
  isEditing?: boolean;
}

export function HabitForm({
  onSubmit,
  onCancel,
  initialName = "",
  initialTimeOfDay = "morning",
  isEditing = false,
}: HabitFormProps) {
  const [name, setName] = useState(initialName);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(initialTimeOfDay);
  const [showTemplates, setShowTemplates] = useState(!isEditing && !initialName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), timeOfDay);
    }
  };

  const handleTemplateSelect = (template: HabitTemplate) => {
    setName(template.name);
    setTimeOfDay(template.timeOfDay);
    setShowTemplates(false);
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

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={!name.trim()}>
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
