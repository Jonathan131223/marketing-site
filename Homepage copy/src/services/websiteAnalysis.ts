import { UseCase } from "@/pages/Index";
import { WebsiteAnalysisResponse } from "@/components/lifecycle/BriefWizard/types";

const API_BASE_URL = "https://api-test.digistorms.net";

/**
 * Analyzes a website URL to extract company info, logo, and generate
 * AI-suggested answers for brief questions.
 * 
 * Falls back gracefully if the backend is unavailable.
 */
export async function analyzeWebsite(
  websiteUrl: string,
  useCase: UseCase
): Promise<WebsiteAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/website/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        website_url: websiteUrl,
        use_case: useCase,
      }),
      mode: "cors",
      credentials: "omit",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as WebsiteAnalysisResponse;
  } catch (error) {
    console.error("Website analysis failed:", error);
    
    // Return a fallback response so the UI can continue
    return {
      success: false,
      company: {
        name: "",
        value_proposition: "",
        industry: "",
        category: "",
        detected_tone: "friendly",
      },
      logo: {
        url: null,
        extracted: false,
      },
      suggestions: {},
      error: error instanceof Error ? error.message : "Failed to analyze website",
      fallback: true,
    };
  }
}

/**
 * Normalizes a website URL to ensure it has a protocol
 */
export function normalizeWebsiteUrl(url: string): string {
  let normalized = url.trim();
  
  // Remove any leading/trailing whitespace
  normalized = normalized.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
  
  // Add https:// if no protocol specified
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`;
  }
  
  return normalized;
}

/**
 * Validates a website URL format
 */
export function isValidWebsiteUrl(url: string): boolean {
  try {
    const normalized = normalizeWebsiteUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}
