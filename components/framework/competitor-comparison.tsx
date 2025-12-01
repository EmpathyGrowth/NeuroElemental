"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Check, Minus, X } from "lucide-react";

/**
 * Competitor comparison table showing NeuroElemental vs traditional personality tests
 * Addresses "Why not just use MBTI?" objection
 */
export function CompetitorComparison() {
  const features: Array<{
    feature: string;
    neuro: FeatureValue;
    mbti: FeatureValue;
    enneagram: FeatureValue;
    bigFive: FeatureValue;
  }> = [
    {
      feature: "Accounts for energy fluctuations",
      neuro: true,
      mbti: false,
      enneagram: false,
      bigFive: false,
    },
    {
      feature: "Designed for neurodivergence (ADHD, Autism, HSP)",
      neuro: true,
      mbti: "partial" as const,
      enneagram: "partial" as const,
      bigFive: false,
    },
    {
      feature: "Actionable regeneration strategies",
      neuro: true,
      mbti: false,
      enneagram: "partial" as const,
      bigFive: false,
    },
    {
      feature: "Burnout prevention tools",
      neuro: true,
      mbti: false,
      enneagram: false,
      bigFive: false,
    },
    {
      feature: "Tracks state changes (not just traits)",
      neuro: true,
      mbti: false,
      enneagram: false,
      bigFive: false,
    },
    {
      feature: "Free core assessment",
      neuro: true,
      mbti: false,
      enneagram: "partial" as const,
      bigFive: true,
    },
    {
      feature: "Shadow work integration",
      neuro: true,
      mbti: false,
      enneagram: true,
      bigFive: false,
    },
  ];

  const renderIcon = (value: boolean | "partial") => {
    if (value === true) {
      return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    } else if (value === "partial") {
      return <Minus className="w-5 h-5 text-amber-500 mx-auto" />;
    } else {
      return <X className="w-5 h-5 text-red-500/50 mx-auto" />;
    }
  };

  type FeatureValue = boolean | "partial";

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How We Compare to{" "}
            <span className="gradient-text">Traditional Tests</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Not just another personality test—a complete energy management
            system
          </p>
        </div>

        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary/10 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-bold text-sm md:text-base min-w-[200px]">
                      Feature
                    </th>
                    <th className="text-center p-4 font-bold text-primary text-sm md:text-base min-w-[120px]">
                      NeuroElemental
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground text-sm min-w-[100px]">
                      MBTI
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground text-sm min-w-[100px]">
                      Enneagram
                    </th>
                    <th className="text-center p-4 font-semibold text-muted-foreground text-sm min-w-[100px]">
                      Big Five
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-muted/20" : ""}
                    >
                      <td className="p-4 text-sm md:text-base">
                        {item.feature}
                      </td>
                      <td className="p-4 text-center">
                        {renderIcon(item.neuro)}
                      </td>
                      <td className="p-4 text-center">
                        {renderIcon(item.mbti)}
                      </td>
                      <td className="p-4 text-center">
                        {renderIcon(item.enneagram)}
                      </td>
                      <td className="p-4 text-center">
                        {renderIcon(item.bigFive)}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-primary/5">
                    <td className="p-4 font-semibold text-sm md:text-base">
                      Core Assessment Cost
                    </td>
                    <td className="p-4 text-center font-bold text-green-600">
                      FREE
                    </td>
                    <td className="p-4 text-center text-muted-foreground text-sm">
                      $50+
                    </td>
                    <td className="p-4 text-center text-muted-foreground text-sm">
                      $12+
                    </td>
                    <td className="p-4 text-center font-semibold text-green-600">
                      FREE
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <strong>Note:</strong> We're not saying other frameworks are
            wrong—they serve different purposes. We're just optimized for energy
            management and neurodivergent brains.
          </p>
        </div>
      </div>
    </section>
  );
}
