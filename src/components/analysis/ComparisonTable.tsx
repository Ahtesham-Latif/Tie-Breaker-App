import React from "react";
import { MarkdownText } from "../ui/MarkdownText";

import { cn } from "../../lib/utils";

export function ComparisonTable({
  data,
  isSideBySide,
}: {
  data: { factors: string[]; comparison: any[] };
  isSideBySide?: boolean;
}) {
  return (
    <div className="space-y-6 md:space-y-8">
      {data.factors.map((factor, fIdx) => (
        <div key={fIdx} className={cn(
          "bg-bg-panel border-2 md:border-4 border-accent/20 shadow-lg hover:border-accent/40 transition-colors",
          isSideBySide ? "rounded-xl md:rounded-2xl p-1 md:p-2" : "rounded-xl md:rounded-2xl p-2 md:p-4"
        )}>
          <h3 className="text-sm font-black text-accent uppercase tracking-[0.2em] mb-4 pb-2 border-b-2 border-accent/10">
            {factor}
          </h3>
          <div className={cn("flex", isSideBySide ? "flex-row gap-1 md:gap-2" : "flex-col md:flex-row gap-3 md:gap-6")}>
            {data.comparison.map((opt, oIdx) => (
              <div key={oIdx} className={cn(
                "flex-1 bg-bg-surface border-2 border-accent/5 shadow-sm",
                isSideBySide ? "rounded-lg p-1" : "rounded-lg md:rounded-xl p-2 md:p-3"
              )}>
                <span className="text-[10px] font-black uppercase text-text-dim/70 mb-2 block tracking-wider">
                  {opt.optionName}
                </span>
                <div className="text-sm font-bold text-text-main leading-snug">
                  <MarkdownText>
                    {(() => {
                      if (Array.isArray(opt.values)) return opt.values[fIdx];
                      if (!opt.values) return "";
                      const exact = opt.values[factor];
                      if (exact) return exact;
                      // Case-insensitive fallback
                      const key = Object.keys(opt.values).find(k => k.toLowerCase() === factor.toLowerCase());
                      return key ? opt.values[key] : "";
                    })()}
                  </MarkdownText>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}