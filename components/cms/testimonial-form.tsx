"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { BaseFileUpload } from "@/components/forms/base-file-upload";
import { Loader2 } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type ElementType = "Electric" | "Fire" | "Water" | "Earth" | "Air" | "Metal";

export interface TestimonialFormData {
  name: string;
  role: string | null;
  quote: string;
  element: ElementType | null;
  avatar_url: string | null;
  is_published: boolean;
  is_verified: boolean;
  display_order: number;
}

export interface TestimonialFormProps {
  initialData?: Partial<TestimonialFormData>;
  onSubmit: (data: TestimonialFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const ELEMENT_OPTIONS: ElementType[] = ["Electric", "Fire", "Water", "Earth", "Air", "Metal"];

// ============================================================================
// TestimonialForm Component
// ============================================================================

export function TestimonialForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: TestimonialFormProps) {
  const [formData, setFormData] = React.useState<TestimonialFormData>({
    name: initialData?.name || "",
    role: initialData?.role || null,
    quote: initialData?.quote || "",
    element: initialData?.element || null,
    avatar_url: initialData?.avatar_url || null,
    is_published: initialData?.is_published ?? false,
    is_verified: initialData?.is_verified ?? false,
    display_order: initialData?.display_order ?? 0,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.quote.trim()) {
      setError("Quote is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof TestimonialFormData>(
    field: K,
    value: TestimonialFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={formData.role || ""}
            onChange={(e) => updateField("role", e.target.value || null)}
            placeholder="CEO at Company"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Quote *</Label>
        <RichTextEditor
          content={formData.quote}
          onChange={(html) => updateField("quote", html)}
          placeholder="Enter the testimonial quote..."
          className="min-h-[150px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Element Type</Label>
          <Select
            value={formData.element || ""}
            onValueChange={(v) => updateField("element", (v || null) as ElementType | null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select element" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {ELEMENT_OPTIONS.map((element) => (
                <SelectItem key={element} value={element}>
                  {element}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={formData.display_order}
            onChange={(e) => updateField("display_order", parseInt(e.target.value, 10) || 0)}
            min={0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Avatar</Label>
        <BaseFileUpload
          config={{
            type: "image",
            aspectRatio: "1:1",
            onUpload: (url) => updateField("avatar_url", url || null),
          }}
          value={formData.avatar_url || ""}
          category="avatars"
          placeholder="Upload avatar image"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="is_published"
            checked={formData.is_published}
            onCheckedChange={(v) => updateField("is_published", v)}
          />
          <Label htmlFor="is_published">Published</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="is_verified"
            checked={formData.is_verified}
            onCheckedChange={(v) => updateField("is_verified", v)}
          />
          <Label htmlFor="is_verified">Verified</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Testimonial" : "Create Testimonial"}
        </Button>
      </div>
    </form>
  );
}
