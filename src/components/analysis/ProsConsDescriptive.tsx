import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../../lib/utils";

export function ProsConsDescriptive({ data, isSideBySide }: { data: any[]; isSideBySide?: boolean }) {
  return (
    <div className={cn("grid", isSideBySide ? "grid-cols-2 gap-1 md:gap-2" : "grid-cols-1 gap-6 md:gap-10")}>
      {data.map((opt, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className={cn(
            "bg-bg-panel border-2 md:border-4 border-accent/20 shadow-xl",
            isSideBySide ? "rounded-xl md:rounded-2xl p-1 md:p-2" : "rounded-2xl md:rounded-[2.5rem] p-4 md:p-10"
          )}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-bg-surface shadow-lg">
              <CheckCircle2 size={24} />
            </div>
            <h2 className={cn("font-black text-text-bright tracking-tighter uppercase", isSideBySide ? "text-xl md:text-2xl" : "text-3xl")}>
              {opt.optionName}
            </h2>
          </div>

          <div className={cn("font-medium leading-relaxed text-text-main mb-6 md:mb-10 italic border-l-4 md:border-l-8 border-accent pl-4 md:pl-6 opacity-90", isSideBySide ? "text-xs md:text-sm" : "text-lg")}>
            <ReactMarkdown components={{ p: "span" }}>
              {opt.summary}
            </ReactMarkdown>
          </div>

          <div className={cn("grid", isSideBySide ? "grid-cols-1 gap-1" : "grid-cols-1 md:grid-cols-2 gap-6 md:gap-12")}>
            <div className="space-y-6">
              <h3 className="text-sm font-black text-accent uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" /> Strategic
                Advantages
              </h3>
              <ul className="space-y-4">
                {opt.pros.map((pro: string, idx: number) => (
                  <li
                    key={idx}
                    className={cn(
                      "flex items-start bg-bg-surface border-2 border-accent/5 hover:border-accent/20 transition-all shadow-sm",
                      isSideBySide ? "gap-1 p-1 md:p-2 rounded-lg" : "gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl"
                    )}
                  >
                    <CheckCircle2
                      className="text-accent shrink-0 mt-1"
                      size={18}
                    />
                    <div className="text-sm font-bold text-text-main leading-snug flex-1">
                      <ReactMarkdown components={{ p: "span" }}>
                        {pro}
                      </ReactMarkdown>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-sm font-black text-danger uppercase tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger" /> Potential
                Constraints
              </h3>
              <ul className="space-y-4">
                {opt.cons.map((con: string, idx: number) => (
                  <li
                    key={idx}
                    className={cn(
                      "flex items-start bg-bg-surface border-2 border-danger/5 hover:border-danger/20 transition-all shadow-sm",
                      isSideBySide ? "gap-1 p-1 md:p-2 rounded-lg" : "gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl"
                    )}
                  >
                    <XCircle className="text-danger shrink-0 mt-1" size={18} />
                    <span className="text-sm font-bold text-text-main leading-snug flex-1">
                      <ReactMarkdown components={{ p: "span" }}>
                        {con}
                      </ReactMarkdown>
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