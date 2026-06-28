import React from "react";
import { motion } from "motion/react";
import { Zap, CheckCircle2, X, Crown } from "lucide-react";

interface PricingModalProps {
  onClose: () => void;
  onClaim?: () => void;
}

export function PricingModal({ onClose, onClaim }: PricingModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 flex-wrap min-w-0"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-bg-surface border-4 border-accent rounded-[2rem] p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl shadow-accent/20 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1 text-text-dim hover:text-text-bright transition-colors z-10"
        >
          <X size={24} />
        </button>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-accent-muted rounded-t-2xl" />
        
        <div className="text-center mb-8 mt-2">
          <div className="inline-flex px-3 py-1 bg-accent/10 text-accent rounded-full text-[clamp(10px,1.0vw,18px)] font-black uppercase tracking-widest mb-4 border border-accent/20">
            Limit Reached
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-text-bright mb-4">
            Level Up to <span className="text-accent">Pro</span>
          </h2>
          <p className="text-text-main font-semibold opacity-80 text-sm max-w-sm mx-auto">
            You crushed 15 free ties: either you hit the ceiling, or you love this enough to go all in. Either way, you're exactly where you need to be. ⚡
          </p>
        </div>

        <div className="bg-bg-panel border-2 border-amber-500/30 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="absolute top-0 right-0 bg-amber-500 text-bg-surface px-4 py-1 rounded-bl-xl font-black uppercase tracking-widest text-[clamp(10px,1.0vw,18px)] shadow-sm flex items-center gap-1.5 flex-wrap min-w-0">
            <Crown size={12} className="animate-pulse" /> Pro
          </div>
          <h3 className="text-xl font-black text-text-bright uppercase tracking-tight mb-2">Pro Plan</h3>
          <div className="flex items-baseline gap-2 mb-6 flex-wrap min-w-0">
            <span className="text-4xl font-black text-amber-500">$0</span>
            <span className="text-sm font-bold text-text-dim uppercase tracking-wider">/ month</span>
            <span className="ml-2 text-[clamp(10px,1.0vw,18px)] font-black text-amber-600 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              (Free for now!)
            </span>
          </div>

          <ul className="space-y-3">
            {[
              "Unlimited AI Tie-Breakers",
              "Early access to Deep Mode (Resource Validation, Mermaid Charts)",
              "Save & History Tracking",
              "Privacy Mode (Ghost Mode)"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm font-bold text-text-main flex-wrap min-w-0">
                <CheckCircle2 size={18} className="text-amber-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <motion.button
          onClick={onClaim || onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-accent/30 flex items-center justify-center gap-2 group flex-wrap min-w-0"
        >
          <Zap size={18} className="group-hover:animate-pulse" /> Claim Free Pro Access
        </motion.button>
        
        <p className="text-center mt-4 text-[clamp(10px,1.0vw,18px)] font-bold text-text-dim uppercase tracking-widest opacity-60">
          No credit card required. Early access perk.
        </p>

      </motion.div>
    </motion.div>
  );
}
