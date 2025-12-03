"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code, Type } from "lucide-react";
import { cn } from "@/lib/utils";

// Import type-specific editors
import { TextBlockEditor } from "./editors/text-block-editor";
import { CTABlockEditor } from "./editors/cta-block-editor";
import { FeatureBlockEditor } from "./editors/feature-block-editor";
import { TestimonialBlockEditor } from "./editors/testimonial-block-editor";
import { StatsBlockEditor } from "./editors/stats-block-editor";
import { GalleryBlockEditor } from "./editors/gallery-block-editor";

// ============================================================================
// Types
// ============================================================================

export type BlockType =
  | "text"
  | "html"
  | "cta"
  | "feature"
  | "testimonial"
  | "stats"
  | "gallery"
  | "video"
  | "code"
  | "custom";

export interface BlockContentEditorProps {
  blockType: BlockType;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  className?: string;
}

// ============================================================================
// Block Type to Editor Mapping
// ============================================================================

const VISUAL_EDITOR_TYPES: BlockType[] = [
  "text",
  "html",
  "cta",
  "feature",
  "testimonial",
  "stats",
  "gallery",
];

function hasVisualEditor(blockType: BlockType): boolean {
  return VISUAL_EDITOR_TYPES.includes(blockType);
}

// ============================================================================
// BlockContentEditor Component
// ============================================================================

export function BlockContentEditor({
  blockType,
  content,
  onChange,
  className,
}: BlockContentEditorProps) {
  const [mode, setMode] = React.useState<"visual" | "json">("visual");
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  // JSON string for raw editing
  const jsonString = React.useMemo(
    () => JSON.stringify(content, null, 2),
    [content]
  );

  const handleJsonChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setJsonError(null);
    } catch {
      setJsonError("Invalid JSON");
    }
  };

  // Render the appropriate visual editor based on block type
  const renderVisualEditor = () => {
    switch (blockType) {
      case "text":
      case "html":
        return <TextBlockEditor content={content} onChange={onChange} />;
      case "cta":
        return <CTABlockEditor content={content} onChange={onChange} />;
      case "feature":
        return <FeatureBlockEditor content={content} onChange={onChange} />;
      case "testimonial":
        return <TestimonialBlockEditor content={content} onChange={onChange} />;
      case "stats":
        return <StatsBlockEditor content={content} onChange={onChange} />;
      case "gallery":
        return <GalleryBlockEditor content={content} onChange={onChange} />;
      default:
        return (
          <div className="text-sm text-muted-foreground p-4 text-center">
            No visual editor available for this block type. Use JSON mode.
          </div>
        );
    }
  };

  // If no visual editor, show JSON only
  if (!hasVisualEditor(blockType)) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label className="text-xs text-muted-foreground">
          Content (JSON) - No visual editor for "{blockType}" blocks
        </Label>
        <Textarea
          value={jsonString}
          onChange={(e) => handleJsonChange(e.target.value)}
          className={cn(
            "font-mono text-sm min-h-[200px]",
            jsonError && "border-destructive"
          )}
          placeholder='{"key": "value"}'
        />
        {jsonError && (
          <p className="text-xs text-destructive">{jsonError}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={mode} onValueChange={(v) => setMode(v as "visual" | "json")}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="visual" className="gap-2">
            <Type className="h-4 w-4" /> Visual
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-2">
            <Code className="h-4 w-4" /> JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="mt-4">
          {renderVisualEditor()}
        </TabsContent>

        <TabsContent value="json" className="mt-4 space-y-2">
          <Label className="text-xs text-muted-foreground">
            Advanced: Edit raw JSON
          </Label>
          <Textarea
            value={jsonString}
            onChange={(e) => handleJsonChange(e.target.value)}
            className={cn(
              "font-mono text-sm min-h-[200px]",
              jsonError && "border-destructive"
            )}
          />
          {jsonError && (
            <p className="text-xs text-destructive">{jsonError}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Export block type utilities
// ============================================================================

export { hasVisualEditor, VISUAL_EDITOR_TYPES };
