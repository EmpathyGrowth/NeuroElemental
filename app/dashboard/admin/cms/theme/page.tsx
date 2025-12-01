"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { ThemePreview } from "@/components/dashboard/theme-preview";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logging";
import { Loader2, Moon, Palette, Save, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface ThemeSettings {
  id: string;
  name: string;
  is_active: boolean;
  colors: Record<string, string>;
  dark_colors: Record<string, string>;
  typography: Record<string, string>;
  layout: Record<string, string>;
}

/** Helper component for color inputs */
function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr,auto] gap-4 items-center">
      <Label className="text-xs capitalize">
        {label.replace(/([A-Z])/g, " $1")}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs h-8 w-24"
        />
        <div className="relative w-8 h-8 rounded border shadow-sm overflow-hidden">
          <Input
            type="color"
            value={value.startsWith("#") ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] p-0 border-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

export default function ThemeSettingsPage() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const { toast } = useToast();

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    try {
      const res = await fetch("/api/admin/theme");
      const data = await res.json();
      const activeTheme =
        data.themes?.find((t: ThemeSettings) => t.is_active) ||
        data.themes?.[0];
      setTheme(activeTheme || null);
    } catch (error) {
      logger.error(
        "Error fetching theme",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!theme) return;
    setSaving(true);
    try {
      await fetch("/api/admin/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: theme.id,
          colors: theme.colors,
          dark_colors: theme.dark_colors,
          typography: theme.typography,
          layout: theme.layout,
        }),
      });
      toast({
        title: "Theme saved",
        description: "Your theme settings have been updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save theme",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateColor = (
    mode: "colors" | "dark_colors",
    key: string,
    value: string
  ) => {
    if (!theme) return;
    setTheme({
      ...theme,
      [mode]: { ...theme[mode], [key]: value },
    });
  };

  const updateTypography = (key: string, value: string) => {
    if (!theme) return;
    setTheme({
      ...theme,
      typography: { ...theme.typography, [key]: value },
    });
  };

  const updateLayout = (key: string, value: string) => {
    if (!theme) return;
    setTheme({
      ...theme,
      layout: { ...theme.layout, [key]: value },
    });
  };

  if (loading) {
    return (
      <AdminPageShell>
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-[600px] w-full" />
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (!theme) {
    return (
      <AdminPageShell>
        <AdminPageHeader
          title="Theme Settings"
          description="Customize your site appearance"
        />
        <Card className="glass-card border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Palette className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No theme found</h3>
            <p className="text-muted-foreground">
              Create a theme to get started.
            </p>
          </CardContent>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Theme Settings"
        description="Customize your site appearance"
        actions={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Editor Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="colors">
            <TabsList className="glass-card border-border/50 p-1 w-full grid grid-cols-4">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="dark">Dark</TabsTrigger>
              <TabsTrigger value="typography">Type</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="mt-6 space-y-4">
              {/* Core Colors */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Core Colors</CardTitle>
                  <CardDescription className="text-xs">
                    Primary brand colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "primary",
                    "primaryForeground",
                    "secondary",
                    "secondaryForeground",
                    "accent",
                    "accentForeground",
                  ].map((key) => (
                    <ColorInput
                      key={key}
                      label={key}
                      value={theme.colors[key] || "#000000"}
                      onChange={(value) => updateColor("colors", key, value)}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Surface Colors */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Surface Colors</CardTitle>
                  <CardDescription className="text-xs">
                    Background and card colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "background",
                    "foreground",
                    "card",
                    "cardForeground",
                    "popover",
                    "popoverForeground",
                    "muted",
                    "mutedForeground",
                  ].map((key) => (
                    <ColorInput
                      key={key}
                      label={key}
                      value={theme.colors[key] || "#000000"}
                      onChange={(value) => updateColor("colors", key, value)}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* UI Colors */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">UI Colors</CardTitle>
                  <CardDescription className="text-xs">
                    Borders, inputs, and focus rings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "border",
                    "input",
                    "ring",
                    "destructive",
                    "destructiveForeground",
                  ].map((key) => (
                    <ColorInput
                      key={key}
                      label={key}
                      value={theme.colors[key] || "#000000"}
                      onChange={(value) => updateColor("colors", key, value)}
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dark" className="mt-6 space-y-4">
              {/* Core Colors */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Core Colors (Dark)</CardTitle>
                  <CardDescription className="text-xs">
                    Primary brand colors for dark mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "primary",
                    "primaryForeground",
                    "secondary",
                    "secondaryForeground",
                    "accent",
                    "accentForeground",
                  ].map((key) => (
                    <ColorInput
                      key={key}
                      label={key}
                      value={theme.dark_colors[key] || "#000000"}
                      onChange={(value) =>
                        updateColor("dark_colors", key, value)
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Surface Colors */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Surface Colors (Dark)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Background and card colors for dark mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "background",
                    "foreground",
                    "card",
                    "cardForeground",
                    "popover",
                    "popoverForeground",
                    "muted",
                    "mutedForeground",
                  ].map((key) => (
                    <ColorInput
                      key={key}
                      label={key}
                      value={theme.dark_colors[key] || "#000000"}
                      onChange={(value) =>
                        updateColor("dark_colors", key, value)
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              {/* UI Colors */}
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">UI Colors (Dark)</CardTitle>
                  <CardDescription className="text-xs">
                    Borders, inputs, and focus rings for dark mode
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "border",
                    "input",
                    "ring",
                    "destructive",
                    "destructiveForeground",
                  ].map((key) => (
                    <ColorInput
                      key={key}
                      label={key}
                      value={theme.dark_colors[key] || "#000000"}
                      onChange={(value) =>
                        updateColor("dark_colors", key, value)
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="mt-6">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Typography</CardTitle>
                  <CardDescription>Fonts and weights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(theme.typography).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize text-xs">
                        {key.replace(/([A-Z])/g, " $1").replace(/^--/, "")}
                      </Label>
                      <Input
                        value={value}
                        onChange={(e) => updateTypography(key, e.target.value)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="mt-6">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Layout</CardTitle>
                  <CardDescription>Spacing and radius</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(theme.layout).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize text-xs">
                        {key.replace(/([A-Z])/g, " $1").replace(/^--/, "")}
                      </Label>
                      <Input
                        value={value}
                        onChange={(e) => updateLayout(key, e.target.value)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Live Preview</h3>
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border">
              <Button
                variant={previewMode === "light" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("light")}
                className="h-7"
              >
                <Sun className="w-4 h-4 mr-2" /> Light
              </Button>
              <Button
                variant={previewMode === "dark" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setPreviewMode("dark")}
                className="h-7"
              >
                <Moon className="w-4 h-4 mr-2" /> Dark
              </Button>
            </div>
          </div>

          <div className="sticky top-6">
            <ThemePreview
              colors={
                previewMode === "light" ? theme.colors : theme.dark_colors
              }
              typography={theme.typography}
              layout={theme.layout}
              darkMode={previewMode === "dark"}
            />
          </div>
        </div>
      </div>
    </AdminPageShell>
  );
}
