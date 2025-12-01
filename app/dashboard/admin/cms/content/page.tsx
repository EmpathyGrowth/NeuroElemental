"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logging";
import { Code, FileText, Loader2, Save, Type } from "lucide-react";
import { useEffect, useState } from "react";

interface SiteContent {
  id: string;
  page: string;
  section: string;
  content: Record<string, unknown>;
  is_published: boolean;
}

// Fields that should use rich text editor
const RICH_TEXT_FIELDS = [
  "description",
  "content",
  "body",
  "text",
  "message",
  "details",
  "summary",
];

// Fields that are likely short text (use input)
const SHORT_TEXT_FIELDS = [
  "title",
  "heading",
  "label",
  "name",
  "highlight",
  "subtext",
  "subtitle",
  "cta",
  "href",
  "link",
  "url",
];

function isRichTextField(key: string): boolean {
  return RICH_TEXT_FIELDS.some((field) => key.toLowerCase().includes(field));
}

function isShortTextField(key: string): boolean {
  return SHORT_TEXT_FIELDS.some((field) => key.toLowerCase().includes(field));
}

function formatFieldLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

interface ContentFieldsEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  path?: string;
}

function ContentFieldsEditor({
  content,
  onChange,
  path = "",
}: ContentFieldsEditorProps) {
  const updateField = (key: string, value: unknown) => {
    onChange({ ...content, [key]: value });
  };

  const renderField = (key: string, value: unknown) => {
    const fullPath = path ? `${path}.${key}` : key;
    const label = formatFieldLabel(key);

    // Handle nested objects
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      return (
        <div
          key={fullPath}
          className="border rounded-lg p-3 space-y-3 bg-muted/20"
        >
          <span className="font-medium text-sm text-muted-foreground">
            {label}
          </span>
          <ContentFieldsEditor
            content={value as Record<string, unknown>}
            onChange={(updated) => updateField(key, updated)}
            path={fullPath}
          />
        </div>
      );
    }

    // Handle arrays (show as JSON for now)
    if (Array.isArray(value)) {
      return (
        <div key={fullPath} className="space-y-1">
          <Label className="text-sm">{label} (Array)</Label>
          <Textarea
            className="font-mono text-xs"
            rows={3}
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                updateField(key, JSON.parse(e.target.value));
              } catch {
                // Invalid JSON
              }
            }}
          />
        </div>
      );
    }

    // Handle booleans
    if (typeof value === "boolean") {
      return (
        <div key={fullPath} className="flex items-center gap-2">
          <Switch
            checked={value}
            onCheckedChange={(checked) => updateField(key, checked)}
          />
          <Label className="text-sm">{label}</Label>
        </div>
      );
    }

    // Handle strings - determine if rich text or short text
    if (typeof value === "string") {
      // Rich text for description-like fields
      if (isRichTextField(key)) {
        return (
          <div key={fullPath} className="space-y-1">
            <Label className="text-sm">{label}</Label>
            <RichTextEditor
              content={value}
              onChange={(html) => updateField(key, html)}
              placeholder={`Enter ${label.toLowerCase()}...`}
              className="min-h-[150px]"
            />
          </div>
        );
      }

      // Short input for title-like fields or short content
      if (isShortTextField(key) || value.length < 100) {
        return (
          <div key={fullPath} className="space-y-1">
            <Label className="text-sm">{label}</Label>
            <Input
              value={value}
              onChange={(e) => updateField(key, e.target.value)}
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          </div>
        );
      }

      // Textarea for medium-length text
      return (
        <div key={fullPath} className="space-y-1">
          <Label className="text-sm">{label}</Label>
          <Textarea
            value={value}
            onChange={(e) => updateField(key, e.target.value)}
            rows={3}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        </div>
      );
    }

    // Handle numbers
    if (typeof value === "number") {
      return (
        <div key={fullPath} className="space-y-1">
          <Label className="text-sm">{label}</Label>
          <Input
            type="number"
            value={value}
            onChange={(e) => updateField(key, parseFloat(e.target.value) || 0)}
          />
        </div>
      );
    }

    // Fallback: show as text
    return (
      <div key={fullPath} className="space-y-1">
        <Label className="text-sm">{label}</Label>
        <Input
          value={String(value ?? "")}
          onChange={(e) => updateField(key, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {Object.entries(content).map(([key, value]) => renderField(key, value))}
    </div>
  );
}

export default function SiteContentPage() {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      setContent(data.content || []);
    } catch (error) {
      logger.error(
        "Error fetching content",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: SiteContent) => {
    setSaving(true);
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      toast({
        title: "Content saved",
        description: "Changes have been saved.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save content.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminPageShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Site Content"
        description="Manage landing page and site sections"
      />

      {content.length === 0 ? (
        <Card className="glass-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No content sections</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Content sections will appear here once created. Use the API to add
              new sections.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {content.map((item) => (
            <Card key={item.id} className="glass-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.section}</CardTitle>
                    <CardDescription>Page: {item.page}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Published</Label>
                    <Switch
                      checked={item.is_published}
                      onCheckedChange={(checked) =>
                        setContent((prev) =>
                          prev.map((c) =>
                            c.id === item.id
                              ? { ...c, is_published: checked }
                              : c
                          )
                        )
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="visual" className="w-full">
                  <TabsList className="grid w-full max-w-xs grid-cols-2">
                    <TabsTrigger value="visual" className="gap-2">
                      <Type className="h-4 w-4" /> Visual
                    </TabsTrigger>
                    <TabsTrigger value="json" className="gap-2">
                      <Code className="h-4 w-4" /> JSON
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="visual" className="space-y-4 mt-4">
                    <ContentFieldsEditor
                      content={item.content}
                      onChange={(updated) =>
                        setContent((prev) =>
                          prev.map((c) =>
                            c.id === item.id ? { ...c, content: updated } : c
                          )
                        )
                      }
                    />
                  </TabsContent>

                  <TabsContent value="json" className="mt-4">
                    <Label className="text-xs text-muted-foreground">
                      Advanced: Edit raw JSON
                    </Label>
                    <Textarea
                      className="font-mono text-sm mt-2"
                      rows={8}
                      value={JSON.stringify(item.content, null, 2)}
                      onChange={(e) => {
                        try {
                          const updated = JSON.parse(e.target.value);
                          setContent((prev) =>
                            prev.map((c) =>
                              c.id === item.id ? { ...c, content: updated } : c
                            )
                          );
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                    />
                  </TabsContent>
                </Tabs>

                <Button onClick={() => handleSave(item)} disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
