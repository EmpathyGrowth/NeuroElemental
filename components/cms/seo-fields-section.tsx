"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPickerButton } from "@/components/forms/media-picker";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Image as ImageIcon, X, Search, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface SEOFieldsData {
  meta_title: string;
  meta_description: string;
  social_image: string;
}

export interface SEOFieldsSectionProps {
  data: SEOFieldsData;
  onChange: (data: SEOFieldsData) => void;
  /** Content title for auto-generation */
  contentTitle?: string;
  /** Content excerpt/description for auto-generation */
  contentExcerpt?: string;
  /** Show preview components */
  showPreview?: boolean;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

const META_DESCRIPTION_MAX_LENGTH = 160;
const META_TITLE_MAX_LENGTH = 60;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Auto-generate SEO meta title from content title
 */
export function generateMetaTitle(contentTitle: string): string {
  if (!contentTitle) return "";
  // Truncate to max length if needed
  return contentTitle.slice(0, META_TITLE_MAX_LENGTH);
}

/**
 * Auto-generate SEO meta description from content excerpt
 */
export function generateMetaDescription(contentExcerpt: string): string {
  if (!contentExcerpt) return "";
  // Strip HTML tags if present
  const plainText = contentExcerpt.replace(/<[^>]*>/g, "").trim();
  // Truncate to max length
  return plainText.slice(0, META_DESCRIPTION_MAX_LENGTH);
}

/**
 * Check if meta description exceeds recommended length
 */
export function isMetaDescriptionTooLong(description: string): boolean {
  return description.length > META_DESCRIPTION_MAX_LENGTH;
}

// ============================================================================
// SEOFieldsSection Component
// ============================================================================

export function SEOFieldsSection({
  data,
  onChange,
  contentTitle,
  contentExcerpt,
  showPreview = true,
  className,
}: SEOFieldsSectionProps) {
  const [showGooglePreview, setShowGooglePreview] = React.useState(false);
  const [showSocialPreview, setShowSocialPreview] = React.useState(false);

  const updateField = <K extends keyof SEOFieldsData>(
    field: K,
    value: SEOFieldsData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const handleAutoGenerate = () => {
    const newData = { ...data };
    
    if (!data.meta_title && contentTitle) {
      newData.meta_title = generateMetaTitle(contentTitle);
    }
    
    if (!data.meta_description && contentExcerpt) {
      newData.meta_description = generateMetaDescription(contentExcerpt);
    }
    
    onChange(newData);
  };

  const descriptionTooLong = isMetaDescriptionTooLong(data.meta_description);
  const canAutoGenerate = (!data.meta_title && contentTitle) || (!data.meta_description && contentExcerpt);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Auto-generate button */}
      {canAutoGenerate && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Auto-generate SEO fields from content
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoGenerate}
          >
            Auto-Generate
          </Button>
        </div>
      )}

      {/* Meta Title */}
      <div className="space-y-2">
        <Label htmlFor="meta_title">Meta Title</Label>
        <Input
          id="meta_title"
          value={data.meta_title}
          onChange={(e) => updateField("meta_title", e.target.value)}
          placeholder="Enter SEO title (recommended: 50-60 characters)"
          maxLength={META_TITLE_MAX_LENGTH + 10}
        />
        <p className="text-xs text-muted-foreground">
          {data.meta_title.length}/{META_TITLE_MAX_LENGTH} characters
        </p>
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <Label htmlFor="meta_description">Meta Description</Label>
        <Textarea
          id="meta_description"
          value={data.meta_description}
          onChange={(e) => updateField("meta_description", e.target.value)}
          placeholder="Enter SEO description (recommended: 150-160 characters)"
          rows={3}
        />
        <div className="flex items-center justify-between">
          <p className={cn(
            "text-xs",
            descriptionTooLong ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          )}>
            {data.meta_description.length}/{META_DESCRIPTION_MAX_LENGTH} characters
          </p>
          {descriptionTooLong && (
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">Description may be truncated in search results</span>
            </div>
          )}
        </div>
      </div>

      {/* Social Image */}
      <div className="space-y-2">
        <Label>Social Share Image (Open Graph)</Label>
        {data.social_image ? (
          <div className="relative rounded-lg border overflow-hidden">
            <img
              src={data.social_image}
              alt="Social share preview"
              className="w-full h-40 object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={() => updateField("social_image", "")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <MediaPickerButton
              onSelect={(url) => updateField("social_image", url)}
              category="seo"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Select Image
            </MediaPickerButton>
            <p className="text-xs text-muted-foreground">
              Recommended: 1200×630 pixels
            </p>
          </div>
        )}
      </div>

      {/* Preview Toggles */}
      {showPreview && (
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant={showGooglePreview ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setShowGooglePreview(!showGooglePreview);
              setShowSocialPreview(false);
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            Google Preview
          </Button>
          <Button
            type="button"
            variant={showSocialPreview ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setShowSocialPreview(!showSocialPreview);
              setShowGooglePreview(false);
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Social Preview
          </Button>
        </div>
      )}

      {/* Google Search Preview */}
      {showGooglePreview && (
        <SEOGooglePreview
          title={data.meta_title || contentTitle || "Page Title"}
          description={data.meta_description || contentExcerpt || "Page description will appear here..."}
          url="example.com/page-url"
        />
      )}

      {/* Social Share Preview */}
      {showSocialPreview && (
        <SEOSocialPreview
          title={data.meta_title || contentTitle || "Page Title"}
          description={data.meta_description || contentExcerpt || "Page description will appear here..."}
          image={data.social_image}
          url="example.com"
        />
      )}
    </div>
  );
}


// ============================================================================
// SEOGooglePreview Component
// ============================================================================

interface SEOGooglePreviewProps {
  title: string;
  description: string;
  url: string;
}

export function SEOGooglePreview({ title, description, url }: SEOGooglePreviewProps) {
  // Truncate title to ~60 chars and description to ~160 chars for realistic preview
  const displayTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const displayDescription = description.length > 160 
    ? description.slice(0, 157) + "..." 
    : description;

  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border">
      <p className="text-xs text-muted-foreground mb-2">Google Search Preview</p>
      <div className="space-y-1">
        <p className="text-xs text-green-700 dark:text-green-500">{url}</p>
        <h3 className="text-lg text-blue-600 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
          {displayTitle}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {displayDescription}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// SEOSocialPreview Component
// ============================================================================

interface SEOSocialPreviewProps {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export function SEOSocialPreview({ title, description, image, url }: SEOSocialPreviewProps) {
  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border">
      <p className="text-xs text-muted-foreground mb-2">Social Share Preview (Open Graph)</p>
      <div className="border rounded-lg overflow-hidden max-w-md">
        {image ? (
          <img
            src={image}
            alt="Social preview"
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-muted flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        <div className="p-3 bg-gray-50 dark:bg-zinc-800">
          <p className="text-xs text-muted-foreground uppercase">{url}</p>
          <h4 className="font-semibold text-sm line-clamp-2 mt-1">{title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
