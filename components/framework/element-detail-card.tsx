import { ElementIcon } from "@/components/icons/element-icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Battery, Heart, MessageCircle, Zap } from "lucide-react";

interface ElementDetailProps {
  slug: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  motivation: string;
  drain: string;
  regeneration: string;
  communication: string;
}

export function ElementDetailCard({
  slug,
  name,
  color,
  bgColor,
  borderColor,
  description,
  motivation,
  drain,
  regeneration,
  communication,
}: ElementDetailProps) {
  return (
    <Card className={`p-8 glass-card ${borderColor} border-2 relative overflow-hidden group`}>
      <div className={`absolute top-0 right-0 w-64 h-64 ${bgColor} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50`} />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${bgColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
            <ElementIcon slug={slug} size="2.5rem" className={color} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">{name}</h3>
            <Badge variant="outline" className={`${color} ${borderColor} bg-background/50`}>
              {slug.charAt(0).toUpperCase() + slug.slice(1)} Energy
            </Badge>
          </div>
        </div>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <Zap className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Core Motivation</h4>
                <p className="text-sm text-muted-foreground">{motivation}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <Battery className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Energy Drain</h4>
                <p className="text-sm text-muted-foreground">{drain}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <Heart className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Regeneration Needs</h4>
                <p className="text-sm text-muted-foreground">{regeneration}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <MessageCircle className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Communication Style</h4>
                <p className="text-sm text-muted-foreground">{communication}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
