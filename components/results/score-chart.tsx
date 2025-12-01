import type { ElementalIcons } from "@/components/icons/elemental-icons";

interface Element {
  name: string;
  Icon: (typeof ElementalIcons)[keyof typeof ElementalIcons];
  score: number;
  gradient: string;
}

interface ScoreChartProps {
  elements: Element[];
}

export function ScoreChart({ elements }: ScoreChartProps) {
  return (
    <div className="space-y-6">
      {elements.map((element) => (
        <div key={element.name}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <element.Icon size="2rem" />
              <span className="font-bold text-lg text-foreground">
                {element.name}
              </span>
            </div>
            <span className="font-bold text-lg text-foreground">
              {element.score}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${element.gradient} transition-all duration-1000`}
              style={{ width: `${element.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
