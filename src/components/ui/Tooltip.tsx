import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function Tooltip({ 
  children, 
  content, 
  position = 'top',
  className
}: { 
  children: React.ReactNode, 
  content: string,
  position?: 'top' | 'bottom' | 'left' | 'right',
  className?: string
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => setIsVisible(true);
  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleTouchStart = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 400); 
  };

  const handleTouchEnd = () => {
    hide();
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div 
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-999 px-2 py-1 shadow-lg bg-text-bright text-bg-base rounded text-[9px] font-black tracking-wider uppercase whitespace-nowrap pointer-events-none before:content-[''] before:absolute",
              positionClasses[position],
              position === 'top' && "before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-text-bright",
              position === 'bottom' && "before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-text-bright"

            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
