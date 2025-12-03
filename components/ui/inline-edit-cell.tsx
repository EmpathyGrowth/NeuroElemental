"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Pencil, Check, X, Loader2 } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export interface InlineEditCellProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  onError?: (error: Error) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  maxLength?: number;
  validate?: (value: string) => string | null; // Returns error message or null
}

// ============================================================================
// InlineEditCell Component
// ============================================================================

export function InlineEditCell({
  value,
  onSave,
  onError,
  placeholder = "Click to edit",
  className,
  inputClassName,
  disabled = false,
  maxLength,
  validate,
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync with external value changes
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value);
    setError(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue(value);
    setError(null);
  };

  const saveValue = async () => {
    // Skip if value unchanged
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    // Validate if validator provided
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message);
      setEditValue(value); // Rollback to original value
      onError?.(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveValue();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditing();
    }
  };

  const handleBlur = () => {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (isEditing && !isSaving) {
        saveValue();
      }
    }, 150);
  };

  if (isEditing) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={isSaving}
          maxLength={maxLength}
          className={cn(
            "h-8 text-sm",
            error && "border-destructive",
            inputClassName
          )}
          aria-invalid={!!error}
          aria-describedby={error ? "inline-edit-error" : undefined}
        />
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <button
              type="button"
              onClick={saveValue}
              className="p-1 rounded hover:bg-muted/50 text-green-600"
              aria-label="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="p-1 rounded hover:bg-muted/50 text-destructive"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        )}
        {error && (
          <span
            id="inline-edit-error"
            className="text-xs text-destructive ml-1"
          >
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 cursor-pointer rounded px-2 py-1 -mx-2 -my-1",
        "hover:bg-muted/50 transition-colors",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onClick={startEditing}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startEditing();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Edit ${value || placeholder}`}
    >
      <span className={cn("flex-1", !value && "text-muted-foreground")}>
        {value || placeholder}
      </span>
      <Pencil
        className={cn(
          "h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity",
          disabled && "hidden"
        )}
      />
    </div>
  );
}

// ============================================================================
// Utility: Create inline edit handler for API calls
// ============================================================================

export function createInlineEditHandler<T extends Record<string, unknown>>(
  apiEndpoint: string,
  field: keyof T,
  onSuccess?: () => void
): (newValue: string) => Promise<void> {
  return async (newValue: string) => {
    const response = await fetch(apiEndpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: newValue }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Failed to save");
    }

    onSuccess?.();
  };
}
