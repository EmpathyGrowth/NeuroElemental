'use client';

import { ElementalIcons } from '@/components/icons/elemental-icons';
import { useEffect, useState } from 'react';

const elements = [
  { name: 'Electric', Icon: ElementalIcons.electric, color: 'text-yellow-400' },
  { name: 'Fiery', Icon: ElementalIcons.fire, color: 'text-red-400' },
  { name: 'Aquatic', Icon: ElementalIcons.water, color: 'text-blue-400' },
  { name: 'Earthly', Icon: ElementalIcons.earth, color: 'text-green-400' },
  { name: 'Airy', Icon: ElementalIcons.air, color: 'text-cyan-400' },
  { name: 'Metallic', Icon: ElementalIcons.metal, color: 'text-gray-400' },
];

export function CalculatingAnimation() {
  const [currentElementIndex, setCurrentElementIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentElementIndex((prev) => (prev + 1) % elements.length);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const currentElement = elements[currentElementIndex];
  const CurrentIcon = currentElement.Icon;

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-8">
        {/* Pulsing background */}
        <div className="absolute inset-0 animate-ping opacity-20">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-r from-primary to-purple-500`} />
        </div>

        {/* Main icon container */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className={`${currentElement.color} transition-all duration-300 transform scale-110`}>
            <CurrentIcon size="5rem" />
          </div>
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 animate-pulse">
        Analyzing Your Energy Signature...
      </h2>

      <p className="text-muted-foreground text-center max-w-md">
        Processing your responses through the <span className="font-semibold gradient-text">{currentElement.name}</span> element
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {elements.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentElementIndex
                ? 'bg-primary scale-125'
                : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
