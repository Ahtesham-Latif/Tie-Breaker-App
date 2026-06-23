import React from "react";
import { motion } from "motion/react";
import { Zap } from "lucide-react";

export function AuthWallModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-bg-surface border-4 border-accent rounded-[2rem] p-8 md:p-12 max-w-lg w-full shadow-[0_20px_50px_rgba(117,81,57,0.4)] relative overflow-hidden text-center"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-accent-muted" />
        
        <div className="w-16 h-16 mx-auto bg-danger/20 rounded-2xl flex items-center justify-center text-danger mb-6">
          <Zap size={32} className="animate-pulse" />
        </div>

        <h2 className="text-3xl font-black uppercase tracking-tighter text-text-bright mb-4">
          Free Limit <span className="text-accent">Reached</span>
        </h2>
        
        <p className="text-text-main font-semibold opacity-80 mb-8">
          You've used up your 3 free anonymous decisions! To continue breaking ties and save your decision history, please create a free account.
        </p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-4 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/30 flex items-center justify-center gap-2 group"
          >
            Create Free Account
          </motion.button>
          
          <button
            onClick={onClose}
            className="text-[10px] font-bold uppercase tracking-widest text-text-dim hover:text-accent transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}