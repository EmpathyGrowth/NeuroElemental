"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ELEMENT_DEFINITIONS,
  type ElementType,
} from "@/lib/content/assessment-questions";
import { ArrowLeftRight, Zap } from "lucide-react";
import { useState } from "react";

const ELEMENT_OPTIONS: { value: ElementType; label: string; emoji: string }[] =
  [
    { value: "electric", label: "Electric", emoji: "⚡" },
    { value: "fiery", label: "Fiery", emoji: "🔥" },
    { value: "aquatic", label: "Aquatic", emoji: "🌊" },
    { value: "earthly", label: "Earthly", emoji: "🌱" },
    { value: "airy", label: "Airy", emoji: "💨" },
    { value: "metallic", label: "Metallic", emoji: "🪙" },
  ];

/**
 * Interactive element comparison tool
 * Allows users to compare two elements side-by-side
 */
export function ElementComparison() {
  const [element1, setElement1] = useState<ElementType>("electric");
  const [element2, setElement2] = useState<ElementType>("fiery");

  const el1 = ELEMENT_DEFINITIONS[element1];
  const el2 = ELEMENT_DEFINITIONS[element2];

  return (
    <div className="space-y-6">
      {/* Element Selectors */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            Compare Elements
          </CardTitle>
          <CardDescription>
            Select two elements to see how they interact and complement each
            other
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Element</label>
              <Select
                value={element1}
                onValueChange={(v) => setElement1(v as ElementType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ELEMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Second Element</label>
              <Select
                value={element2}
                onValueChange={(v) => setElement2(v as ElementType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ELEMENT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {element1 === element2 && (
            <p className="mt-4 text-sm text-muted-foreground text-center">
              Select two different elements to see the comparison
            </p>
          )}
        </CardContent>
      </Card>

      {element1 !== element2 && (
        <>
          {/* Side-by-Side Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Element 1 */}
            <Card className="border-2 bg-card relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${el1.gradient} opacity-[0.08] dark:opacity-[0.12]`}
              />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${el1.gradient} flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {ELEMENT_OPTIONS.find((e) => e.value === element1)?.emoji}
                  </div>
                  <div>
                    <CardTitle className="text-foreground">
                      {el1.name}
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wide">
                      {el1.shortDescription}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit">
                  {el1.energyType}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">
                    Core Motivation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {el1.coreMotivation}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">
                    Core Fear
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {el1.coreFear}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">
                    Key Traits
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {el1.distinguishingTraits
                      .slice(0, 6)
                      .map((trait: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Element 2 */}
            <Card className="border-2 bg-card relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${el2.gradient} opacity-[0.08] dark:opacity-[0.12]`}
              />
              <CardHeader className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-br ${el2.gradient} flex items-center justify-center text-2xl shadow-lg`}
                  >
                    {ELEMENT_OPTIONS.find((e) => e.value === element2)?.emoji}
                  </div>
                  <div>
                    <CardTitle className="text-foreground">
                      {el2.name}
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wide">
                      {el2.shortDescription}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit">
                  {el2.energyType}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4 relative">
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">
                    Core Motivation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {el2.coreMotivation}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">
                    Core Fear
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {el2.coreFear}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2 text-foreground">
                    Key Traits
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {el2.distinguishingTraits
                      .slice(0, 6)
                      .map((trait: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {trait}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Misidentifications */}
          {(el1.commonMisidentifications.includes(element2) ||
            el2.commonMisidentifications.includes(element1)) && (
            <Card className="glass-card border-amber-500/20 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Zap className="w-5 h-5" />
                  Common Confusion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  These elements are sometimes mistaken for each other.{" "}
                  {el1.name} and {el2.name} share some surface-level
                  similarities, but differ in their core motivations and energy
                  patterns.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" asChild>
              <a href={`/elements/${element1}`}>Explore {el1.name}</a>
            </Button>
            <Button variant="outline" asChild>
              <a href={`/elements/${element2}`}>Explore {el2.name}</a>
            </Button>
            <Button asChild>
              <a href="/assessment">Take the Assessment</a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
