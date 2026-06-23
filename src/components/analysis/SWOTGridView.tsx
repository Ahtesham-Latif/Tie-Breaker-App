import React from "react";
import ReactMarkdown from "react-markdown";

export function SWOTGridView({ data }: { data: any[] }) {
  return (
    <div className="space-y-16">
      {data.map((opt, i) => (
        <div key={i} className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="px-6 py-2 bg-accent text-bg-surface font-black rounded-full text-sm uppercase tracking-widest shadow-lg">
              {opt.optionName}
            </div>
            <div className="flex-1 h-1 bg-accent/10 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-bg-panel border-4 border-accent p-8 rounded-4xl shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                  Strengths
                </span>
                <span className="text-4xl font-black text-accent/20">S</span>
              </div>
              <ul className="space-y-2">
                {opt.strengths.map((s: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-accent pl-3"
                  >
                    <ReactMarkdown components={{ p: "span" }}>
                      {s}
                    </ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-panel border-4 border-danger p-8 rounded-4xl shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-danger">
                  Weaknesses
                </span>
                <span className="text-4xl font-black text-danger/20">W</span>
              </div>
              <ul className="space-y-2">
                {opt.weaknesses.map((w: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-danger pl-3"
                  >
                    <ReactMarkdown components={{ p: "span" }}>
                      {w}
                    </ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-panel border-4 border-accent p-8 rounded-4xl shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                  Opportunities
                </span>
                <span className="text-4xl font-black text-accent/20">O</span>
              </div>
              <ul className="space-y-2">
                {opt.opportunities.map((o: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-accent pl-3"
                  >
                    <ReactMarkdown components={{ p: "span" }}>
                      {o}
                    </ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-bg-panel border-4 border-danger p-8 rounded-4xl shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-danger">
                  Threats
                </span>
                <span className="text-4xl font-black text-danger/20">T</span>
              </div>
              <ul className="space-y-2">
                {opt.threats.map((t: string, idx: number) => (
                  <li
                    key={idx}
                    className="text-xs font-bold leading-relaxed border-l-2 border-danger pl-3"
                  >
                    <ReactMarkdown components={{ p: "span" }}>
                      {t}
                    </ReactMarkdown>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}