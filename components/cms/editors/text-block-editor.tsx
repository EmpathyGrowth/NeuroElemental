"use client";

import * as React from "react";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

interface TextBlockContent {
  body?: string;
}

interface TextBlockEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function TextBlockEditor({ content, onChange }: TextBlockEditorProps) {
  const typedContent = content as TextBlockContent;

  return (
    <div className="space-y-2">
      <RichTextEditor
        content={typedContent.body || ""}
        onChange={(html) => onChange({ ...content, body: html })}
        placeholder="Enter your content here..."
        className="min-h-[200px]"
      />
    </div>
  );
}
