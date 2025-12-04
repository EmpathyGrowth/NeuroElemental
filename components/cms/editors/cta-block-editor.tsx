"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseFileUpload } from "@/components/forms/base-file-upload";

interface CTABlockContent {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonVariant?: "primary" | "secondary" | "outline";
  backgroundImage?: string;
}

interface CTABlockEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function CTABlockEditor({ content, onChange }: CTABlockEditorProps) {
  const typedContent = content as CTABlockContent;

  const updateField = (field: keyof CTABlockContent, value: string) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cta-title">Title</Label>
        <Input
          id="cta-title"
          value={typedContent.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Call to action title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cta-description">Description</Label>
        <Textarea
          id="cta-description"
          value={typedContent.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Supporting text for the CTA"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cta-button-text">Button Text</Label>
          <Input
            id="cta-button-text"
            value={typedContent.buttonText || ""}
            onChange={(e) => updateField("buttonText", e.target.value)}
            placeholder="Get Started"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cta-button-url">Button URL</Label>
          <Input
            id="cta-button-url"
            value={typedContent.buttonUrl || ""}
            onChange={(e) => updateField("buttonUrl", e.target.value)}
            placeholder="/signup"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Button Style</Label>
        <Select
          value={typedContent.buttonVariant || "primary"}
          onValueChange={(v) => updateField("buttonVariant", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="secondary">Secondary</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Background Image (optional)</Label>
        <BaseFileUpload
          config={{
            type: "image",
            aspectRatio: "16:9",
            onUpload: (url) => updateField("backgroundImage", url || ""),
          }}
          value={typedContent.backgroundImage || ""}
          category="general"
          placeholder="Upload background image"
        />
      </div>
    </div>
  );
}
