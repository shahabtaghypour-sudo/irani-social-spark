import { cn } from "@/lib/utils";

export function DollIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
    >
      {/* Face */}
      <circle cx="12" cy="11" r="6" />
      {/* Eyes */}
      <circle cx="9.5" cy="10.5" r="0.9" fill="currentColor" />
      <circle cx="14.5" cy="10.5" r="0.9" fill="currentColor" />
      {/* Blush */}
      <ellipse cx="8.8" cy="12.8" rx="1.1" ry="0.6" opacity="0.5" />
      <ellipse cx="15.2" cy="12.8" rx="1.1" ry="0.6" opacity="0.5" />
      {/* Smile */}
      <path d="M10 14c.6.6 1.4.9 2 .9s1.4-.3 2-.9" />
      {/* Hair / bow loops */}
      <path d="M6 7c-1.5 1-2.5 2.5-2.5 4.5S5.5 18 12 18s8.5-3.5 8.5-6.5S19.5 8 18 7" />
      <path d="M6 7c1-2 3-3 6-3s5 1 6 3" />
      {/* Bow knot */}
      <circle cx="12" cy="4" r="1.2" fill="currentColor" />
      <path d="M10.8 4c-1.5-.5-3-.2-3.5.5s.3 1.8 1.8 2c1.2.2 2.2-.5 2.5-1" />
      <path d="M13.2 4c1.5-.5 3-.2 3.5.5s-.3 1.8-1.8 2c-1.2.2-2.2-.5-2.5-1" />
    </svg>
  );
}
