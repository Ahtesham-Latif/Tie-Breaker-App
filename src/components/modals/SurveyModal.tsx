import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, MessageSquare, Send, X, CheckCircle } from "lucide-react";
import { supabase } from "../../db/supabase";
import { useAuth } from "../../context/AuthContext";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurveyModal({ isOpen, onClose }: SurveyModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;
    
    setIsSubmitting(true);
    
    // Insert into Supabase 'reviews' table
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id,
      rating,
      feedback: feedback.trim() || null
    });

    setIsSubmitting(false);
    
    if (!error) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        // Reset state after animation finishes
        setTimeout(() => {
          setIsSuccess(false);
          setRating(0);
          setFeedback("");
        }, 500);
      }, 2000);
    } else {
      console.error("Failed to submit review:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-bg-surface border-2 border-border-dim rounded-[2rem] p-8 md:p-10 max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent to-accent-muted" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 text-text-dim hover:text-danger hover:rotate-90 transition-all duration-300"
            >
              <X size={20} />
            </button>

            {isSuccess ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center text-center py-8"
              >
                <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-widest text-text-bright mb-2">Thank You!</h2>
                <p className="text-text-muted text-sm font-semibold">Your feedback helps us make smarter decisions.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-text-bright mb-2">
                    How was your <span className="text-accent">Verdict?</span>
                  </h2>
                  <p className="text-text-muted text-xs font-semibold leading-relaxed">
                    Did this analysis help you break your tie? Rate your experience.
                  </p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star 
                        size={36} 
                        fill={star <= (hoveredRating || rating) ? "currentColor" : "transparent"}
                        className={`transition-colors duration-200 ${
                          star <= (hoveredRating || rating) 
                            ? "text-accent drop-shadow-[0_0_10px_rgba(117,81,57,0.5)]" 
                            : "text-border-dim"
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                {/* Feedback Textarea */}
                <div className="relative mb-8">
                  <div className="absolute top-4 left-4 text-accent/50">
                    <MessageSquare size={16} />
                  </div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us what you liked or how we can improve..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-bg-panel border-2 border-transparent rounded-xl pl-12 pr-4 py-3 text-sm text-text-main focus:border-accent focus:bg-bg-surface outline-none transition-all font-semibold shadow-inner resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={rating === 0 || isSubmitting}
                  className="w-full py-4 bg-accent text-bg-surface rounded-xl font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-accent/30 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">Submitting...</span>
                  ) : (
                    <>
                      Submit Review <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
