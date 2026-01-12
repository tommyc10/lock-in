"use client";

import { useState } from "react";
import { TimeOfDay, HabitFrequency, DayOfWeek } from "@/lib/types";
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

  const toggleDay = (day: DayOfWeek) => {
    setSpecificDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Habit" : "Add New Habit"}</CardTitle>
      </CardHeader>
      <CardContent>
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
        </form>
      </CardContent>
    </Card>
  );
}
