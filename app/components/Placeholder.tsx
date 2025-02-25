interface PlaceholderProps {
  className?: string;
  pattern?: 'dots' | 'lines' | 'grid';
}

export function Placeholder({ className = '', pattern = 'dots' }: PlaceholderProps) {
  const patterns = {
    dots: (
      <pattern
        id="dots"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3" />
      </pattern>
    ),
    lines: (
      <pattern
        id="lines"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <line
          x1="0"
          y1="20"
          x2="20"
          y2="0"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </pattern>
    ),
    grid: (
      <pattern
        id="grid"
        x="0"
        y="0"
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <rect
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </pattern>
    ),
  };

  return (
    <svg
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>{patterns[pattern]}</defs>
      <rect width="100" height="100" fill={`url(#${pattern})`} />
      <rect
        width="100"
        height="100"
        fill="currentColor"
        opacity="0.05"
      />
    </svg>
  );
} 