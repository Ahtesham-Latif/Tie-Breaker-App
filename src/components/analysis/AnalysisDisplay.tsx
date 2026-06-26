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
import { MarkdownText } from "../ui/MarkdownText";

export function AnalysisDisplay({ type, data, isSideBySide }: { type: AnalysisType; data: any; isSideBySide?: boolean }) {
  if (!data) return null;

  const renderContent = () => {
    switch (type) {
      case "comparison":
        return <ComparisonTable data={data} isSideBySide={isSideBySide} />;
      case "pros-cons":
        return <ProsConsDescriptive data={data.results || data} isSideBySide={isSideBySide} />;
      case "swot":
        return <SWOTGridView data={data.results || data} isSideBySide={isSideBySide} />;
      case "verdict":
        return <VerdictBullets data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {renderContent()}
    </div>
  );
}