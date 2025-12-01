"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ThemePreviewProps {
  colors: Record<string, string>;
  typography: Record<string, string>;
  layout: Record<string, string>;
  darkMode?: boolean;
}

export function ThemePreview({
  colors,
  typography,
  layout,
  darkMode = false,
}: ThemePreviewProps) {
  // Construct style object from variables
  const styles = {
    ...Object.entries(colors).reduce(
      (acc, [key, value]) => {
        acc[`--${key}`] = value;
        return acc;
      },
      {} as Record<string, string>
    ),
    ...Object.entries(typography).reduce(
      (acc, [key, value]) => {
        acc[`--${key}`] = value;
        return acc;
      },
      {} as Record<string, string>
    ),
    ...Object.entries(layout).reduce(
      (acc, [key, value]) => {
        acc[`--${key}`] = value;
        return acc;
      },
      {} as Record<string, string>
    ),
  } as React.CSSProperties;

  return (
    <div
      className={cn(
        "p-6 rounded-lg border shadow-sm transition-all duration-300",
        darkMode
          ? "dark bg-background text-foreground"
          : "bg-background text-foreground"
      )}
      style={styles}
    >
      <div className="space-y-8">
        {/* Typography Showcase */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Heading 1</h1>
            <h2 className="text-3xl font-semibold tracking-tight">Heading 2</h2>
            <h3 className="text-2xl font-semibold tracking-tight">Heading 3</h3>
            <h4 className="text-xl font-semibold tracking-tight">Heading 4</h4>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            This is a sample paragraph demonstrating the body text style. It
            shows how your typography settings affect readability and visual
            hierarchy. The quick brown fox jumps over the lazy dog.
          </p>
        </div>

        {/* Components Showcase */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cards are used to group related content. They use the card
                  background and border colors.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Highlighted Card</CardTitle>
                <CardDescription>Using primary color accents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Feature one</span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Feature two</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Input Label</Label>
              <Input placeholder="Placeholder text..." />
            </div>

            <Tabs defaultValue="tab1" className="w-full">
              <TabsList>
                <TabsTrigger value="tab1">Tab One</TabsTrigger>
                <TabsTrigger value="tab2">Tab Two</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="p-4 border rounded-md mt-2">
                Tab content area uses background and border variables.
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
