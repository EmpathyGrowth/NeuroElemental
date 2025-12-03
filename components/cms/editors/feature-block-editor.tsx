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

// Common Lucide icons for features
const ICON_OPTIONS = [
  { value: "star", label: "Star" },
  { value: "check", label: "Check" },
  { value: "zap", label: "Zap" },
  { value: "shield", label: "Shield" },
  { value: "heart", label: "Heart" },
  { value: "rocket", label: "Rocket" },
  { value: "lightbulb", label: "Lightbulb" },
  { value: "target", label: "Target" },
  { value: "award", label: "Award" },
  { value: "trending-up", label: "Trending Up" },
  { value: "users", label: "Users" },
  { value: "settings", label: "Settings" },
  { value: "lock", label: "Lock" },
  { value: "globe", label: "Globe" },
  { value: "clock", label: "Clock" },
];

interface FeatureBlockContent {
  icon?: string;
  title?: string;
  description?: string;
  link?: string;
  linkText?: string;
}

interface FeatureBlockEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function FeatureBlockEditor({
  content,
  onChange,
}: FeatureBlockEditorProps) {
  const typedContent = content as FeatureBlockContent;

  const updateField = (field: keyof FeatureBlockContent, value: string) => {
    onChange({ ...content, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Icon</Label>
        <Select
          value={typedContent.icon || "star"}
          onValueChange={(v) => updateField("icon", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an icon" />
          </SelectTrigger>
          <SelectContent>
            {ICON_OPTIONS.map((icon) => (
              <SelectItem key={icon.value} value={icon.value}>
                {icon.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feature-title">Title</Label>
        <Input
          id="feature-title"
          value={typedContent.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Feature title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="feature-description">Description</Label>
        <Textarea
          id="feature-description"
          value={typedContent.description || ""}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe this feature"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="feature-link">Link URL (optional)</Label>
          <Input
            id="feature-link"
            value={typedContent.link || ""}
            onChange={(e) => updateField("link", e.target.value)}
            placeholder="/learn-more"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feature-link-text">Link Text</Label>
          <Input
            id="feature-link-text"
            value={typedContent.linkText || ""}
            onChange={(e) => updateField("linkText", e.target.value)}
            placeholder="Learn more"
          />
        </div>
      </div>
    </div>
  );
}
