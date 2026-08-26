"use client";

import { cn } from "@/lib/utils";

type ProgressRingProps = {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  empty?: boolean;
  className?: string;
};

export function ProgressRing({
  percent,
  size = 48,
  strokeWidth = 3.5,
  color = "var(--osmo-accent)",
  empty = false,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = empty ? 0 : Math.max(0, Math.min(100, Math.round(percent)));
  const offset = circumference - (clamped / 100) * circumference;
  const label = empty ? "—" : `${clamped}%`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--osmo-border)"
        strokeWidth={strokeWidth}
      />
      {!empty ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ) : null}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="var(--osmo-text)"
        fillOpacity={0.85}
        className="text-[9px] font-medium"
      >
        {label}
      </text>
    </svg>
  );
}
