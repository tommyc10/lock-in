"use client";

import { Workout } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (id: string) => void;
  expanded?: boolean;
}

export function WorkoutCard({ workout, onDelete, expanded = false }: WorkoutCardProps) {
  const totalSets = workout.exercises.reduce((sum, e) => sum + e.sets.length, 0);
  const date = new Date(workout.date + "T00:00:00");
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="bg-muted/30">
      <CardContent className="py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <p className="font-medium">{formattedDate}</p>
              <span className="text-sm text-muted-foreground">
                {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""} · {totalSets} sets
              </span>
            </div>
            {expanded ? (
              <div className="mt-3 space-y-2">
                {workout.exercises.map((ex) => (
                  <div key={ex.id} className="text-sm">
                    <span className="font-medium">{ex.name}</span>
                    <span className="text-muted-foreground">
                      {" "}&mdash; {ex.sets.length} sets
                      {ex.sets[0]?.weight > 0 && ` @ ${ex.sets[0].weight}kg`}
                      {ex.sets[0]?.reps > 0 && ` x ${ex.sets[0].reps}`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {workout.exercises.map((e) => e.name).join(", ")}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(workout.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
