"use client";

import { cn } from "@/lib/utils";
import {
  FolderOpen,
  ImageIcon,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";
import { MediaPicker } from "./media-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string | null) => void;
  onPathChange?: (path: string | null) => void;
  onAltTextChange?: (altText: string | null) => void;
  category?: "courses" | "blogs" | "events" | "general";
  aspectRatio?: "square" | "video" | "banner" | "auto";
  maxSizeMB?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Show the "Browse Library" option */
  showLibrary?: boolean;
  /** Require alt text before upload (for accessibility) */
  requireAltText?: boolean;
  /** Current alt text value */
  altText?: string;
}

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  banner: "aspect-[3/1]",
  auto: "min-h-[200px]",
};

/**
 * ImageUpload - Reusable image upload component for courses, blogs, events
 * Uses the /api/upload/image endpoint
 */
export function ImageUpload({
  value,
  onChange,
  onPathChange,
  onAltTextChange,
  category = "general",
  aspectRatio = "video",
  maxSizeMB = 10,
  placeholder = "Click to upload or drag and drop",
  disabled = false,
  className,
  showLibrary = true,
  requireAltText = false,
  altText = "",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [currentPath, setCurrentPath] = React.useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = React.useState(false);
  const [showAltTextDialog, setShowAltTextDialog] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const [tempAltText, setTempAltText] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handle selection from media library
  const handleLibrarySelect = (url: string) => {
    onChange?.(url);
    onPathChange?.(null); // Library items don't have a path we manage
    setCurrentPath(null);
    setError(null);
  };

  const handleFile = async (file: File, providedAltText?: string) => {
    setError(null);

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image (JPG, PNG, GIF, WebP, or SVG)");
      return;
    }

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // If alt text is required and not provided, show dialog
    if (requireAltText && !providedAltText) {
      setPendingFile(file);
      setTempAltText("");
      setShowAltTextDialog(true);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/upload/image?category=${category}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      onChange?.(result.data.url);
      onPathChange?.(result.data.path);
      setCurrentPath(result.data.path);
      
      // Set alt text if provided
      if (providedAltText) {
        onAltTextChange?.(providedAltText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAltTextSubmit = () => {
    if (!tempAltText.trim()) {
      setError("Alt text is required for accessibility");
      return;
    }
    
    setShowAltTextDialog(false);
    if (pendingFile) {
      handleFile(pendingFile, tempAltText.trim());
      setPendingFile(null);
    }
  };

  const handleAltTextCancel = () => {
    setShowAltTextDialog(false);
    setPendingFile(null);
    setTempAltText("");
  };

  const handleDelete = async () => {
    if (!currentPath) {
      // If no path, just clear the value
      onChange?.(null);
      onPathChange?.(null);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/upload/image?path=${encodeURIComponent(currentPath)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Delete failed");
      }

      onChange?.(null);
      onPathChange?.(null);
      setCurrentPath(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors overflow-hidden",
          aspectRatioClasses[aspectRatio],
          isDragging && "border-primary bg-primary/5",
          !isDragging &&
            !value &&
            "border-muted-foreground/25 hover:border-muted-foreground/50",
          value && "border-transparent",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !value && "cursor-pointer"
        )}
        onClick={() =>
          !disabled && !value && !isUploading && inputRef.current?.click()
        }
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Image preview */}
        {value && !isUploading && (
          <>
            <img
              src={value}
              alt="Uploaded image"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                disabled={disabled}
                className="p-2 rounded-full bg-white/90 text-gray-900 hover:bg-white transition-colors"
                title="Change image"
              >
                <Upload className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={disabled}
                className="p-2 rounded-full bg-white/90 text-red-600 hover:bg-white transition-colors"
                title="Remove image"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </>
        )}

        {/* Upload placeholder */}
        {!value && !isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {placeholder}
            </p>
            <p className="text-xs text-muted-foreground/70">
              PNG, JPG, GIF, WebP or SVG up to {maxSizeMB}MB
            </p>
          </div>
        )}

        {/* Loading state */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Browse Library button */}
      {showLibrary && !disabled && (
        <button
          type="button"
          onClick={() => setShowMediaPicker(true)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          Or choose from Media Library
        </button>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        open={showMediaPicker}
        onOpenChange={setShowMediaPicker}
        onSelect={handleLibrarySelect}
        category={category}
      />

      {/* Alt Text Dialog - Requirements: 20.1 */}
      <Dialog open={showAltTextDialog} onOpenChange={(open) => !open && handleAltTextCancel()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Alt Text</DialogTitle>
            <DialogDescription>
              Alt text is required for accessibility. Describe the image for users who cannot see it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alt-text">Alt Text *</Label>
              <Input
                id="alt-text"
                value={tempAltText}
                onChange={(e) => setTempAltText(e.target.value)}
                placeholder="Describe the image..."
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Good alt text is concise and describes the image content or purpose.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleAltTextCancel}>
              Cancel
            </Button>
            <Button onClick={handleAltTextSubmit} disabled={!tempAltText.trim()}>
              Upload Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * ImageUploadCompact - Smaller inline image upload
 */
interface ImageUploadCompactProps {
  value?: string;
  onChange?: (url: string | null) => void;
  category?: "courses" | "blogs" | "events" | "general";
  size?: "sm" | "md" | "lg";
  shape?: "square" | "rounded" | "circle";
  disabled?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-24 w-24",
  lg: "h-32 w-32",
};

const shapeClasses = {
  square: "rounded-md",
  rounded: "rounded-xl",
  circle: "rounded-full",
};

export function ImageUploadCompact({
  value,
  onChange,
  category = "general",
  size = "md",
  shape = "rounded",
  disabled = false,
  className,
}: ImageUploadCompactProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) return;

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/upload/image?category=${category}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        onChange?.(result.data.url);
      }
    } catch {
      // Silently fail for compact version
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors",
        sizeClasses[size],
        shapeClasses[shape],
        value
          ? "border-transparent"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => !disabled && !isUploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value && !isUploading && (
        <img
          src={value}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {!value && !isUploading && (
        <ImageIcon className="h-6 w-6 text-muted-foreground" />
      )}

      {isUploading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
    </div>
  );
}

/**
 * MultiImageUpload - Upload multiple images
 */
interface MultiImageUploadProps {
  values?: string[];
  onChange?: (urls: string[]) => void;
  category?: "courses" | "blogs" | "events" | "general";
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

export function MultiImageUpload({
  values = [],
  onChange,
  category = "general",
  maxImages = 10,
  disabled = false,
  className,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxBytes = 10 * 1024 * 1024;

    const validFiles = Array.from(files).filter(
      (file) => allowedTypes.includes(file.type) && file.size <= maxBytes
    );

    const remainingSlots = maxImages - values.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`/api/upload/image?category=${category}`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        return response.ok ? result.data.url : null;
      });

      const urls = await Promise.all(uploadPromises);
      const successfulUrls = urls.filter((url): url is string => url !== null);

      if (successfulUrls.length > 0) {
        onChange?.([...values, ...successfulUrls]);
      }
    } catch {
      // Handle error
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange?.(newValues);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {values.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden group"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {values.length < maxImages && (
          <div
            className={cn(
              "aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors",
              "border-muted-foreground/25 hover:border-muted-foreground/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() =>
              !disabled && !isUploading && inputRef.current?.click()
            }
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={disabled || isUploading}
              className="hidden"
            />

            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Add images
                </span>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {values.length} / {maxImages} images uploaded
      </p>
    </div>
  );
}
