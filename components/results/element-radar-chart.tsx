'use client';

import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ELEMENT_DEFINITIONS, type ElementType } from '@/lib/content/assessment-questions';

interface ElementRadarChartProps {
  scores: Record<string, number>;
}

const ELEMENTS_ORDER: ElementType[] = [
  'electric',
  'fiery',
  'aquatic',
  'earthly',
  'airy',
  'metallic',
];

export function ElementRadarChart({ scores }: ElementRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const size = 300;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size / 2 - 40;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background circles
    const levels = [20, 40, 60, 80, 100];
    levels.forEach((level) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (maxRadius * level) / 100, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw axes
    const angleStep = (Math.PI * 2) / ELEMENTS_ORDER.length;
    ELEMENTS_ORDER.forEach((element, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);

      // Draw axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw label
      const labelRadius = maxRadius + 25;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);

      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(150, 150, 150, 0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const def = ELEMENT_DEFINITIONS[element];
      ctx.fillText(def.emoji, labelX, labelY);
    });

    // Draw data polygon
    ctx.beginPath();
    ELEMENTS_ORDER.forEach((element, index) => {
      const score = scores[element] || 0;
      const angle = index * angleStep - Math.PI / 2;
      const radius = (maxRadius * score) / 100;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();

    // Fill
    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      maxRadius
    );
    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // Stroke
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw data points
    ELEMENTS_ORDER.forEach((element, index) => {
      const score = scores[element] || 0;
      const angle = index * angleStep - Math.PI / 2;
      const radius = (maxRadius * score) / 100;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(102, 126, 234)';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [scores]);

  return (
    <Card className="p-6 glass-card border-white/40">
      <h3 className="text-xl font-bold text-foreground mb-4 text-center">
        Element Balance
      </h3>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        {ELEMENTS_ORDER.map((element) => {
          const def = ELEMENT_DEFINITIONS[element];
          const score = scores[element] || 0;
          return (
            <div
              key={element}
              className="text-center p-2 rounded-lg bg-muted/30"
            >
              <span className="text-lg">{def.emoji}</span>
              <div className="text-sm font-medium text-foreground">
                {Math.round(score)}%
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
