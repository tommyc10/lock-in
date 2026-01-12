"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "./button";

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  minDate?: string;
  placeholder?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DatePicker({ value, onChange, minDate, placeholder = "Select date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value + "T00:00:00");
    if (minDate) return new Date(minDate + "T00:00:00");
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const selectDate = (day: number) => {
    const selected = new Date(year, month, day);
    const dateStr = selected.toISOString().split("T")[0];
    onChange(dateStr);
    setIsOpen(false);
  };

  const isDateDisabled = (day: number) => {
    if (!minDate) return false;
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return dateStr < minDate;
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const dateStr = new Date(year, month, day).toISOString().split("T")[0];
    return dateStr === value;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Format display value
  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : placeholder;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-background text-left transition-colors hover:bg-muted/50 ${
          !value ? "text-muted-foreground" : "text-foreground"
        }`}
      >
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="flex-1">{displayValue}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[280px] p-4 rounded-xl border border-border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={prevMonth}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold">
              {MONTHS[month]} {year}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={nextMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const disabled = isDateDisabled(day);
              const selected = isSelected(day);
              const today = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !disabled && selectDate(day)}
                  disabled={disabled}
                  className={`
                    w-9 h-9 rounded-lg text-sm font-medium transition-all
                    ${disabled
                      ? "text-muted-foreground/30 cursor-not-allowed"
                      : selected
                      ? "bg-primary text-primary-foreground"
                      : today
                      ? "bg-muted text-foreground"
                      : "text-foreground hover:bg-muted"
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
