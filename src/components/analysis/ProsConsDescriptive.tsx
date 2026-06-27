import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { MarkdownText } from "../ui/MarkdownText";
import { cn } from "../../lib/utils";

export function ProsConsDescriptive({ data, isSideBySide }: { data: any[]; isSideBySide?: boolean }) {
  return (
    <div className={cn("grid", isSideBySide ? "grid-cols-2 gap-1 md:gap-2" : "grid-cols-1 gap-4")}>
      {data.map((opt, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "bg-bg-panel border-2 border-accent/20 shadow-xl",
            isSideBySide ? "rounded-xl md:rounded-2xl p-1 md:p-2" : "rounded-xl p-3 md:p-4"
          )}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-bg-surface shadow-lg">
              <CheckCircle2 size={20} />
            </div>
            <h2 className={cn("font-black text-text-bright tracking-tighter uppercase break-words min-w-0 flex-1", isSideBySide ? "text-lg md:text-xl" : "text-2xl")}>
              {opt.optionName}
            </h2>
          </div>

          {opt.summary && (
            <div className={cn("font-medium leading-relaxed text-text-main mb-4 italic border-l-4 border-accent pl-4 opacity-90", isSideBySide ? "text-xs" : "text-sm md:text-base")}>
              <MarkdownText>
                {opt.summary}
              </MarkdownText>
            </div>
          )}

          <div className={cn("grid", isSideBySide ? "grid-cols-1 gap-1" : "grid-cols-1 md:grid-cols-2 gap-4")}>
            <div className="space-y-3">
              <h3 className="text-sm font-black text-accent uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Strategic
                Advantages
              </h3>
              <ul className="space-y-2">
                {opt.pros.map((pro: string, idx: number) => (
                  <li
                    key={idx}
                    className={cn(
                      "flex items-start bg-bg-surface border-2 border-accent/5 hover:border-accent/20 transition-all shadow-sm rounded-lg",
                      isSideBySide ? "gap-1 p-1 md:p-2 rounded-lg" : "gap-3 py-2 px-3"
                    )}
                  >
                    <CheckCircle2
                      className="text-accent shrink-0 mt-0.5"
                      size={16}
                    />
                    <div className="text-sm font-bold text-text-main leading-snug flex-1">
                      <MarkdownText>
                        {pro}
                      </MarkdownText>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-black text-danger uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-danger" /> Potential
                Constraints
              </h3>
              <ul className="space-y-2">
                {opt.cons.map((con: string, idx: number) => (
                  <li
                    key={idx}
                    className={cn(
                      "flex items-start bg-bg-surface border-2 border-danger/5 hover:border-danger/20 transition-all shadow-sm rounded-lg",
                      isSideBySide ? "gap-1 p-1 md:p-2 rounded-lg" : "gap-3 py-2 px-3"
                    )}
                  >
                    <XCircle className="text-danger shrink-0 mt-0.5" size={16} />
                    <span className="text-sm font-bold text-text-main leading-snug flex-1">
                      <MarkdownText>
                        {con}
                      </MarkdownText>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}