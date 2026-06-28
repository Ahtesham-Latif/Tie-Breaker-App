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
        <table key={fIdx} className={cn(
          "w-full table-fixed bg-bg-panel border-2 md:border-4 border-accent/20 shadow-lg hover:border-accent/40 transition-colors border-separate border-spacing-2",
          isSideBySide ? "rounded-xl md:rounded-2xl p-1 md:p-2" : "rounded-xl md:rounded-2xl p-2 md:p-4"
        )}>
          <thead className="block w-full">
            <tr className="block w-full">
              <th className="block w-full text-left text-sm font-black text-accent uppercase tracking-[0.2em] mb-4 pb-2 border-b-2 border-accent/10">
                {factor}
              </th>
            </tr>
          </thead>
          <tbody className={cn(isSideBySide ? "table-row-group" : "block md:table-row-group")}>
            <tr className={cn(isSideBySide ? "table-row" : "block md:table-row")}>
            {data.comparison.map((opt, oIdx) => (
              <td key={oIdx} className={cn(
                "align-top min-w-0 bg-bg-surface border-2 border-accent/5 shadow-sm block max-[480px]:block",
                isSideBySide ? "md:table-cell rounded-lg p-1" : "md:table-cell rounded-lg md:rounded-xl p-2 md:p-3",
                !isSideBySide && "mb-3 md:mb-0"
              )}>
                <span className="text-[clamp(10px,1.0vw,18px)] font-black uppercase text-text-dim/70 mb-2 block tracking-wider">
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
              </td>
            ))}
            </tr>
          </tbody>
        </table>
      ))}
    </div>
  );
}