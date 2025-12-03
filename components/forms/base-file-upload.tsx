"use client";

import { cn } from "@/lib/utils";
import {
  AlertCircle,
  Camera,
  ImageIcon,
  Loader2,
  RefreshCw,
  RotateCw,
  Trash2,
  Upload,
  X,
  ZoomIn,
} from "lucide-react";
import * as React from "react";
import { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

/**
 * Supported upload types
 */
export type UploadType = "avatar" | "image" | "document";

/**
 * Aspect ratio options
 */
export type AspectRatio = "1:1" | "16:9" | "4:3" | "free";

/**
 * Configuration for BaseFileUpload
 */
export interface FileUploadConfig {
  /** Type of upload (avatar, image, document) */
  type: UploadType;
  /** Aspect ratio for cropping (avatar always uses 1:1) */
  aspectRatio?: AspectRatio;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Accepted file types */
  acceptedTypes?: string[];
  /** Callback when upload succeeds */
  onUpload: (url: string) => void;
  /** Callback when upload fails */
  onError?: (error: string) => void;
}

/**
 * Props for BaseFileUpload component
 */
export interface BaseFileUploadProps {
  /** Upload configuration */
  config: FileUploadConfig;
  /** Current file URL (for preview) */
  value?: string | null;
  /** Category for storage organization */
  category?: "courses" | "blogs" | "events" | "general" | "avatars";
  /** User ID (required for avatar uploads) */
  userId?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
}


/**
 * Default configurations per upload type
 */
const DEFAULT_CONFIGS: Record<UploadType, Partial<FileUploadConfig>> = {
  avatar: {
    aspectRatio: "1:1",
    maxSizeMB: 2,
    acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },
  image: {
    aspectRatio: "free",
    maxSizeMB: 10,
    acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  },
  document: {
    aspectRatio: "free",
    maxSizeMB: 25,
    acceptedTypes: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  },
};

/**
 * Aspect ratio CSS classes
 */
const aspectRatioClasses: Record<AspectRatio, string> = {
  "1:1": "aspect-square",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  free: "min-h-[200px]",
};

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validate file before upload
 * Returns error message if invalid, null if valid
 */
export function validateFile(
  file: File,
  maxSizeMB: number,
  acceptedTypes: string[]
): string | null {
  // Check file type
  if (!acceptedTypes.includes(file.type)) {
    const typeNames = acceptedTypes
      .map((t) => t.split("/")[1]?.toUpperCase())
      .filter(Boolean)
      .join(", ");
    return `Invalid file type. Accepted: ${typeNames}`;
  }

  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File too large. Maximum size: ${maxSizeMB}MB. Your file: ${formatFileSize(file.size)}`;
  }

  return null;
}

/**
 * Creates a cropped image from a source image and crop area
 */
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Set canvas size to match the bounding box
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Translate canvas context to center
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Draw rotated image
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  // Get image data from rotated canvas
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas size to final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paste cropped image
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Return as blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.95
    );
  });
}

/**
 * Creates an HTMLImageElement from a source URL
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}


/**
 * BaseFileUpload - Unified file upload component
 *
 * Features:
 * - Supports avatar, image, and document uploads
 * - Configurable aspect ratios and file size limits
 * - Drag and drop support
 * - Circular cropping for avatars with zoom and rotation
 * - Error handling with toast notifications
 * - Retry functionality on failure
 *
 * @example
 * ```tsx
 * // Avatar upload
 * <BaseFileUpload
 *   config={{
 *     type: "avatar",
 *     onUpload: (url) => setAvatarUrl(url),
 *     onError: (error) => console.error(error),
 *   }}
 *   value={avatarUrl}
 *   userId={user.id}
 * />
 *
 * // Image upload
 * <BaseFileUpload
 *   config={{
 *     type: "image",
 *     aspectRatio: "16:9",
 *     maxSizeMB: 5,
 *     onUpload: (url) => setCoverImage(url),
 *   }}
 *   value={coverImage}
 *   category="courses"
 * />
 * ```
 */
export function BaseFileUpload({
  config,
  value,
  category = "general",
  userId,
  placeholder,
  disabled = false,
  className,
}: BaseFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Cropping state (for avatar mode)
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Merge config with defaults
  const defaults = DEFAULT_CONFIGS[config.type];
  const maxSizeMB = config.maxSizeMB ?? defaults.maxSizeMB ?? 10;
  const acceptedTypes = config.acceptedTypes ?? defaults.acceptedTypes ?? [];
  const aspectRatio = config.type === "avatar" ? "1:1" : (config.aspectRatio ?? defaults.aspectRatio ?? "free");

  // Determine placeholder text
  const placeholderText =
    placeholder ??
    (config.type === "avatar"
      ? "Click to upload photo"
      : "Click to upload or drag and drop");

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handle file selection for avatar (opens crop dialog)
  const handleAvatarFileSelect = (file: File) => {
    setError(null);
    setLastFile(file);

    // Validate file
    const validationError = validateFile(file, maxSizeMB, acceptedTypes);
    if (validationError) {
      setError(validationError);
      config.onError?.(validationError);
      toast.error(validationError);
      return;
    }

    // Store original file and open crop dialog
    const objectUrl = URL.createObjectURL(file);
    setImageToCrop(objectUrl);
    setOriginalFile(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCropDialogOpen(true);
  };

  const handleCropCancel = () => {
    setCropDialogOpen(false);
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
    setImageToCrop(null);
    setOriginalFile(null);
    setCroppedAreaPixels(null);
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels || !originalFile) return;

    setCropDialogOpen(false);
    setIsUploading(true);

    try {
      // Get cropped image blob
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels, rotation);

      if (!croppedBlob) {
        throw new Error("Failed to crop image");
      }

      // Create a new file from the cropped blob
      const croppedFile = new File(
        [croppedBlob],
        originalFile.name.replace(/\.[^.]+$/, ".jpg"),
        { type: "image/jpeg" }
      );

      // Upload the cropped file
      const formData = new FormData();
      formData.append("file", croppedFile);

      const endpoint = `/api/upload/avatar?userId=${userId}`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      const uploadedUrl = result.data?.url || result.url;
      config.onUpload(uploadedUrl);
      toast.success("Upload successful!");
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setError(errorMsg);
      config.onError?.(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
      }
      setImageToCrop(null);
      setOriginalFile(null);
      setCroppedAreaPixels(null);
    }
  };


  // Handle file selection for image/document (direct upload)
  const handleFile = async (file: File) => {
    setError(null);
    setLastFile(file);

    // Validate file
    const validationError = validateFile(file, maxSizeMB, acceptedTypes);
    if (validationError) {
      setError(validationError);
      config.onError?.(validationError);
      toast.error(validationError);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Determine upload endpoint based on type
      const endpoint =
        config.type === "avatar"
          ? `/api/upload/avatar?userId=${userId}`
          : `/api/upload/image?category=${category}`;

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      const uploadedUrl = result.data?.url || result.url;
      config.onUpload(uploadedUrl);
      toast.success("Upload successful!");
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setError(errorMsg);
      config.onError?.(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle retry
  const handleRetry = () => {
    if (lastFile) {
      if (config.type === "avatar") {
        handleAvatarFileSelect(lastFile);
      } else {
        handleFile(lastFile);
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!value) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Clear the value - actual file deletion would be handled by the parent
      config.onUpload("");
      toast.success("File removed");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Delete failed";
      setError(errorMsg);
      config.onError?.(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (config.type === "avatar") {
        handleAvatarFileSelect(file);
      } else {
        handleFile(file);
      }
    }
    // Reset input
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Handle drag events
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (config.type === "avatar") {
        handleAvatarFileSelect(file);
      } else {
        handleFile(file);
      }
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


  // Render avatar mode
  if (config.type === "avatar") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-4">
          {/* Avatar preview */}
          <div
            className={cn(
              "relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed transition-colors cursor-pointer group",
              isDragging && "border-primary bg-primary/5",
              !isDragging && !value && "border-muted-foreground/25 hover:border-muted-foreground/50",
              value && "border-transparent",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && !isUploading && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={inputRef}
              type="file"
              accept={acceptedTypes.join(",")}
              onChange={handleInputChange}
              disabled={disabled || isUploading}
              className="hidden"
              aria-label="Upload avatar"
            />

            {value && !isUploading && (
              <>
                <img
                  src={value}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
              </>
            )}

            {!value && !isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || isUploading || isDeleting}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
              )}
              {isUploading ? "Uploading..." : "Upload Photo"}
            </Button>

            {value && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
                disabled={disabled || isUploading || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                )}
                {isDeleting ? "Removing..." : "Remove Photo"}
              </Button>
            )}
          </div>
        </div>

        {/* Error with retry */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
            {lastFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="h-auto p-1 text-destructive hover:text-destructive"
              >
                <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
                Retry
              </Button>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Accepted: {acceptedTypes.map((t) => t.split("/")[1]?.toUpperCase()).join(", ")}. Max: {maxSizeMB}MB
        </p>

        {/* Crop Dialog */}
        <Dialog open={cropDialogOpen} onOpenChange={(open) => !open && handleCropCancel()}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crop Your Photo</DialogTitle>
              <DialogDescription>
                Drag to reposition. Use the slider to zoom in or out.
              </DialogDescription>
            </DialogHeader>

            <div className="relative w-full h-[300px] bg-muted rounded-lg overflow-hidden">
              {imageToCrop && (
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  minZoom={0.1}
                  maxZoom={3}
                  objectFit="contain"
                  restrictPosition={false}
                  zoomSpeed={0.1}
                />
              )}
            </div>

            <div className="space-y-4">
              {/* Zoom Control */}
              <div className="flex items-center gap-4">
                <ZoomIn className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Slider
                  value={[zoom]}
                  min={0.1}
                  max={3}
                  step={0.05}
                  onValueChange={(value) => setZoom(value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12">{Math.round(zoom * 100)}%</span>
              </div>

              {/* Rotation Control */}
              <div className="flex items-center gap-4">
                <RotateCw className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Slider
                  value={[rotation]}
                  min={0}
                  max={360}
                  step={1}
                  onValueChange={(value) => setRotation(value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12">{rotation}°</span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCropCancel}>
                Cancel
              </Button>
              <Button onClick={handleCropConfirm}>
                Apply & Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }


  // Render image/document mode
  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-colors overflow-hidden",
          aspectRatioClasses[aspectRatio],
          isDragging && "border-primary bg-primary/5",
          !isDragging && !value && "border-muted-foreground/25 hover:border-muted-foreground/50",
          value && "border-transparent",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && !value && "cursor-pointer"
        )}
        onClick={() => !disabled && !value && !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={placeholderText}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleInputChange}
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Image preview */}
        {value && !isUploading && (
          <>
            <img
              src={value}
              alt="Uploaded file"
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
                title="Change file"
                aria-label="Change file"
              >
                <Upload className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={disabled}
                className="p-2 rounded-full bg-white/90 text-red-600 hover:bg-white transition-colors"
                title="Remove file"
                aria-label="Remove file"
              >
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </>
        )}

        {/* Upload placeholder */}
        {!value && !isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {placeholderText}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {acceptedTypes.map((t) => t.split("/")[1]?.toUpperCase()).join(", ")} up to {maxSizeMB}MB
            </p>
          </div>
        )}

        {/* Loading state */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Error message with retry */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
          {lastFile && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="h-auto p-1 text-destructive hover:text-destructive"
            >
              <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default BaseFileUpload;
