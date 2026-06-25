import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoaderSkeletonProps {
  isDark?: boolean;
  isLoading?: boolean;
}

export default function LoaderSkeleton({ isDark, isLoading = true }: LoaderSkeletonProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const stages = [
    "Retrieving sources...",
    "Mapping concepts...",
    "Building structure...",
    "Synthesizing sections...",
    "Formatting output...",
    "Almost ready..."
  ];

  useEffect(() => {
    if (!isLoading) return;
    
    // Stage Text Interval
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
    }, 2000);
    
    // Continuous Progress Animation (Moving through time smoothly)
    const startTime = Date.now();
    const duration = 12000; // 12 seconds total for 6 stages
    
    let frameId: number;
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 98); // Cap at 98% until the AI finishes
      setProgress(newProgress);
      if (newProgress < 98) {
        frameId = requestAnimationFrame(updateProgress);
      }
    };
    
    frameId = requestAnimationFrame(updateProgress);
    
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(frameId);
    };
  }, [isLoading, stages.length]);

  if (!isLoading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-bg-base/90 backdrop-blur-2xl"
    >
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-8">
        
        {/* Premium Fluid AI Orb (Apple/OpenAI Voice Mode Aesthetic) */}
        <div className="relative w-40 h-40 mb-16 flex items-center justify-center">
          {/* Base Glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-accent/30 blur-3xl"
          />
          
          {/* Liquid Layer 1 */}
          <motion.div
            animate={{ 
              rotate: 360, 
              borderRadius: ["40% 60% 70% 30%", "30% 70% 40% 60%", "60% 40% 30% 70%", "40% 60% 70% 30%"]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 bg-gradient-to-tr from-accent via-accent/80 to-purple-500 shadow-[0_0_50px_rgba(var(--accent),0.6)] mix-blend-screen"
          />
          
          {/* Liquid Layer 2 (Counter Rotation) */}
          <motion.div
            animate={{ 
              rotate: -360, 
              borderRadius: ["60% 40% 30% 70%", "30% 70% 70% 30%", "70% 30% 40% 60%", "60% 40% 30% 70%"]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 bg-gradient-to-bl from-blue-400 via-accent to-accent/50 opacity-80 mix-blend-screen"
          />
          
          {/* Intense Core Sparkle */}
          <motion.div
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-8 h-8 bg-white rounded-full blur-sm"
          />
        </div>

        {/* Dynamic Stage Text */}
        <div className="h-12 w-full relative flex items-center justify-center mb-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute text-xl font-medium text-text-bright tracking-wide text-center w-full"
            >
              {stages[stageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Smooth Continuous Time-Based Progress Bar */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-semibold text-text-muted uppercase tracking-widest">Processing</span>
            {/* Displaying the exact whole number starting exactly from 0 */}
            <span className="text-lg font-black text-text-bright tabular-nums">{Math.floor(progress)}%</span>
          </div>
          
          <div className="h-3 w-full bg-bg-surface/50 rounded-full overflow-hidden backdrop-blur-sm border border-border-dim shadow-inner">
            <motion.div 
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-accent/80 to-accent rounded-full relative shadow-[0_0_10px_rgba(var(--accent),0.5)]"
            >
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
              />
            </motion.div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
