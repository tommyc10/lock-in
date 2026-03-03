"use client";

import { Workout } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";

interface WorkoutHistoryProps {
  workouts: Workout[];
  onBack: () => void;
  onDelete: (id: string) => void;
}

export function WorkoutHistory({ workouts, onBack, onDelete }: WorkoutHistoryProps) {
  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">All Workouts</h2>
      </div>

      <div className="space-y-3">
        {workouts.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} onDelete={onDelete} expanded />
        ))}
      </div>
    </>
  );
}
