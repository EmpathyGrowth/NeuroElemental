import { cn } from "@/lib/utils";

interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  strokeOpacity?: number;
  className?: string;
}

export function GridPattern({
  width = 40,
  height = 40,
  strokeOpacity = 0.03,
  className,
  ...props
}: GridPatternProps) {
  return (
    <svg
      className={cn("absolute inset-0 w-full h-full pointer-events-none", className)}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${width / 4} 0 L 0 0 0 ${height / 4}`}
            fill="none"
            stroke="currentColor"
            strokeOpacity={strokeOpacity}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
}
