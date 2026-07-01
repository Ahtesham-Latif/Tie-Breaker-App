import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";
import { MarkdownText } from "../ui/MarkdownText";
import { VerdictAnimation } from "./VerdictAnimation";

export function VerdictBullets({
  data,
}: {
  data: { winner: string; recommendation: string; keyTakeaways: string[]; entities?: string[] };
}) {
  const [isWeighing, setIsWeighing] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {isWeighing || !data.winner ? (
        <VerdictAnimation key="animation" data={data} onComplete={() => setIsWeighing(false)} />
      ) : (
        <motion.div
          key="verdict"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-3xl mx-auto bg-accent text-bg-surface p-4 md:p-6 rounded-xl md:rounded-2xl shadow-2xl relative overflow-hidden"
        >
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
        <Zap size={160} />
      </div>

      <div className="relative z-10 space-y-10">
        <div className="space-y-2">
          <span className="text-[clamp(10px,1.0vw,18px)] font-black uppercase tracking-[0.5em] opacity-60">
            The Winning Choice
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            {data.winner}
          </h2>
        </div>

        <div className="text-base font-bold italic leading-tight text-justify">
        &ldquo;<MarkdownText invertCitations={true}>
            {data.recommendation}
          </MarkdownText>&rdquo;
        </div>

        <div className="space-y-6 pt-8 border-t border-bg-surface/20">
          <h3 className="text-[clamp(10px,1.1vw,19px)] font-black uppercase tracking-widest opacity-60">
            Analysis Takeaways
          </h3>
          <ul className="space-y-4">
            {(data.keyTakeaways || []).map((point: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-4 text-sm font-black italic text-justify flex-wrap min-w-0"
              >
                <ArrowRight size={20} className="shrink-0 mt-1" />
                <div className="flex-1">
                  <MarkdownText invertCitations={true}>{point}</MarkdownText>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}