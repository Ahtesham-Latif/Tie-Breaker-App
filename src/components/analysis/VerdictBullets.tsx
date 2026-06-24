import React from "react";
import { motion } from "motion/react";
import { ArrowRight, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function VerdictBullets({
  data,
}: {
  data: { winner: string; recommendation: string; keyTakeaways: string[] };
}) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="max-w-3xl mx-auto bg-accent text-bg-surface p-5 md:p-12 rounded-3xl md:rounded-[3rem] shadow-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
        <Zap size={160} />
      </div>

      <div className="relative z-10 space-y-10">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60">
            The Winning Choice
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
            {data.winner}
          </h2>
        </div>

        <div className="text-xl font-bold italic leading-tight">
        &ldquo;<ReactMarkdown components={{ p: "span" }}>
            {data.recommendation}
          </ReactMarkdown>&rdquo;
        </div>

        <div className="space-y-6 pt-8 border-t border-bg-surface/20">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-60">
            Analysis Takeaways
          </h3>
          <ul className="space-y-4">
            {data.keyTakeaways.map((point: string, i: number) => (
              <li
                key={i}
                className="flex items-start gap-4 text-base font-black italic"
              >
                <ArrowRight size={20} className="shrink-0 mt-1" />
                <div className="flex-1">
                  <ReactMarkdown components={{ p: "span" }}>{point}</ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}