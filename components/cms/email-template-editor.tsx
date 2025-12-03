"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Code, Eye, Variable, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface EmailTemplate {
  id?: string;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: string[];
  category: string;
  is_active: boolean;
}

export interface EmailTemplateEditorProps {
  template: Partial<EmailTemplate>;
  onChange: (template: Partial<EmailTemplate>) => void;
  onPreview?: () => void;
  onSendTest?: (email: string) => Promise<void>;
  className?: string;
}

// ============================================================================
// Variable Inserter Component
// ============================================================================

interface VariableInserterProps {
  variables: string[];
  onInsert: (variable: string) => void;
}

function VariableInserter({ variables, onInsert }: VariableInserterProps) {
  const [open, setOpen] = React.useState(false);

  if (variables.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        No variables defined
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Variable className="h-4 w-4" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 py-1">
            Click to insert at cursor
          </p>
          {variables.map((variable) => (
            <button
              key={variable}
              type="button"
              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
              onClick={() => {
                onInsert(variable);
                setOpen(false);
              }}
            >
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {`{{${variable}}}`}
              </code>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}


// ============================================================================
// HTML Preview Component
// ============================================================================

interface HtmlPreviewProps {
  html: string;
  variables: string[];
  sampleData?: Record<string, string>;
}

function HtmlPreview({ html, variables, sampleData = {} }: HtmlPreviewProps) {
  // Generate sample data for variables if not provided
  const defaultSampleData: Record<string, string> = {
    name: "John Doe",
    email: "john@example.com",
    site_name: "NeuroElemental",
    link: "https://example.com/action",
    course_name: "Sample Course",
    event_name: "Sample Event",
    date: new Date().toLocaleDateString(),
    ...sampleData,
  };

  // Replace variables with sample data
  let previewHtml = html;
  variables.forEach((variable) => {
    const value = defaultSampleData[variable] || `[${variable}]`;
    previewHtml = previewHtml.replace(
      new RegExp(`\\{\\{${variable}\\}\\}`, "g"),
      value
    );
  });

  return (
    <div className="border rounded-lg bg-white">
      <div className="px-3 py-2 border-b bg-muted/30 text-xs text-muted-foreground">
        Preview with sample data
      </div>
      <div
        className="p-4 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  );
}

// ============================================================================
// Send Test Email Dialog
// ============================================================================

interface SendTestDialogProps {
  onSend: (email: string) => Promise<void>;
}

function SendTestDialog({ onSend }: SendTestDialogProps) {
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const handleSend = async () => {
    if (!email) return;
    setSending(true);
    try {
      await onSend(email);
      setOpen(false);
      setEmail("");
    } finally {
      setSending(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Send className="h-4 w-4" />
          Send Test
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="test-email">Send test email to:</Label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!email || sending}
            className="w-full"
            size="sm"
          >
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Test Email
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ============================================================================
// EmailTemplateEditor Component
// ============================================================================

export function EmailTemplateEditor({
  template,
  onChange,
  onSendTest,
  className,
}: EmailTemplateEditorProps) {
  const [mode, setMode] = React.useState<"visual" | "html">("visual");
  const [showPreview, setShowPreview] = React.useState(false);
  const htmlTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const variables = template.variables || [];
  const htmlContent = template.html_content || "";

  const handleHtmlChange = (value: string) => {
    onChange({ ...template, html_content: value });
  };

  const handleVisualChange = (html: string) => {
    onChange({ ...template, html_content: html });
  };

  const insertVariable = (variable: string) => {
    const insertion = `{{${variable}}}`;

    if (mode === "html" && htmlTextareaRef.current) {
      const textarea = htmlTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        htmlContent.substring(0, start) +
        insertion +
        htmlContent.substring(end);
      handleHtmlChange(newValue);

      // Restore cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + insertion.length,
          start + insertion.length
        );
      }, 0);
    } else {
      // For visual mode, append to end (TipTap doesn't expose cursor easily)
      handleHtmlChange(htmlContent + insertion);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <VariableInserter variables={variables} onInsert={insertVariable} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Hide Preview" : "Preview"}
          </Button>
          {onSendTest && <SendTestDialog onSend={onSendTest} />}
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as "visual" | "html")}>
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="visual" className="gap-2">
            Visual
          </TabsTrigger>
          <TabsTrigger value="html" className="gap-2">
            <Code className="h-4 w-4" /> HTML
          </TabsTrigger>
        </TabsList>

        <div className={cn("mt-4", showPreview && "grid grid-cols-2 gap-4")}>
          <div>
            <TabsContent value="visual" className="mt-0">
              <RichTextEditor
                content={htmlContent}
                onChange={handleVisualChange}
                placeholder="Compose your email content..."
                className="min-h-[300px]"
              />
            </TabsContent>

            <TabsContent value="html" className="mt-0">
              <Textarea
                ref={htmlTextareaRef}
                value={htmlContent}
                onChange={(e) => handleHtmlChange(e.target.value)}
                className="font-mono text-sm min-h-[300px]"
                placeholder="<h1>Hello {{name}}!</h1>"
              />
            </TabsContent>
          </div>

          {showPreview && (
            <HtmlPreview html={htmlContent} variables={variables} />
          )}
        </div>
      </Tabs>
    </div>
  );
}

// ============================================================================
// Utility: Generate plain text from HTML
// ============================================================================

export function htmlToPlainText(html: string): string {
  // Create a temporary element to parse HTML
  if (typeof document === "undefined") {
    // Server-side fallback: basic regex stripping
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, "$2 ($1)")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const temp = document.createElement("div");
  temp.innerHTML = html;

  // Convert links to text with URL
  const links = temp.querySelectorAll("a");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    const text = link.textContent;
    if (href && text) {
      link.textContent = `${text} (${href})`;
    }
  });

  // Get text content
  let text = temp.textContent || temp.innerText || "";

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}

// ============================================================================
// Export VariableInserter for standalone use
// ============================================================================

export { VariableInserter };
