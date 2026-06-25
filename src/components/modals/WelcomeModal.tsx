import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Scale as ScaleIcon } from "lucide-react";

export function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-bg-surface border-4 border-accent/20 rounded-[2rem] p-8 md:p-12 max-w-lg w-full shadow-[0_20px_50px_rgba(117,81,57,0.3)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-accent-muted" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          <motion.div 
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 12, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-bg-surface shadow-lg shadow-accent/40"
          >
            <ScaleIcon size={32} />
          </motion.div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase tracking-tighter text-text-bright">
              Thanks for Joining <br/><span className="text-accent underline decoration-4 underline-offset-4 decoration-accent/30">The TieBreaker</span>
            </h2>
            <p className="text-text-main font-semibold opacity-80">
              Your account is successfully created! Stop guessing and start deciding with our powerful mathematical engine.
            </p>
          </div>

          <div className="w-full space-y-3 text-left bg-bg-base/50 p-6 rounded-2xl border border-border-dim">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-bg-surface flex items-center justify-center text-xs font-black">1</span>
              <span className="text-sm font-bold text-text-main">Enter your Contenders (Option A vs B)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-bg-surface flex items-center justify-center text-xs font-black">2</span>
              <span className="text-sm font-bold text-text-main">Add optional comparison factors</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-bg-surface flex items-center justify-center text-xs font-black">3</span>
              <span className="text-sm font-bold text-text-main">Let AI generate structured matrices</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full py-4 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/30 flex items-center justify-center gap-2 group mt-4"
          >
            Let's Go <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}