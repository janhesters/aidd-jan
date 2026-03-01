import { cn } from "@workspace/ui/lib/utils";
import type { ComponentProps } from "react";

type FullWidthDividerProps = ComponentProps<"div"> & {
  contained?: boolean;
  position?: "bottom" | "top";
};

function FullWidthDivider({
  className,
  contained = false,
  position,
  ...props
}: FullWidthDividerProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-border pointer-events-none absolute h-px",
        "data-[contained=false]:left-1/2 data-[contained=false]:w-screen data-[contained=false]:-translate-x-1/2",
        "data-[contained=true]:inset-x-0 data-[contained=true]:w-full",
        position &&
          "data-[position=bottom]:-bottom-px data-[position=top]:-top-px",
        className,
      )}
      data-contained={contained}
      data-position={position}
      {...props}
    />
  );
}

export { FullWidthDivider };
