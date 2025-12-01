"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logging";
import { Check, Save } from "lucide-react";
import { useState } from "react";

interface SaveProfileButtonProps {
  scores: Record<string, number>;
  answers: Record<string, number>;
}

export function SaveProfileButton({ scores, answers }: SaveProfileButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/assessment/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, answers }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      logger.error(
        "Failed to save results",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={saving || saved}
      size="lg"
      variant="outline"
      className="glass-card border-primary/50"
    >
      {saved ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Saved to Profile!
        </>
      ) : (
        <>
          <Save className="w-5 h-5 mr-2" />
          {saving ? "Saving..." : "Save to Profile"}
        </>
      )}
    </Button>
  );
}
