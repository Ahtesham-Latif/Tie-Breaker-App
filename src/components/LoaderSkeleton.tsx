import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuotes, Quote } from '../hooks/useQuotes';

interface LoaderSkeletonProps {
  isDark?: boolean;
  isLoading?: boolean;
  startTime?: number;
  myCase?: string;
}

export default function LoaderSkeleton({ isDark, isLoading = true, startTime: initialStartTime, myCase }: LoaderSkeletonProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  
  const { getRandomQuotes } = useQuotes();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quotesRef = useRef<Quote[]>([]);

  const stages = [
    "Retrieving sources...",
    "Mapping concepts...",
    "Building structure...",
    "Synthesizing sections...",
    "Formatting output...",
    "Almost ready..."
  ];

  useEffect(() => {
    if (myCase) {
      quotesRef.current = getRandomQuotes(20, myCase);
      setQuotes(quotesRef.current);
    } else {
      quotesRef.current = getRandomQuotes(20);
      setQuotes(quotesRef.current);
    }
  }, [myCase]);

  useEffect(() => {
    if (quotes.length === 0) return;
    const interval = setInterval(() => {
      setQuoteIndex(i => (i + 1) % quotes.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [quotes]);

  useEffect(() => {
    if (!isLoading) return;
    
    const startTime = initialStartTime || Date.now();
    const duration = 12000; // 12 seconds total for 6 stages
    const stageDuration = 2000;
    
    let frameId: number;
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 98); // Cap at 98% until the AI finishes
      
      const currentStageIndex = Math.min(Math.floor(elapsed / stageDuration), stages.length - 1);
      
      setProgress(newProgress);
      setStageIndex(currentStageIndex);
      
      if (newProgress < 98) {
        frameId = requestAnimationFrame(updateProgress);
      } else {
        // Keep checking to ensure stage updates if elapsed < duration
        if (elapsed < duration) {
          frameId = requestAnimationFrame(updateProgress);
        }
      }
    };
    
    frameId = requestAnimationFrame(updateProgress);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isLoading, initialStartTime, stages.length]);

  if (!isLoading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-bg-base/90 backdrop-blur-2xl flex-wrap min-w-0"
    >
      {/* Central Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-8 flex-wrap min-w-0">
        
        {/* Premium Fluid AI Orb (Minimized) */}
        <div className="relative w-12 h-12 mb-4 flex items-center justify-center opacity-70 flex-wrap min-w-0">
          {/* Base Glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-accent/30 blur-xl"
          />
          
          {/* Liquid Layer 1 */}
          <motion.div
            animate={{ 
              rotate: 360, 
              borderRadius: ["40% 60% 70% 30%", "30% 70% 40% 60%", "60% 40% 30% 70%", "40% 60% 70% 30%"]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-1 bg-gradient-to-tr from-accent via-accent/80 to-purple-500 shadow-[0_0_20px_rgba(var(--accent),0.6)] mix-blend-screen"
          />
          
          {/* Liquid Layer 2 (Counter Rotation) */}
          <motion.div
            animate={{ 
              rotate: -360, 
              borderRadius: ["60% 40% 30% 70%", "30% 70% 70% 30%", "70% 30% 40% 60%", "60% 40% 30% 70%"]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 bg-gradient-to-bl from-blue-400 via-accent to-accent/50 opacity-80 mix-blend-screen"
          />
          
          {/* Intense Core Sparkle */}
          <motion.div
            animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-2.5 h-2.5 bg-white rounded-full blur-[1px]"
          />
        </div>

        {/* Dynamic Stage Text (Minimized) */}
        <div className="h-6 w-full relative flex items-center justify-center mb-4 flex-wrap min-w-0">
          <AnimatePresence mode="wait">
            <motion.p
              key={stageIndex}
              initial={{ opacity: 0, y: 5, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -5, filter: "blur(2px)" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute text-xs font-semibold text-text-dim tracking-wider text-center w-full uppercase"
            >
              {stages[stageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Smooth Continuous Time-Based Progress Bar (Minimized) */}
        <div className="w-full max-w-full max-w-[min(200px,100vw)] min-w-0 flex flex-col gap-1.5 opacity-60 flex-wrap">
          <div className="flex justify-between items-center px-1 flex-wrap min-w-0">
            <span className="text-[clamp(10px,0.9vw,17px)] font-bold text-text-muted uppercase tracking-widest">Processing</span>
            <span className="text-[clamp(10px,1.0vw,18px)] font-black text-text-bright tabular-nums">{Math.floor(progress)}%</span>
          </div>
          
          <div className="h-1 w-full bg-bg-surface/50 rounded-full overflow-hidden backdrop-blur-sm border border-border-dim shadow-inner">
            <motion.div 
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-accent/80 to-accent rounded-full relative shadow-[0_0_5px_rgba(var(--accent),0.5)]"
            >
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
              />
            </motion.div>
          </div>
        </div>

        {/* Dynamic Quotes (Maximized & Emphasized) */}
        {quotes.length > 0 && (
          <div className="min-h-[160px] w-full flex items-center justify-center mt-12 px-2 sm:px-6 flex-wrap min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center text-center w-full max-w-lg flex-wrap min-w-0"
              >
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-text-bright italic leading-snug mb-5">"{quotes[quoteIndex].text}"</p>
                <p className="text-[clamp(10px,1.1vw,19px)] sm:text-[clamp(10px,1.2vw,20px)] md:text-sm font-black text-accent uppercase tracking-[0.25em]">— {quotes[quoteIndex].author}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

      </div>
    </motion.div>
  );
}
