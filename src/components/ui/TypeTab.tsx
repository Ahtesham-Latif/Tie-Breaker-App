import React from "react";
import { cn } from "../../lib/utils";

export function TypeTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 md:px-6 py-2 md:py-3 rounded-xl text-[clamp(10px,1.0vw,18px)] md:text-xs font-black transition-all uppercase tracking-widest border-2",
        active
          ? "bg-accent text-bg-surface border-accent shadow-md shadow-accent/20"
          : "bg-bg-panel text-accent border-transparent hover:bg-accent-muted",
      )}
    >
      {label}
    </button>
  );
}