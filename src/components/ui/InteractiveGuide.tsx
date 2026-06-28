import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";
import { AnalysisType } from "../../types";
import { X, Info } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <div className="w-full flex justify-end mb-2 flex-wrap min-w-0">
        <button 
          onClick={() => setIsOpen(true)}
          className="px-2 py-1 rounded-md border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors text-[clamp(10px,0.9vw,17px)] font-black uppercase tracking-widest text-accent flex items-center gap-1.5 flex-wrap min-w-0"
        >
          <Info size={12} /> Use Case Guide
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="w-full bg-bg-panel border border-border-dim rounded-lg p-1 mb-2 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-1 relative pr-6 flex-wrap min-w-0"
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-1.5 right-1.5 text-text-muted hover:text-danger transition-colors p-0.5 rounded-full hover:bg-danger/10"
        >
          <X size={12} />
        </button>
        <div className="flex items-center gap-1 shrink-0 md:w-24 lg:w-32 pl-0.5 flex-wrap min-w-0">
          <span className="text-xs leading-none">🧠</span>
          <span className="text-[clamp(10px,0.6vw,14px)] font-black uppercase tracking-widest text-text-muted leading-tight">
            How to read<br/>your analysis
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row w-full gap-2 flex-wrap min-w-0">
          {GUIDE_ITEMS.map((item) => {
            const isActive = activeType === item.type;
            return (
              <motion.button
                key={item.type}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectType(item.type)}
                className={cn(
                  "flex-1 flex items-center md:items-start md:flex-col gap-1 md:gap-0.5 p-0.5 md:p-1 rounded-md border text-left transition-all duration-300 relative overflow-hidden group",
                  isActive 
                    ? "bg-bg-surface border-accent shadow-sm shadow-accent/10" 
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
                <div className="flex items-center gap-1 relative z-10 min-w-full max-w-[min(80px,100vw)] min-w-0 md:min-w-0 flex-wrap">
                  <span className="text-[clamp(10px,1.0vw,18px)] md:text-xs opacity-90 group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className={cn(
                    "text-[clamp(10px,0.6vw,14px)] font-black uppercase tracking-wider",
                    isActive ? "text-accent" : "text-text-main"
                  )}>
                    {item.title}
                  </span>
                </div>
                <span className={cn(
                  "text-[clamp(10px,0.5vw,13px)] font-bold relative z-10 leading-tight",
                  isActive ? "text-text-main" : "text-text-muted"
                )}>
                  {item.desc}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
