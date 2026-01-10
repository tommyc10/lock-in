"use client";

import { useState, useEffect, useRef } from "react";
import { CountdownEvent, EVENT_CATEGORIES, VISION_CATEGORIES, VisionCategory } from "@/lib/types";
import {
  getUpcomingEvents,
  getCountdownEvents,
  saveCountdownEvent,
  deleteCountdownEvent,
  getDaysUntil,
  getTodayDate,
} from "@/lib/storage";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Calendar,
  Trash2,
  X,
  Clock,
  Target,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

type ImageMode = "url" | "upload" | null;

export default function CountdownPage() {
  const [events, setEvents] = useState<CountdownEvent[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<CountdownEvent["category"]>("social");
  const [note, setNote] = useState("");
  const [focusAreas, setFocusAreas] = useState<VisionCategory[]>([]);
  const [imageMode, setImageMode] = useState<ImageMode>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    setEvents(getCountdownEvents());
  };

  useEffect(() => {
    loadData();
    setMounted(true);
  }, []);

  const upcomingEvents = events.filter((e) => e.date >= getTodayDate());
  const pastEvents = events.filter((e) => e.date < getTodayDate());

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageData(event.target?.result as string);
        setImageMode(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvent = () => {
    if (name.trim() && date) {
      saveCountdownEvent({
        name: name.trim(),
        date,
        category,
        note: note.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageData: imageData || undefined,
        focusAreas,
      });
      resetForm();
      loadData();
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this event?")) {
      deleteCountdownEvent(id);
      loadData();
    }
  };

  const resetForm = () => {
    setName("");
    setDate("");
    setCategory("social");
    setNote("");
    setFocusAreas([]);
    setImageUrl("");
    setImageData(null);
    setImageMode(null);
    setShowAddForm(false);
  };

  const toggleFocusArea = (area: VisionCategory) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter((a) => a !== area));
    } else {
      setFocusAreas([...focusAreas, area]);
    }
  };

  const getCategoryEmoji = (cat: CountdownEvent["category"]) => {
    return EVENT_CATEGORIES.find((c) => c.value === cat)?.emoji || "📅";
  };

  const currentImage = imageData || (imageUrl.trim() ? imageUrl : null);

  return (
    <div className="min-h-screen pb-24">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className={`mb-6 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Goals</h2>
          </div>
          <p className="text-muted-foreground">Events to lock in for</p>
        </div>

        {/* Add Event Button / Form */}
        {!showAddForm ? (
          <Card className={`mb-6 ${mounted ? "animate-fade-in animate-fade-in-delay-1" : "opacity-0"}`}>
            <CardContent className="pt-6">
              <Button onClick={() => setShowAddForm(true)} className="w-full h-12">
                <Plus className="w-5 h-5 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">New Event</CardTitle>
                <Button variant="ghost" size="icon-sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Section */}
              <div>
                <Label>Cover Image (optional)</Label>
                {currentImage ? (
                  <div className="relative mt-2 rounded-xl overflow-hidden aspect-video bg-muted">
                    <img
                      src={currentImage}
                      alt="Event cover"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setImageUrl("");
                        setImageData(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : imageMode === null ? (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setImageMode("url")}
                      className="h-16 flex flex-col gap-1"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-xs">Paste URL</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setImageMode("upload")}
                      className="h-16 flex flex-col gap-1"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-xs">Upload</span>
                    </Button>
                  </div>
                ) : imageMode === "url" ? (
                  <div className="mt-2 space-y-2">
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setImageMode(null)}
                        disabled={!imageUrl.trim()}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setImageMode(null);
                          setImageUrl("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-20 border-dashed"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">Click to select image</span>
                      </div>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setImageMode(null)}
                      className="mt-2"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <Label>Event Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Beach vacation, Wedding, Competition..."
                />
              </div>

              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={getTodayDate()}
                />
              </div>

              <div>
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {EVENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        category === cat.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Focus Areas (what to work on)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {VISION_CATEGORIES.map((area) => (
                    <button
                      key={area.value}
                      type="button"
                      onClick={() => toggleFocusArea(area.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                        focusAreas.includes(area.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {area.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Note (optional)</Label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's the goal for this event?"
                />
              </div>

              <Button
                onClick={handleAddEvent}
                disabled={!name.trim() || !date}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events - Card Grid */}
        <div className={mounted ? "animate-fade-in animate-fade-in-delay-2" : "opacity-0"}>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-4">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="py-12">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-1">No upcoming events</p>
                  <p className="text-sm text-muted-foreground/70">
                    Add an event to start your countdown
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Past Events</h3>
            <div className="space-y-2 opacity-60">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span>{getCategoryEmoji(event.category)}</span>
                    <span className="text-sm line-through">{event.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(event.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function EventCard({
  event,
  onDelete,
}: {
  event: CountdownEvent;
  onDelete: (id: string) => void;
}) {
  const daysUntil = getDaysUntil(event.date);
  const categoryEmoji = EVENT_CATEGORIES.find((c) => c.value === event.category)?.emoji || "📅";
  const hasImage = event.imageUrl || event.imageData;

  const eventDate = new Date(event.date + "T00:00:00");
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: eventDate.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });

  return (
    <Card className="overflow-hidden">
      {/* Image Header */}
      {hasImage && (
        <div className="relative aspect-video bg-muted">
          <img
            src={event.imageUrl || event.imageData}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          {/* Days Overlay */}
          <div className="absolute top-3 left-3 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-sm">
            <div className="text-center">
              <span className="text-2xl font-bold text-white">{daysUntil}</span>
              <span className="text-[10px] text-white/80 font-medium ml-1">
                {daysUntil === 1 ? "DAY" : "DAYS"}
              </span>
            </div>
          </div>
          {/* Delete Button */}
          <button
            onClick={() => onDelete(event.id)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <CardContent className={hasImage ? "pt-4" : "py-5"}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* No image - show days counter inline */}
            {!hasImage && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-primary">{daysUntil}</span>
                  <span className="text-[9px] text-primary font-medium">
                    {daysUntil === 1 ? "DAY" : "DAYS"}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{categoryEmoji}</span>
                    <h3 className="font-semibold">{event.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{formattedDate}</p>
                </div>
              </div>
            )}

            {/* With image - title below */}
            {hasImage && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{categoryEmoji}</span>
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>
            )}

            {/* Focus Areas */}
            {event.focusAreas.length > 0 && (
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="flex gap-1 flex-wrap">
                  {event.focusAreas.map((area) => (
                    <span
                      key={area}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                    >
                      {VISION_CATEGORIES.find((c) => c.value === area)?.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Note */}
            {event.note && (
              <p className="text-sm text-muted-foreground italic">
                "{event.note}"
              </p>
            )}
          </div>

          {/* Delete button for no-image cards */}
          {!hasImage && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(event.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Motivational Message */}
        {daysUntil <= 30 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <p className="text-sm text-center text-muted-foreground">
              {daysUntil <= 7
                ? "Final week - Give it everything!"
                : daysUntil <= 14
                ? "Two weeks out - Stay locked in!"
                : "One month to go - Every day counts!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
