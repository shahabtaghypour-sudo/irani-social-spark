import { cn } from "@/lib/utils";

interface AdSlotProps {
  className?: string;
  label?: string;
}

/**
 * Reserved advertising space. Drop your ad network script or a sponsor
 * <a>/<img> in place of the placeholder below.
 */
export function AdSlot({ className, label = "Advertisement" }: AdSlotProps) {
  return (
    <aside
      aria-label={label}
      className={cn(
        "mx-auto flex h-[22px] w-full max-w-5xl items-center justify-center rounded-md border border-dashed border-border bg-muted/30 px-4 text-[9px] uppercase tracking-[0.15em] text-muted-foreground",
        className,
      )}
    >
      {label}
    </aside>
  );
}
