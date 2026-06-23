import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, ArrowRight, Zap, Scale as ScaleIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../../lib/utils";
import { AnalysisType } from "../../types";

import { ComparisonTable } from "./ComparisonTable";
import { ProsConsDescriptive } from "./ProsConsDescriptive";
import { SWOTGridView } from "./SWOTGridView";
import { VerdictBullets } from "./VerdictBullets";

export function AnalysisDisplay({ type, data }: { type: AnalysisType; data: any }) {
  if (!data) return null;

  switch (type) {
    case "comparison":
      return <ComparisonTable data={data} />;
    case "pros-cons":
      return <ProsConsDescriptive data={data.results || data} />;
    case "swot":
      return <SWOTGridView data={data.results || data} />;
    case "verdict":
      return <VerdictBullets data={data} />;
    default:
      return null;
  }
}