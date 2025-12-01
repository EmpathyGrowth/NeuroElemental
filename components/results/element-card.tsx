import type { ElementalIcons } from "@/components/icons/elemental-icons";
import { Card } from "@/components/ui/card";

interface ElementCardProps {
  name: string;
  Icon: (typeof ElementalIcons)[keyof typeof ElementalIcons];
  score: number;
  gradient: string;
  energyType: string;
  summary: string;
  isPrimary?: boolean;
}

export function ElementCard({
  name,
  Icon,
  score,
  gradient,
  energyType,
  summary,
  isPrimary = false,
}: ElementCardProps) {
  return (
    <Card className="p-8 glass-card border-white/40 hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2">
      <div className="text-center">
        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform flex items-center justify-center">
          <Icon size="4rem" />
        </div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gradient} text-white mb-4`}
        >
          {energyType}
        </span>
        <h3
          className={`text-3xl font-bold mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
        >
          {name}
        </h3>
        <div className="text-5xl font-bold text-foreground mb-4">
          {score}%
        </div>
        <p className="text-muted-foreground mb-6">{summary}</p>
        {isPrimary && (
          <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary to-[#764BA2] text-white text-sm font-semibold">
            Primary Element
          </span>
        )}
      </div>
    </Card>
  );
}
