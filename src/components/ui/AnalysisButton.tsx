import React from "react";
import { cn } from "../../lib/utils";

export function AnalysisButton({
  title,
  icon,
  onClick,
  disabled,
  highlight = false,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "p-5 md:p-6 rounded-2xl flex items-center gap-4 transition-all text-left disabled:opacity-30 disabled:cursor-not-allowed group border-4",
        highlight
          ? "bg-accent border-accent text-bg-surface hover:brightness-110 shadow-xl shadow-accent/20 active:scale-95"
          : "bg-bg-panel border-accent/10 text-text-main hover:border-accent hover:shadow-lg active:scale-95",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner",
          highlight ? "bg-white/10" : "bg-accent-muted text-accent",
        )}
      >
        {icon}
      </div>
      <span className="font-black text-xs md:text-sm uppercase tracking-tighter leading-tight">
        {title}
      </span>
    </button>
  );
}