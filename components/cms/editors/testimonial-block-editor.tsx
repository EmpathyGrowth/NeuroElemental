"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { BaseFileUpload } from "@/components/forms/base-file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TestimonialBlockContent {
  quote?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  rating?: number;
}

interface TestimonialBlockEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function TestimonialBlockEditor({
  content,
  onChange,
}: TestimonialBlockEditorProps) {
  const typedContent = content as TestimonialBlockContent;

  const updateField = (
    field: keyof TestimonialBlockContent,
    value: string | number
  ) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Quote</Label>
        <RichTextEditor
          content={typedContent.quote || ""}
          onChange={(html) => updateField("quote", html)}
          placeholder="Enter the testimonial quote..."
          className="min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="testimonial-author">Author Name</Label>
          <Input
            id="testimonial-author"
            value={typedContent.authorName || ""}
            onChange={(e) => updateField("authorName", e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="testimonial-role">Author Role</Label>
          <Input
            id="testimonial-role"
            value={typedContent.authorRole || ""}
            onChange={(e) => updateField("authorRole", e.target.value)}
            placeholder="CEO at Company"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Author Avatar</Label>
          <BaseFileUpload
            config={{
              type: "image",
              aspectRatio: "1:1",
              onUpload: (url) => updateField("authorAvatar", url || ""),
            }}
            value={typedContent.authorAvatar || ""}
            category="avatars"
            placeholder="Upload avatar"
          />
        </div>

        <div className="space-y-2">
          <Label>Rating (optional)</Label>
          <Select
            value={typedContent.rating?.toString() || ""}
            onValueChange={(v) => updateField("rating", parseInt(v, 10))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No rating</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
