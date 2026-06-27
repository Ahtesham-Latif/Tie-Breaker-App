import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Scale as ScaleIcon, Trophy } from "lucide-react";
import { cn } from "../../lib/utils";

interface VerdictAnimationProps {
  data: {
    winner: string;
    entities?: string[];
  };
  onComplete: () => void;
}

export function VerdictAnimation({ data, onComplete }: VerdictAnimationProps) {
  const [phase, setPhase] = useState<"neutral" | "analysis" | "decision" | "winner">("neutral");

  const a = data.entities && data.entities.length > 0 ? data.entities[0] : "Option A";
  const b = data.entities && data.entities.length > 1 ? data.entities[1] : "Option B";
  
  const winnerName = data.winner?.toLowerCase() || "";
  
  const aWins = winnerName.includes(a.toLowerCase());
  const bWins = winnerName.includes(b.toLowerCase());
  
  const winnerSide = bWins && !aWins ? "right" : "left";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => {
      setPhase("analysis");
    }, 400);

    const t2 = setTimeout(() => {
      setPhase("decision");
    }, 1200);

    const t3 = setTimeout(() => {
      setPhase("winner");
    }, 2000);

    const t4 = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, prefersReducedMotion]);

  // Wobble animation during analysis, then tilt towards winner
  let rotation = 0;
  if (phase === "analysis") {
    // We let Framer Motion handle the wobble via keyframes below
    rotation = 0; 
  } else if (phase === "decision" || phase === "winner") {
    rotation = winnerSide === "left" ? -15 : 15;
  }

  const leftY = (phase === "decision" || phase === "winner") ? (winnerSide === "left" ? 30 : -30) : 0;
  const rightY = (phase === "decision" || phase === "winner") ? (winnerSide === "right" ? 30 : -30) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="max-w-3xl mx-auto min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center p-2 md:p-8 relative overflow-hidden w-full"
    >
      <div className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-accent/60 mb-8 md:mb-12 animate-pulse text-center">
        {phase === "neutral" || phase === "analysis" ? "Weighing the Decision..." : "The Verdict is In"}
      </div>

      <div className="relative w-full max-w-lg flex items-center justify-between gap-2 md:gap-8 px-2 md:px-0">
        
        {/* Left Contender */}
        <motion.div
          animate={{ 
            y: leftY, 
            opacity: phase === "winner" && winnerSide !== "left" ? 0.4 : 1,
            scale: phase === "winner" && winnerSide === "left" ? 1.05 : 1
          }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className={cn(
            "relative z-20 flex-1 bg-bg-panel border-2 rounded-xl md:rounded-2xl p-3 md:p-5 shadow-xl flex flex-col items-center gap-2 md:gap-3 transition-colors duration-500 min-w-0",
            phase === "winner" && winnerSide === "left" ? "border-accent shadow-[0_0_30px_rgba(var(--color-accent),0.3)]" : "border-border-dim"
          )}
        >
          <div className={cn(
            "text-xs md:text-base font-bold text-center line-clamp-3 break-words w-full",
            phase === "winner" && winnerSide === "left" ? "text-text-bright" : "text-text-main"
          )}>
            {a}
          </div>
          <AnimatePresence>
            {phase === "winner" && winnerSide === "left" && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-accent text-bg-surface px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 mt-2"
              >
                <Trophy size={14} /> Winner
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Center Logo (The Scale) */}
        <motion.div
          animate={
            phase === "analysis" 
              ? { rotate: [0, -8, 8, -5, 5, 0] } 
              : { rotate: rotation, scale: phase === "winner" ? 1.1 : 1 }
          }
          transition={
            phase === "analysis" 
              ? { duration: 0.8, ease: "easeInOut" }
              : { type: "spring", stiffness: 50, damping: 12, mass: 1.5 }
          }
          className="shrink-0 relative z-30"
        >
          <div className="w-14 h-14 md:w-28 md:h-28 bg-accent rounded-xl md:rounded-3xl flex items-center justify-center text-bg-surface shadow-2xl shadow-accent/30">
            <ScaleIcon size={32} className="w-8 h-8 md:w-16 md:h-16" strokeWidth={2.5} />
          </div>
          
          {/* Subtle glow behind logo */}
          <motion.div 
            animate={{ opacity: phase === "winner" ? 0.8 : 0.2 }}
            className="absolute inset-0 bg-accent blur-xl md:blur-2xl -z-10 rounded-full" 
          />
        </motion.div>

        {/* Right Contender */}
        <motion.div
          animate={{ 
            y: rightY, 
            opacity: phase === "winner" && winnerSide !== "right" ? 0.4 : 1,
            scale: phase === "winner" && winnerSide === "right" ? 1.05 : 1
          }}
          transition={{ type: "spring", stiffness: 50, damping: 15 }}
          className={cn(
            "relative z-20 flex-1 bg-bg-panel border-2 rounded-xl md:rounded-2xl p-3 md:p-5 shadow-xl flex flex-col items-center gap-2 md:gap-3 transition-colors duration-500 min-w-0",
            phase === "winner" && winnerSide === "right" ? "border-accent shadow-[0_0_30px_rgba(var(--color-accent),0.3)]" : "border-border-dim"
          )}
        >
          <div className={cn(
            "text-xs md:text-base font-bold text-center line-clamp-3 break-words w-full",
            phase === "winner" && winnerSide === "right" ? "text-text-bright" : "text-text-main"
          )}>
            {b}
          </div>
          <AnimatePresence>
            {phase === "winner" && winnerSide === "right" && (
              <motion.div
                initial={{ scale: 0, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-accent text-bg-surface px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 mt-2"
              >
                <Trophy size={14} /> Winner
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </motion.div>
  );
}
