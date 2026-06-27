import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Scale as ScaleIcon, X, Trophy } from "lucide-react";
import { cn } from "../../lib/utils";

export function WelcomeModal({ onClose, onOpenAuth }: { onClose: () => void; onOpenAuth: (isSignUp: boolean) => void }) {
  const [phase, setPhase] = React.useState<"neutral" | "analysis" | "decision" | "winner" | "bullets">("neutral");

  React.useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setPhase("bullets");
      return;
    }
    const t1 = setTimeout(() => setPhase("analysis"), 300);
    const t2 = setTimeout(() => setPhase("decision"), 900);
    const t3 = setTimeout(() => setPhase("winner"), 1300);
    const t4 = setTimeout(() => setPhase("bullets"), 1600);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  let rotation = 0;
  if (phase === "decision" || phase === "winner" || phase === "bullets") {
    rotation = -15;
  }
  const leftY = rotation !== 0 ? 15 : 0;
  const rightY = rotation !== 0 ? -15 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-md p-3"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-bg-surface border-4 border-accent/20 rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-[0_20px_50px_rgba(117,81,57,0.3)] relative overflow-hidden flex flex-col max-h-[95vh]"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-accent to-accent-muted" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main bg-bg-panel border border-border-dim rounded-full transition-colors z-10"
        >
          <X size={16} />
        </button>
        
        <div className="flex flex-col items-center text-center space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-1">
          <div className="space-y-1">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-text-bright">
              Welcome to <span className="text-accent underline decoration-2 underline-offset-4 decoration-accent/30">TieBreaker</span> 👋
            </h2>
            <p className="text-sm text-text-main font-semibold">
              Sign in to generate AI verdicts.
            </p>
          </div>

          <div className="relative w-full max-w-[280px] mx-auto flex items-center justify-between gap-3 px-2 py-2">
            <motion.div
              animate={{ y: leftY, scale: (phase === "winner" || phase === "bullets") ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              className={cn(
                "relative z-20 flex-1 bg-bg-panel border-2 rounded-xl p-2 shadow-sm flex flex-col items-center min-w-0 transition-colors",
                (phase === "winner" || phase === "bullets") ? "border-accent shadow-[0_0_15px_rgba(var(--color-accent),0.3)]" : "border-border-dim"
              )}
            >
              <div className={cn(
                "text-[11px] font-black uppercase tracking-wider",
                (phase === "winner" || phase === "bullets") ? "text-text-bright" : "text-text-main"
              )}>
                Option A
              </div>
              <AnimatePresence>
                {(phase === "winner" || phase === "bullets") && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, y: 5 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="bg-accent text-bg-surface px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 mt-1"
                  >
                    <Trophy size={10} /> Winner
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              animate={ phase === "analysis" ? { rotate: [0, -8, 8, -5, 5, 0] } : { rotate: rotation } }
              transition={ phase === "analysis" ? { duration: 0.6, ease: "easeInOut" } : { type: "spring", stiffness: 50, damping: 12 } }
              className="shrink-0 relative z-30"
            >
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-bg-surface shadow-lg shadow-accent/30">
                <ScaleIcon size={24} />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: rightY, opacity: (phase === "winner" || phase === "bullets") ? 0.4 : 1 }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
              className="relative z-20 flex-1 bg-bg-panel border-2 rounded-xl p-2 shadow-sm flex flex-col items-center min-w-0 border-border-dim"
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-text-main">
                Option B
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            {phase === "bullets" && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                className="w-full text-left bg-bg-base/50 p-4 rounded-2xl border border-border-dim overflow-hidden"
              >
                <h3 className="font-black text-xs uppercase tracking-widest text-text-bright mb-3">Why create an account?</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-2 text-[11px] font-semibold text-text-main">
                  <li className="flex gap-2 items-start"><span className="text-accent">•</span> Prevent spam & automated abuse</li>
                  <li className="flex gap-2 items-start"><span className="text-accent">•</span> Protect AI resources</li>
                  <li className="flex gap-2 items-start"><span className="text-accent">•</span> Save to your personal history</li>
                  <li className="flex gap-2 items-start"><span className="text-accent">•</span> Sync decisions across devices</li>
                  <li className="flex gap-2 items-start"><span className="text-accent">•</span> Enable privacy controls</li>
                  <li className="flex gap-2 items-start"><span className="text-accent">•</span> Personalized experience over time</li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="w-full pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenAuth(true);
              }}
              className="w-full py-3 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Sign Up <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest mt-2">
             Already have an account?{" "}
             <button
               onClick={() => {
                  onClose();
                  onOpenAuth(false);
               }}
               className="text-text-main hover:text-accent transition-colors underline underline-offset-2 cursor-pointer"
             >
               Sign In
             </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}