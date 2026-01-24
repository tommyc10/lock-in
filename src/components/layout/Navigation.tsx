"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Target, Dumbbell, Moon, Sparkles, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/habits", label: "Habits", icon: Target },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/countdown", label: "Goals", icon: Clock },
  { href: "/vision", label: "Vision", icon: Sparkles },
  { href: "/reflection", label: "Reflect", icon: Moon },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-2px_12px_oklch(0_0_0/0.04)]">
      <div className="max-w-3xl mx-auto px-2">
        <div className="flex items-center justify-between py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-[60px] relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
                <div className={cn(
                  "transition-all",
                  isActive && "scale-110"
                )}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                </div>
                <span className="text-[10px] font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
