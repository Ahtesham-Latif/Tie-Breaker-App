import React from "react";
import ReactMarkdown from "react-markdown";

export function ComparisonTable({
  data,
}: {
  data: { factors: string[]; comparison: any[] };
}) {
  return (
    <div className="overflow-x-auto rounded-4xl border-4 border-accent shadow-2xl bg-bg-panel overflow-hidden">
      <table className="w-full text-left border-collapse table-auto min-w-150">
        <thead>
          <tr className="bg-accent text-bg-surface">
            <th className="p-8 font-black uppercase tracking-[0.2em] text-[12px] border-b-4 border-accent">
              Factor / Metric
            </th>
            {data.comparison.map((opt, i) => (
              <th
                key={i}
                className="p-8 font-black uppercase tracking-[0.2em] text-[12px] border-b-4 border-b-accent border-l-4 border-l-bg-surface/10 text-center"
              >
                {opt.optionName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y-4 divide-accent/10">
          {data.factors.map((factor, fIdx) => (
            <tr
              key={fIdx}
              className="hover:bg-accent-muted/10 transition-colors"
            >
              <td className="p-8 font-black text-accent text-sm bg-accent-muted/5 border-r-4 border-accent/10">
                {factor}
              </td>
              {data.comparison.map((opt, oIdx) => (
                <td
                  key={oIdx}
                  className="p-8 align-middle border-l-4 border-accent/5 font-bold text-text-main text-sm text-center"
                >
                  <ReactMarkdown components={{ p: "span" }}>
                    {opt.values[fIdx]}
                  </ReactMarkdown>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}