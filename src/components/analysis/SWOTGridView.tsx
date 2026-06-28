import React from "react";
import { MarkdownText } from "../ui/MarkdownText";
import { cn } from "../../lib/utils";

export function SWOTGridView({ data, isSideBySide }: { data: any[]; isSideBySide?: boolean }) {
  return (
    <div className={cn("grid", isSideBySide ? "grid-cols-2 gap-1 md:gap-2" : "grid-cols-1 gap-8 md:gap-16")}>
      {data.map((opt, i) => (
        <div key={i} className="space-y-8">
          <div className="flex items-center gap-4 flex-wrap min-w-0">
            <div className="px-6 py-2 bg-accent text-bg-surface font-black rounded-3xl text-sm uppercase tracking-widest shadow-lg shrink break-words min-w-0 text-center">
              {opt.optionName}
            </div>
            <div className="flex-1 h-1 bg-accent/10 rounded-full" />
          </div>

          <div className={cn("grid", isSideBySide ? "grid-cols-1 gap-1 md:gap-2" : "grid-cols-1 md:grid-cols-2 gap-3 md:gap-4")}>
            <div className={cn(
              "bg-bg-panel border-2 md:border-4 border-accent shadow-xl hover:scale-[1.02] transition-transform",
              isSideBySide ? "rounded-xl md:rounded-2xl p-1 md:p-2" : "rounded-xl md:rounded-2xl p-2 md:p-4"
            )}>
              <div className="flex items-center justify-between mb-4 flex-wrap min-w-0">
                <span className="text-[clamp(10px,1.0vw,18px)] font-black uppercase tracking-[0.3em] text-accent">
                  Strengths
                </span>
                <span className="text-4xl font-black text-accent/20">S</span>
              </div>
              <ul className="space-y-2">
                {opt.strengths.map((s: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-accent pl-3"
                  >
                    <MarkdownText>
                      {s}
                    </MarkdownText>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn(
              "bg-bg-panel border-2 md:border-4 border-danger shadow-xl hover:scale-[1.02] transition-transform",
              isSideBySide ? "rounded-xl md:rounded-2xl p-1 md:p-2" : "rounded-xl md:rounded-2xl p-2 md:p-4"
            )}>
              <div className="flex items-center justify-between mb-4 flex-wrap min-w-0">
                <span className="text-[clamp(10px,1.0vw,18px)] font-black uppercase tracking-[0.3em] text-danger">
                  Weaknesses
                </span>
                <span className="text-4xl font-black text-danger/20">W</span>
              </div>
              <ul className="space-y-2">
                {opt.weaknesses.map((w: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-danger pl-3"
                  >
                    <MarkdownText>
                      {w}
                    </MarkdownText>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn(
              "bg-bg-panel border-2 md:border-4 border-accent shadow-xl hover:scale-[1.02] transition-transform",
              isSideBySide ? "rounded-xl md:rounded-2xl p-1 md:p-2" : "rounded-xl md:rounded-2xl p-2 md:p-4"
            )}>
              <div className="flex items-center justify-between mb-4 flex-wrap min-w-0">
                <span className="text-[clamp(10px,1.0vw,18px)] font-black uppercase tracking-[0.3em] text-accent">
                  Opportunities
                </span>
                <span className="text-4xl font-black text-accent/20">O</span>
              </div>
              <ul className="space-y-2">
                {opt.opportunities.map((o: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-accent pl-3"
                  >
                    <MarkdownText>
                      {o}
                    </MarkdownText>
                  </li>
                ))}
              </ul>
            </div>
            <div className={cn(
              "bg-bg-panel border-2 md:border-4 border-danger shadow-xl hover:scale-[1.02] transition-transform",
              isSideBySide ? "rounded-xl md:rounded-2xl p-1 md:p-2" : "rounded-xl md:rounded-2xl p-2 md:p-4"
            )}>
              <div className="flex items-center justify-between mb-4 flex-wrap min-w-0">
                <span className="text-[clamp(10px,1.0vw,18px)] font-black uppercase tracking-[0.3em] text-danger">
                  Threats
                </span>
                <span className="text-4xl font-black text-danger/20">T</span>
              </div>
              <ul className="space-y-2">
                {opt.threats.map((t: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-danger pl-3"
                  >
                    <MarkdownText>
                      {t}
                    </MarkdownText>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}