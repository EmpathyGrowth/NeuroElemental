"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Info, Megaphone, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "promo";
  link_text: string | null;
  link_url: string | null;
  background_color: string | null;
  text_color: string | null;
  is_dismissible: boolean;
}

const typeStyles: Record<
  string,
  { bg: string; text: string; icon: typeof Info }
> = {
  info: {
    bg: "bg-blue-500/90",
    text: "text-white",
    icon: Info,
  },
  warning: {
    bg: "bg-yellow-500/90",
    text: "text-black",
    icon: AlertCircle,
  },
  success: {
    bg: "bg-green-500/90",
    text: "text-white",
    icon: Info,
  },
  error: {
    bg: "bg-red-500/90",
    text: "text-white",
    icon: AlertCircle,
  },
  promo: {
    bg: "bg-gradient-to-r from-purple-600 to-pink-600",
    text: "text-white",
    icon: Megaphone,
  },
};

export function SiteAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  useEffect(() => {
    // Load dismissed announcements from localStorage
    const savedDismissed = localStorage.getItem("dismissedAnnouncements");
    if (savedDismissed) {
      try {
        setDismissed(new Set(JSON.parse(savedDismissed)));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, []);

  useEffect(() => {
    // Fetch announcements for current page
    fetch(`/api/announcements?page=${encodeURIComponent(pathname)}`)
      .then((res) => res.json())
      .then((data) => {
        setAnnouncements(data.announcements || []);
      })
      .catch(() => {
        // Silently fail - announcements are non-critical
      });
  }, [pathname]);

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(id);
    setDismissed(newDismissed);
    localStorage.setItem(
      "dismissedAnnouncements",
      JSON.stringify(Array.from(newDismissed))
    );
  };

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter(
    (a) => !dismissed.has(a.id)
  );

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      {visibleAnnouncements.map((announcement) => {
        const style = typeStyles[announcement.type] || typeStyles.info;
        const Icon = style.icon;

        return (
          <div
            key={announcement.id}
            className={cn(
              "relative py-2 px-4 text-center",
              announcement.background_color ? "" : style.bg,
              announcement.text_color ? "" : style.text
            )}
            style={{
              backgroundColor: announcement.background_color || undefined,
              color: announcement.text_color || undefined,
            }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm font-medium">
                <span className="font-semibold">{announcement.title}</span>
                {announcement.message && (
                  <span className="ml-1 opacity-90">
                    — {announcement.message}
                  </span>
                )}
              </p>
              {announcement.link_url && announcement.link_text && (
                <Link
                  href={announcement.link_url}
                  className="text-sm font-semibold underline underline-offset-2 hover:no-underline whitespace-nowrap"
                >
                  {announcement.link_text} →
                </Link>
              )}
              {announcement.is_dismissible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute right-2 top-1/2 -translate-y-1/2 hover:bg-white/20"
                  onClick={() => handleDismiss(announcement.id)}
                  aria-label="Dismiss announcement"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
