"use client";

import { Workout } from "@/lib/types";
import { computeWeeklyWorkouts } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Dumbbell, ChevronRight } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";

interface WorkoutHomeProps {
  mounted: boolean;
  history: Workout[];
  onLogWorkout: () => void;
  onViewHistory: () => void;
  onDeleteWorkout: (id: string) => void;
}

export function WorkoutHome({ mounted, history, onLogWorkout, onViewHistory, onDeleteWorkout }: WorkoutHomeProps) {
  const totalWorkouts = history.length;
  const thisWeek = computeWeeklyWorkouts();

  return (
    <>
      {/* Stats */}
      <Card className={`mb-6 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <p className="text-4xl font-bold">{thisWeek}</p>
              <p className="text-sm text-muted-foreground">This week</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{totalWorkouts}</p>
              <p className="text-sm text-muted-foreground">Total workouts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Workout Button */}
      <Card className={`mb-6 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
        <CardContent className="pt-6">
          <Button onClick={onLogWorkout} className="w-full h-14 text-lg" size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Log Workout
          </Button>
        </CardContent>
      </Card>

      {/* Recent Workouts */}
      <Card className={mounted ? "animate-fade-in animate-fade-in-delay-2" : "opacity-0"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              Recent Workouts
            </CardTitle>
            {history.length > 3 && (
              <Button variant="ghost" size="sm" onClick={onViewHistory}>
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 3).map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} onDelete={onDeleteWorkout} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No workouts logged yet</p>
              <p className="text-sm text-muted-foreground/70">Tap above to log your first workout</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
