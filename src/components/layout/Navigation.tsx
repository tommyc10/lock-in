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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50">
      <div className="max-w-3xl mx-auto px-2">
        <div className="flex items-center justify-between py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1.5 py-2 rounded-xl transition-all min-w-[48px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className="text-[9px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
