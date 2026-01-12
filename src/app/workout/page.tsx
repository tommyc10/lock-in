"use client";

import { useState, useEffect } from "react";
import { Workout } from "@/lib/types";
import {
  getWorkouts,
  saveWorkout,
  deleteWorkout,
  getTodayDate,
} from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Dumbbell,
  Trash2,
  X,
  ChevronRight,
  Save,
  Calendar,
} from "lucide-react";

type ExerciseEntry = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

type View = "home" | "log" | "history";

export default function WorkoutPage() {
  const [view, setView] = useState<View>("home");
  const [workoutHistory, setWorkoutHistory] = useState<Workout[]>([]);
  const [mounted, setMounted] = useState(false);

  // Log form state
  const [workoutDate, setWorkoutDate] = useState(getTodayDate());
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [currentExercise, setCurrentExercise] = useState({
    name: "",
    sets: "",
    reps: "",
    weight: "",
  });

  const loadData = () => {
    const workouts = getWorkouts();
    setWorkoutHistory(workouts.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  useEffect(() => {
    loadData();
    setMounted(true);
  }, []);

  const handleAddExercise = () => {
    if (
      currentExercise.name.trim() &&
      parseInt(currentExercise.sets) > 0 &&
      parseInt(currentExercise.reps) > 0
    ) {
      const newExercise: ExerciseEntry = {
        id: crypto.randomUUID(),
        name: currentExercise.name.trim(),
        sets: parseInt(currentExercise.sets),
        reps: parseInt(currentExercise.reps),
        weight: parseFloat(currentExercise.weight) || 0,
      };
      setExercises([...exercises, newExercise]);
      setCurrentExercise({ name: "", sets: "", reps: "", weight: "" });
    }
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const handleSaveWorkout = () => {
    if (exercises.length === 0) return;

    const workout: Omit<Workout, "id"> = {
      date: workoutDate,
      exercises: exercises.map((e) => ({
        id: e.id,
        name: e.name,
        sets: Array.from({ length: e.sets }, () => ({
          weight: e.weight,
          reps: e.reps,
        })),
      })),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    saveWorkout(workout);
    setExercises([]);
    setWorkoutDate(getTodayDate());
    setView("home");
    loadData();
  };

  const handleDeleteWorkout = (id: string) => {
    if (confirm("Delete this workout?")) {
      deleteWorkout(id);
      loadData();
    }
  };

  const resetForm = () => {
    setExercises([]);
    setWorkoutDate(getTodayDate());
    setCurrentExercise({ name: "", sets: "", reps: "", weight: "" });
    setView("home");
  };

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {view === "home" && (
          <WorkoutHome
            mounted={mounted}
            history={workoutHistory}
            onLogWorkout={() => setView("log")}
            onViewHistory={() => setView("history")}
            onDeleteWorkout={handleDeleteWorkout}
          />
        )}

        {view === "log" && (
          <LogWorkout
            date={workoutDate}
            onDateChange={setWorkoutDate}
            exercises={exercises}
            currentExercise={currentExercise}
            onCurrentExerciseChange={setCurrentExercise}
            onAddExercise={handleAddExercise}
            onRemoveExercise={handleRemoveExercise}
            onSave={handleSaveWorkout}
            onCancel={resetForm}
          />
        )}

        {view === "history" && (
          <WorkoutHistory
            workouts={workoutHistory}
            onBack={() => setView("home")}
            onDelete={handleDeleteWorkout}
          />
        )}
      </main>
    </div>
  );
}

function WorkoutHome({
  mounted,
  history,
  onLogWorkout,
  onViewHistory,
  onDeleteWorkout,
}: {
  mounted: boolean;
  history: Workout[];
  onLogWorkout: () => void;
  onViewHistory: () => void;
  onDeleteWorkout: (id: string) => void;
}) {
  const totalWorkouts = history.length;
  const thisWeek = history.filter((w) => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return new Date(w.date) >= monday;
  }).length;

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

function LogWorkout({
  date,
  onDateChange,
  exercises,
  currentExercise,
  onCurrentExerciseChange,
  onAddExercise,
  onRemoveExercise,
  onSave,
  onCancel,
}: {
  date: string;
  onDateChange: (date: string) => void;
  exercises: ExerciseEntry[];
  currentExercise: { name: string; sets: string; reps: string; weight: string };
  onCurrentExerciseChange: (exercise: { name: string; sets: string; reps: string; weight: string }) => void;
  onAddExercise: () => void;
  onRemoveExercise: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Log Workout</h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>

      {/* Date Picker */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Workout Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Added Exercises */}
      {exercises.length > 0 && (
        <div className="space-y-3 mb-6">
          {exercises.map((exercise, index) => (
            <Card key={exercise.id} className="bg-muted/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {exercise.sets} sets x {exercise.reps} reps
                      {exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemoveExercise(exercise.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Exercise Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add Exercise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Exercise Name</Label>
            <Input
              value={currentExercise.name}
              onChange={(e) =>
                onCurrentExerciseChange({ ...currentExercise, name: e.target.value })
              }
              placeholder="e.g., Bench Press"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Sets</Label>
              <Input
                type="number"
                value={currentExercise.sets}
                onChange={(e) =>
                  onCurrentExerciseChange({ ...currentExercise, sets: e.target.value })
                }
                placeholder="3"
              />
            </div>
            <div>
              <Label>Reps</Label>
              <Input
                type="number"
                value={currentExercise.reps}
                onChange={(e) =>
                  onCurrentExerciseChange({ ...currentExercise, reps: e.target.value })
                }
                placeholder="10"
              />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={currentExercise.weight}
                onChange={(e) =>
                  onCurrentExerciseChange({ ...currentExercise, weight: e.target.value })
                }
                placeholder="0"
              />
            </div>
          </div>

          <Button
            onClick={onAddExercise}
            disabled={
              !currentExercise.name.trim() ||
              !currentExercise.sets ||
              !currentExercise.reps
            }
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={onSave}
        disabled={exercises.length === 0}
        className="w-full h-12"
        size="lg"
      >
        <Save className="w-5 h-5 mr-2" />
        Save Workout ({exercises.length} exercise{exercises.length !== 1 ? "s" : ""})
      </Button>
    </>
  );
}

function WorkoutHistory({
  workouts,
  onBack,
  onDelete,
}: {
  workouts: Workout[];
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
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

function WorkoutCard({
  workout,
  onDelete,
  expanded = false,
}: {
  workout: Workout;
  onDelete: (id: string) => void;
  expanded?: boolean;
}) {
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
                      {" "}— {ex.sets.length} sets
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
