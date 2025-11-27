"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { elementsData } from "@/lib/elements-data";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Battery, Zap } from "lucide-react";
import Link from "next/link";
import { useState, memo } from "react";
import { ElementalIcons } from "@/components/icons/elemental-icons";

// Map element slugs to icon keys
const slugToIconKey: Record<string, keyof typeof ElementalIcons> = {
  electric: 'electric',
  fiery: 'fire',
  aquatic: 'water',
  earthly: 'earth',
  airy: 'air',
  metallic: 'metal',
};

export const InteractiveElements = memo(function InteractiveElements() {
  const [activeElement, setActiveElement] = useState<string>("electric");

  const activeData = Object.values(elementsData).find(
    (e) => e.slug === activeElement
  ) || elementsData.electric;

  return (
    <section id="elements" className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-accent/5" />
      {/* Dynamic Background Blob */}
      <motion.div
        className="absolute top-40 left-0 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none"
        animate={{
          background: activeData.gradient.includes("from-")
            ? `linear-gradient(to bottom right, ${activeData.glowColor}, transparent)`
            : activeData.glowColor
        }}
        transition={{ duration: 1 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            The <span className="gradient-text">Six Elements</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore the core energy patterns. Click an element to see its unique traits.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Element Selector (Left/Top) */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {Object.values(elementsData).map((element) => (
              <button
                key={element.slug}
                onClick={() => setActiveElement(element.slug)}
                className={cn(
                  "p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-4 group relative overflow-hidden",
                  activeElement === element.slug
                    ? "bg-primary/10 text-foreground shadow-lg border border-primary/20"
                    : "glass-card hover:bg-primary/5 border-transparent hover:border-primary/10"
                )}
              >
                {activeElement === element.slug && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-2xl relative z-10 group-hover:scale-110 transition-transform duration-300">
                  {(() => {
                    const iconKey = slugToIconKey[element.slug];
                    const Icon = iconKey ? ElementalIcons[iconKey] : null;
                    return Icon ? <Icon size="1.5rem" /> : <span>{element.icon}</span>;
                  })()}
                </span>
                <span className={cn(
                  "font-bold relative z-10 transition-colors",
                  activeElement === element.slug ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}>
                  {element.name}
                </span>
              </button>
            ))}
          </div>

          {/* Active Element Display (Right/Bottom) */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeElement}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card className="p-8 md:p-12 glass-premium border-primary/20 relative overflow-hidden h-full group">
                  {/* Background Glow */}
                  <div
                    className="absolute inset-0 opacity-10 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at top right, ${activeData.glowColor}, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-6 mb-8">
                          <div className="text-7xl md:text-8xl animate-in zoom-in duration-300 drop-shadow-2xl">
                            {(() => {
                              const iconKey = slugToIconKey[activeData.slug];
                              const Icon = iconKey ? ElementalIcons[iconKey] : null;
                              return Icon ? <Icon size="6rem" /> : <span>{activeData.icon}</span>;
                            })()}
                          </div>
                          <div>
                            <h3 className={cn("text-4xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r", activeData.gradient)}>
                              {activeData.name}
                            </h3>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                              {activeData.energyType} Energy
                            </span>
                          </div>
                        </div>

                        <p className="text-xl text-foreground/90 mb-10 leading-relaxed font-light">
                          {activeData.overview[0]}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-8 mb-10">
                          <div className="space-y-4 p-5 rounded-2xl bg-green-500/5 border border-green-500/10">
                            <div className="flex items-center gap-2 text-sm font-bold text-green-500 uppercase tracking-wider">
                              <Zap className="w-4 h-4" /> Regenerated By
                            </div>
                            <ul className="space-y-3">
                              {activeData.energySources.slice(0, 2).map((s, i) => (
                                <li key={i} className="flex items-start gap-3 text-base text-foreground/80">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                                  {s.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-4 p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                            <div className="flex items-center gap-2 text-sm font-bold text-red-500 uppercase tracking-wider">
                              <Battery className="w-4 h-4" /> Drained By
                            </div>
                            <ul className="space-y-3">
                              {activeData.energyDrains.slice(0, 2).map((d, i) => (
                                <li key={i} className="flex items-start gap-3 text-base text-foreground/80">
                                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                  {d.title}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <Link href={`/elements/${activeData.slug}`}>
                          <Button size="lg" className={cn("w-full sm:w-auto text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-gradient-to-r", activeData.gradient)}>
                            Explore {activeData.name} Profile <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
});



