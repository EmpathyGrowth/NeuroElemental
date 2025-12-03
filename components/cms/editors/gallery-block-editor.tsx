"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BaseFileUpload } from "@/components/forms/base-file-upload";
import { Plus, Trash2, GripVertical } from "lucide-react";
import Image from "next/image";

interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

interface GalleryBlockContent {
  images?: GalleryImage[];
  columns?: 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
}

interface GalleryBlockEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function GalleryBlockEditor({
  content,
  onChange,
}: GalleryBlockEditorProps) {
  const typedContent = content as GalleryBlockContent;
  const images = typedContent.images || [];

  const addImage = () => {
    const newImages = [...images, { url: "", alt: "", caption: "" }];
    onChange({ ...content, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange({ ...content, images: newImages });
  };

  const updateImage = (
    index: number,
    field: keyof GalleryImage,
    value: string
  ) => {
    const newImages = images.map((img, i) =>
      i === index ? { ...img, [field]: value } : img
    );
    onChange({ ...content, images: newImages });
  };

  const updateLayout = (field: "columns" | "gap", value: string) => {
    onChange({ ...content, [field]: field === "columns" ? parseInt(value, 10) : value });
  };

  return (
    <div className="space-y-4">
      {/* Layout Options */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Columns</Label>
          <Select
            value={typedContent.columns?.toString() || "3"}
            onValueChange={(v) => updateLayout("columns", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Gap Size</Label>
          <Select
            value={typedContent.gap || "md"}
            onValueChange={(v) => updateLayout("gap", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Images */}
      <div className="flex items-center justify-between">
        <Label>Images</Label>
        <Button type="button" variant="outline" size="sm" onClick={addImage}>
          <Plus className="h-4 w-4 mr-1" /> Add Image
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-8 border rounded-lg border-dashed">
          No images added. Click "Add Image" to create a gallery.
        </div>
      ) : (
        <div className="space-y-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex gap-3 p-3 border rounded-lg bg-muted/20"
            >
              <div className="flex items-center">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Image Preview */}
              <div className="w-20 h-20 relative bg-muted rounded overflow-hidden flex-shrink-0">
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={image.alt || "Gallery image"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              {/* Image Fields */}
              <div className="flex-1 space-y-2">
                <BaseFileUpload
                  config={{
                    type: "image",
                    onUpload: (url) => updateImage(index, "url", url || ""),
                  }}
                  value={image.url}
                  category="gallery"
                  placeholder="Upload image"
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={image.alt}
                    onChange={(e) => updateImage(index, "alt", e.target.value)}
                    placeholder="Alt text (required)"
                    className="text-sm"
                  />
                  <Input
                    value={image.caption || ""}
                    onChange={(e) =>
                      updateImage(index, "caption", e.target.value)
                    }
                    placeholder="Caption (optional)"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeImage(index)}
                className="h-8 w-8 p-0 text-destructive flex-shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
