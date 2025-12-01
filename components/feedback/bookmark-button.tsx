"use client";

import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logging";
import { Bookmark, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  lessonId: string;
  isBookmarked?: boolean;
  onToggle?: (isBookmarked: boolean) => void;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

export function BookmarkButton({
  lessonId,
  isBookmarked: initialBookmarked = false,
  onToggle,
  className = "",
  variant = "ghost",
  size = "icon",
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(
          `/api/users/me/bookmarks?lesson_id=${lessonId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setIsBookmarked(false);
          onToggle?.(false);
          toast.success("Bookmark removed");
        } else {
          toast.error("Failed to remove bookmark");
        }
      } else {
        // Add bookmark
        const response = await fetch("/api/users/me/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lesson_id: lessonId }),
        });

        if (response.ok) {
          setIsBookmarked(true);
          onToggle?.(true);
          toast.success("Lesson bookmarked");
        } else {
          toast.error("Failed to bookmark lesson");
        }
      }
    } catch (error) {
      logger.error(
        "Failed to toggle bookmark",
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={className}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this lesson"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark
          className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`}
        />
      )}
    </Button>
  );
}
