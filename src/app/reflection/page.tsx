"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Priority, Reflection } from "@/lib/types";
import {
  getTodayDate,
  getPriorities,
  savePriority,
  updatePriority,
  deletePriority,
  getReflections,
  saveReflection,
} from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X, Check, Target, Moon, Trophy, Lightbulb, Rocket } from "lucide-react";

export default function ReflectionPage() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState("");
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [mounted, setMounted] = useState(false);

  const today = getTodayDate();

  const loadData = useCallback(() => {
    setPriorities(getPriorities(today));
    setReflections(getReflections(today));
  }, [today]);

  useEffect(() => {
    loadData();
    setMounted(true);
  }, [loadData]);

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPriority.trim()) {
      savePriority({
        date: today,
        content: newPriority.trim(),
        completed: false,
        order: priorities.length,
      });
      setNewPriority("");
      loadData();
    }
  };

  const handleTogglePriority = (id: string, completed: boolean) => {
    updatePriority(id, { completed: !completed });
    loadData();
  };

  const handleDeletePriority = (id: string) => {
    deletePriority(id);
    loadData();
  };

  const handleSaveReflection = (type: Reflection["type"], content: string) => {
    if (content.trim()) {
      saveReflection({ date: today, type, content: content.trim() });
      loadData();
    }
  };

  const getReflectionContent = (type: Reflection["type"]) => {
    return reflections.find((r) => r.type === type)?.content || "";
  };

  const completedCount = priorities.filter((p) => p.completed).length;

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Priorities Section */}
        <Card className={`mb-6 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Today&apos;s Priorities
                </CardTitle>
                <CardDescription>Focus on what matters most</CardDescription>
              </div>
              {priorities.length > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold tracking-tight">
                    {completedCount}/{priorities.length}
                  </p>
                  <p className="text-xs text-muted-foreground">completed</p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddPriority} className="flex gap-2 mb-4">
              <Input
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                placeholder="What's important today?"
                className="flex-1"
              />
              <Button type="submit" disabled={!newPriority.trim()} size="default">
                <Plus className="w-4 h-4" />
                <span className="sr-only sm:not-sr-only sm:ml-1">Add</span>
              </Button>
            </form>

            {priorities.length > 0 ? (
              <ul className="space-y-2">
                {priorities.map((priority, index) => (
                  <li
                    key={priority.id}
                    className={`group flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors ${
                      mounted ? "animate-fade-in" : "opacity-0"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
                      onClick={() => handleTogglePriority(priority.id, priority.completed)}
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        priority.completed
                          ? "bg-success border-success"
                          : "border-muted-foreground/30 hover:border-primary"
                      }`}
                    >
                      {priority.completed && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${priority.completed ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {priority.content}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeletePriority(priority.id)}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive h-7 w-7"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">No priorities yet</p>
                <p className="text-xs text-muted-foreground/70">Add your top focuses for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evening Reflection Section */}
        <Card className={`${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              Evening Reflection
            </CardTitle>
            <CardDescription>Take a moment to reflect on your day</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReflectionInput
              label="What went well today?"
              placeholder="I completed my workout and ate healthy..."
              value={getReflectionContent("wins")}
              onSave={(content) => handleSaveReflection("wins", content)}
              icon={<Trophy className="w-4 h-4 text-amber-500" />}
            />
            <ReflectionInput
              label="What was challenging? What did you learn?"
              placeholder="I struggled with focus, but learned that..."
              value={getReflectionContent("struggles")}
              onSave={(content) => handleSaveReflection("struggles", content)}
              icon={<Lightbulb className="w-4 h-4 text-blue-500" />}
            />
            <ReflectionInput
              label="What's your #1 priority for tomorrow?"
              placeholder="Complete the project presentation..."
              value={getReflectionContent("tomorrow")}
              onSave={(content) => handleSaveReflection("tomorrow", content)}
              icon={<Rocket className="w-4 h-4 text-primary" />}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function ReflectionInput({
  label,
  placeholder,
  value,
  onSave,
  icon,
}: {
  label: string;
  placeholder: string;
  value: string;
  onSave: (content: string) => void;
  icon?: React.ReactNode;
}) {
  const [content, setContent] = useState(value);
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setContent(value);
  }, [value]);

  // Auto-save with debounce
  const handleChange = (newContent: string) => {
    setContent(newContent);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newContent.trim() && newContent !== value) {
      timeoutRef.current = setTimeout(() => {
        setSaving(true);
        onSave(newContent);
        setTimeout(() => setSaving(false), 1000);
      }, 1000);
    }
  };

  const inputId = label.toLowerCase().replace(/[^a-z0-9]/g, "-");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={inputId} className="text-sm font-medium flex items-center gap-2">
          {icon}
          {label}
        </Label>
        {saving && (
          <span className="text-xs text-muted-foreground animate-pulse">Saving...</span>
        )}
      </div>
      <Textarea
        id={inputId}
        placeholder={placeholder}
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        rows={2}
        className="resize-none"
      />
    </div>
  );
}
