"use client";

import { useState, useMemo } from "react";
import { getSavedExercises } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X, Save, Calendar } from "lucide-react";

type ExerciseEntry = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

interface LogWorkoutProps {
  date: string;
  onDateChange: (date: string) => void;
  exercises: ExerciseEntry[];
  currentExercise: { name: string; sets: string; reps: string; weight: string };
  onCurrentExerciseChange: (exercise: { name: string; sets: string; reps: string; weight: string }) => void;
  onAddExercise: () => void;
  onRemoveExercise: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function LogWorkout({
  date,
  onDateChange,
  exercises,
  currentExercise,
  onCurrentExerciseChange,
  onAddExercise,
  onRemoveExercise,
  onSave,
  onCancel,
}: LogWorkoutProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const savedExercises = useMemo(() => getSavedExercises(), []);
  const matchingExercise = useMemo(() => {
    if (!currentExercise.name.trim()) return null;
    return savedExercises.find(
      (e) => e.name.toLowerCase() === currentExercise.name.trim().toLowerCase()
    );
  }, [currentExercise.name, savedExercises]);

  const suggestions = useMemo(() => {
    if (!currentExercise.name.trim()) return [];
    return savedExercises
      .filter((e) => e.name.toLowerCase().includes(currentExercise.name.toLowerCase()))
      .slice(0, 5);
  }, [currentExercise.name, savedExercises]);

  const handleSelectSuggestion = (name: string) => {
    const saved = savedExercises.find((e) => e.name === name);
    onCurrentExerciseChange({
      ...currentExercise,
      name,
      weight: saved?.lastWeight?.toString() || currentExercise.weight,
      reps: saved?.lastReps?.toString() || currentExercise.reps,
    });
    setShowSuggestions(false);
  };

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
          {exercises.map((exercise) => (
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
          <div className="relative">
            <Label>Exercise Name</Label>
            <Input
              value={currentExercise.name}
              onChange={(e) => {
                onCurrentExerciseChange({ ...currentExercise, name: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="e.g., Bench Press"
            />
            {/* Autocomplete suggestions */}
            {showSuggestions && suggestions.length > 0 && currentExercise.name.trim() && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(ex.name)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between"
                  >
                    <span>{ex.name}</span>
                    {ex.lastWeight != null && (
                      <span className="text-xs text-muted-foreground">
                        {ex.lastWeight}kg x {ex.lastReps}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {/* Last time indicator */}
            {matchingExercise?.lastWeight != null && !showSuggestions && (
              <p className="text-xs text-muted-foreground mt-1">
                Last time: {matchingExercise.lastWeight}kg x {matchingExercise.lastReps} reps
              </p>
            )}
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

export type { ExerciseEntry };
