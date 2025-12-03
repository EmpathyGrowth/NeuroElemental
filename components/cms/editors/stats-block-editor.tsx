"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

interface StatsBlockContent {
  items?: StatItem[];
}

interface StatsBlockEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function StatsBlockEditor({ content, onChange }: StatsBlockEditorProps) {
  const typedContent = content as StatsBlockContent;
  const items = typedContent.items || [];

  const addItem = () => {
    const newItems = [...items, { value: "", label: "", prefix: "", suffix: "" }];
    onChange({ ...content, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...content, items: newItems });
  };

  const updateItem = (index: number, field: keyof StatItem, value: string) => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Statistics</Label>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" /> Add Stat
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg border-dashed">
          No statistics added. Click "Add Stat" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg space-y-3 bg-muted/20"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Stat #{index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Value</Label>
                  <Input
                    value={item.value}
                    onChange={(e) => updateItem(index, "value", e.target.value)}
                    placeholder="100"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={item.label}
                    onChange={(e) => updateItem(index, "label", e.target.value)}
                    placeholder="Happy Customers"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Prefix (optional)</Label>
                  <Input
                    value={item.prefix || ""}
                    onChange={(e) => updateItem(index, "prefix", e.target.value)}
                    placeholder="$"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Suffix (optional)</Label>
                  <Input
                    value={item.suffix || ""}
                    onChange={(e) => updateItem(index, "suffix", e.target.value)}
                    placeholder="+"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
