"use client";

import { useState } from "react";
import { Habit } from "@/lib/types";
import { saveRecovery } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface RecoveryModalProps {
  habit: Habit;
  onComplete: () => void;
  onSkip: () => void;
}

export function RecoveryModal({ habit, onComplete, onSkip }: RecoveryModalProps) {
  const [whatHappened, setWhatHappened] = useState("");
  const [howToPrevent, setHowToPrevent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    saveRecovery({
      habitId: habit.id,
      date: yesterdayStr,
      whatHappened: whatHappened.trim(),
      howToPrevent: howToPrevent.trim(),
    });

    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Let&apos;s reflect on yesterday</CardTitle>
          <CardDescription>
            You missed <span className="font-semibold text-foreground">{habit.name}</span>.
            No judgment — let&apos;s learn from it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="what-happened">What happened?</Label>
              <Textarea
                id="what-happened"
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                placeholder="I was tired after work and forgot..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="how-to-prevent">How can you prevent this next time?</Label>
              <Textarea
                id="how-to-prevent"
                value={howToPrevent}
                onChange={(e) => setHowToPrevent(e.target.value)}
                placeholder="Set a reminder, or do it earlier in the day..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!whatHappened.trim() || !howToPrevent.trim()}
              >
                Save Reflection
              </Button>
              <Button type="button" variant="ghost" onClick={onSkip}>
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface RecoveryBannerProps {
  missedCount: number;
  onReview: () => void;
}

export function RecoveryBanner({ missedCount, onReview }: RecoveryBannerProps) {
  if (missedCount === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground">
            {missedCount} habit{missedCount > 1 ? "s" : ""} missed yesterday
          </p>
          <p className="text-sm text-muted-foreground">
            Take a moment to reflect and learn from it.
          </p>
        </div>
        <Button size="sm" onClick={onReview}>
          Review
        </Button>
      </div>
    </div>
  );
}
