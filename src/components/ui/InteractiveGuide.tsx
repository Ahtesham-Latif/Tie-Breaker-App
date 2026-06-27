import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { AnalysisType } from "../../types";

interface InteractiveGuideProps {
  activeType: AnalysisType;
  onSelectType: (type: AnalysisType) => void;
}

const GUIDE_ITEMS = [
  {
    type: "pros-cons" as AnalysisType,
    icon: "💡",
    title: "Pros & Cons",
    desc: "Quick trade-offs"
  },
  {
    type: "comparison" as AnalysisType,
    icon: "⚖️",
    title: "Comparison",
    desc: "Key differences"
  },
  {
    type: "swot" as AnalysisType,
    icon: "📈",
    title: "SWOT",
    desc: "Long-term strategy"
  },
  {
    type: "verdict" as AnalysisType,
    icon: "🏆",
    title: "Verdict",
    desc: "Final recommendation"
  }
];

export function InteractiveGuide({ activeType, onSelectType }: InteractiveGuideProps) {
  return (
    <div className="w-full bg-bg-panel border border-border-dim rounded-2xl p-3 mb-4 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-3">
      <div className="flex items-center gap-2 shrink-0 md:w-32 lg:w-48 pl-1">
        <span className="text-lg leading-none">🧠</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted leading-tight">
          How to read<br/>your analysis
        </span>
      </div>
      
      <div className="flex flex-col md:flex-row w-full gap-2">
        {GUIDE_ITEMS.map((item) => {
          const isActive = activeType === item.type;
          return (
            <motion.button
              key={item.type}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectType(item.type)}
              className={cn(
                "flex-1 flex items-center md:items-start md:flex-col gap-3 md:gap-1 p-2 md:p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group",
                isActive 
                  ? "bg-bg-surface border-accent shadow-md shadow-accent/10" 
                  : "bg-bg-surface/50 border-transparent hover:border-accent/30 hover:bg-bg-surface"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeGuideGlow"
                  className="absolute inset-0 bg-linear-to-b from-accent/10 to-transparent pointer-events-none"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="flex items-center gap-2 relative z-10 min-w-[120px] md:min-w-0">
                <span className="text-base md:text-lg opacity-90 group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-wider",
                  isActive ? "text-accent" : "text-text-main"
                )}>
                  {item.title}
                </span>
              </div>
              <span className={cn(
                "text-[10px] font-bold relative z-10 leading-tight",
                isActive ? "text-text-main" : "text-text-muted"
              )}>
                {item.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
