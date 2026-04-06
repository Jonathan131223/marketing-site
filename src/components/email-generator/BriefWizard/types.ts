import { UseCase, BriefData } from "@/types/emailGenerator";

export interface FieldSuggestion {
  selected: string;
  alternatives: string[];
}

export interface WebsiteAnalysisResponse {
  success: boolean;
  company: {
    name: string;
    value_proposition: string;
    industry: string;
    category: string;
    detected_tone: string;
  };
  logo: {
    url: string | null;
    extracted: boolean;
  };
  suggestions: Record<string, FieldSuggestion>;
  error?: string;
  fallback?: boolean;
}

export interface WizardState {
  currentStep: "website" | "sender" | "brief";
  websiteUrl: string;
  isAnalyzing: boolean;
  analysisError: string | null;
  analysisData: WebsiteAnalysisResponse | null;
  senderName: string;
  formData: Partial<BriefData>;
}

export interface BriefWizardProps {
  useCase: UseCase;
  onComplete: (data: BriefData) => void;
  hideHeader?: boolean;
}

export type WizardStep = "website" | "sender" | "brief";
