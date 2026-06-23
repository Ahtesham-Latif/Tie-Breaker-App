export type AnalysisType = "pros-cons" | "comparison" | "swot" | "verdict";

// The structured data format for the comparison analysis type
// This is the expected structure of the data returned from the AI for the comparison analysis type.
export interface ComparisonData {
  factor: string;
  options: {
    name: string;
    pros: string[];
    cons: string[];
    impactScore: number;
    notes: string;
  }[];
}
// The structured data returned from the AI for each analysis type
// This is a generic interface that can accommodate the different types of analyses (comparison, pros-cons, swot, verdict).
export interface AnalysisResult {
  type: AnalysisType;
  content: string; // Markdown or JSON string
  structuredData?: any;
  factors?: string[]; // Renamed from 'options' to 'factors' for clarity
}
