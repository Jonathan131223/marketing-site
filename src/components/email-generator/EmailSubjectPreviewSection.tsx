import React, { useState, useEffect, useRef } from "react";
import type { EmailTemplate } from "@/types/emailGenerator";
import type { UseCase } from "@/types/emailGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Copy as CopyIcon, ChevronDown } from "lucide-react";
import { useCasesByCategory } from "@/utils/useCaseMapping";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ApiSuggestionsResponse {
  status: string;
  suggestions: { subject: string; preview_text: string }[];
}

/** Subject or preview text field with chevron + dropdown of AI options inside the same control. */
export function SuggestionInputRow({
  id,
  value,
  onValueChange,
  disabled,
  suggestions,
  inputClassName,
  wrapperClassName,
  "ariaLabel": ariaLabel,
}: {
  id: string;
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  suggestions: string[];
  inputClassName?: string;
  /** Width/layout on the outer wrapper so the in-input chevron shares the same box as the field */
  wrapperClassName?: string;
  ariaLabel: string;
}) {
  return (
    <div className={`relative flex-1 min-w-0 ${wrapperClassName ?? ""}`}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        disabled={disabled}
        className={`w-full pr-9 ${inputClassName ?? ""}`}
      />
      {suggestions.length > 0 && !disabled && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="absolute right-1 top-1/2 z-[1] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={ariaLabel}
              title="Choose from AI suggestions"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-w-[min(100vw-2rem,28rem)] max-h-64 overflow-y-auto"
          >
            {suggestions.map((s, i) => (
              <DropdownMenuItem
                key={i}
                className="whitespace-normal break-words cursor-pointer"
                onClick={() => onValueChange(s)}
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export interface EmailSubjectPreviewSectionProps {
  email: EmailTemplate;
  onUpdate: (
    email: EmailTemplate & {
      _subjectOnlyUpdate?: boolean;
      _previewOnlyUpdate?: boolean;
    }
  ) => void;
  onSubjectChange?: (subject: string) => void;
  onPreviewChange?: (preview: string) => void;
  onSuggestionsLoading?: (loading: boolean) => void;
  selectedUseCase: UseCase | null;
  /** Per-sequence-email use case for /subject/suggest (e.g. welcome vs nudge). */
  sequenceSuggestionUseCase?: UseCase | null;
  sequenceMode?: boolean;
  /** `inline`: compact rows for EmailEditor metadata (no outer card). `card`: standalone bordered block. */
  variant?: "card" | "inline";
}

/**
 * Subject line + preview text with AI regenerate. One instance per visible email;
 * key by email.id in the parent so state resets when switching sequence steps.
 */
export const EmailSubjectPreviewSection: React.FC<EmailSubjectPreviewSectionProps> = ({
  email,
  onUpdate,
  onSubjectChange,
  onPreviewChange,
  onSuggestionsLoading,
  selectedUseCase,
  sequenceSuggestionUseCase,
  sequenceMode = false,
  variant = "card",
}) => {
  const user = true; const session = true;

  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  useEffect(() => {
    onSuggestionsLoading?.(isFetchingSuggestions);
  }, [isFetchingSuggestions, onSuggestionsLoading]);

  const [localSubject, setLocalSubject] = useState(
    () => email.subject || ""
  );
  const [localPreview, setLocalPreview] = useState(
    () => email.preview || ""
  );
  /** Populated by POST /email-generator/subject/suggest (5 options each). */
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [previewSuggestions, setPreviewSuggestions] = useState<string[]>([]);

  /** Set when /subject/suggest succeeded for this email.id (lists filled; may or may not have applied row 1). */
  const suggestionListsLoadedForEmailIdRef = useRef<string | null>(null);
  const previousEmailIdRef = useRef<string | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);

  const effectiveUseCase = selectedUseCase ?? sequenceSuggestionUseCase ?? null;

  /** Latest email for suggest effect — avoids re-running fetch when only HTML tweaks change. */
  const emailRef = useRef(email);
  emailRef.current = email;

  const fetchSuggestions = async (opts?: { listsOnly?: boolean }) => {
    const listsOnly = opts?.listsOnly ?? false;
    if (!email.content) return;
    if (!effectiveUseCase) return;

    suggestAbortRef.current?.abort();
    const controller = new AbortController();
    suggestAbortRef.current = controller;

    setIsFetchingSuggestions(true);
    setSubjectSuggestions([]);
    setPreviewSuggestions([]);

    try {
      // Get the category for the use case (for sequence mode effectiveUseCase is "welcome" -> activation)
      const category =
        Object.entries(useCasesByCategory).find(([_, useCases]) =>
          useCases.some((uc) => uc.id === effectiveUseCase)
        )?.[0] || "activation";

      // Extract plain text from HTML - clean it first to remove editor controls and scripts
      const parser = new DOMParser();
      const doc = parser.parseFromString(email.content, "text/html");

      // Validate that we have a valid document
      if (!doc || (!doc.body && !doc.documentElement)) {
        console.error(
          "❌ Failed to parse email content - invalid document structure"
        );
        throw new Error("Failed to parse email content");
      }

      // Remove all script tags, editor controls, and non-content elements
      const scripts = doc.querySelectorAll("script");
      scripts.forEach((script) => script.remove());

      // Remove iframes (they can contain website content)
      const iframes = doc.querySelectorAll("iframe");
      iframes.forEach((iframe) => iframe.remove());

      const editorControls = doc.querySelectorAll(
        ".gemini-left-controls, .gemini-right-controls, .gemini-control-button, .gemini-insert-popover, .gemini-button-control-popover, .gemini-image-control-popover, .gemini-social-control-popover, .gemini-social-block-control-popover, .gemini-padding-control-popover, .gemini-padding-icon"
      );
      editorControls.forEach((control) => control.remove());

      // Remove all style tags (both in head and body)
      const styles = doc.querySelectorAll("style");
      styles.forEach((style) => style.remove());

      // Also remove any style attributes that might contain CSS (we'll keep the elements, just remove style attrs for cleaner text extraction)
      // Actually, let's keep style attributes but ensure we extract text properly

      // Remove preview text placeholders (hidden td elements with invisible characters)
      const previewTextElements = doc.querySelectorAll(
        'td[style*="display: none"], td[style*="font-size: 0"], td[style*="line-height: 0"]'
      );
      previewTextElements.forEach((el) => el.remove());

      // Remove footer content (copyright, address, unsubscribe links)
      const footerElements = doc.querySelectorAll(
        '#email-footer, #email-copy, [id*="footer"], td[id*="footer"]'
      );
      footerElements.forEach((el) => el.remove());

      // Remove social media sections (usually in footer)
      const socialElements = doc.querySelectorAll(
        '#email-socials, [id*="social"]'
      );
      socialElements.forEach((el) => el.remove());

      // Remove elements containing common footer patterns
      const allElements = doc.querySelectorAll("*");
      allElements.forEach((el) => {
        const text = el.textContent?.toLowerCase() || "";
        // Remove elements containing copyright, unsubscribe, or address patterns
        if (
          text.includes("unsubscribe") ||
          text.includes("©") ||
          text.includes("copyright") ||
          (text.includes("address") && text.includes("city")) ||
          text.match(/\d{4}\s*\.?\s*address/i) // Pattern like "2025.Address"
        ) {
          // Only remove if it's a leaf node or has minimal children (to avoid removing too much)
          if (el.children.length <= 2) {
            el.remove();
          }
        }
      });

      // Helper function to validate we have actual content (not just CSS or invisible chars)
      const hasRealContent = (text: string): boolean => {
        if (!text || text.trim().length < 20) return false;
        // Check if it's mostly CSS (contains lots of curly braces, colons, semicolons)
        const cssPattern = /[{:;}]/g;
        const cssMatches = (text.match(cssPattern) || []).length;
        const textLength = text.length;
        // If more than 10% of characters are CSS syntax, it's likely CSS
        if (cssMatches / textLength > 0.1) return false;
        // Check if it contains actual words (at least 3 words)
        const words = text.split(/\s+/).filter((w) => w.length > 2);
        if (words.length < 3) return false;
        return true;
      };

      // Get text content from main email body only (exclude footer)
      // Focus on actual content: headings, paragraphs, list items, text spans
      // Target specific email content IDs to avoid footer
      const contentSelectors = [
        "#email-intro, #email-body, #email-headline, #email-cta",
        'td[id^="email-"]:not([id*="footer"]):not([id*="social"]):not([id*="copy"])',
        "h1, h2, h3, h4, h5, h6",
        "p",
        "li",
      ];

      // Also look for common email content patterns (for templates without specific IDs)
      const emailContentPatterns = [
        ".email-block td", // Content in email-block cells
        "table[width] td:not([id*='footer']):not([id*='social']):not([id*='copy'])", // Table cells with content
      ];

      const contentElements: string[] = [];
      const seenText = new Set<string>(); // Track seen text to avoid duplicates

      // Website content patterns to exclude (pricing, navigation, etc.)
      const websiteContentPatterns = [
        /\$\d+(\/month|\/year|\.\d{2})/i, // Pricing ($15/month, $39.99)
        /(free|pro|business|enterprise)\s+(plan|tier|pricing)/i, // Plan names
        /(get started|sign up|login|register|dashboard)/i, // Common website CTAs
        /(features|pricing|about|contact|blog)/i, // Navigation items
        /digistorms\.ai/i, // Website domain
        /(monthly|annual|yearly)\s+(price|billing)/i, // Billing terms
      ];

      const isWebsiteContent = (text: string): boolean => {
        const lowerText = text.toLowerCase();
        return websiteContentPatterns.some((pattern) =>
          pattern.test(lowerText)
        );
      };

      // First, try specific email content selectors
      contentSelectors.forEach((selector) => {
        try {
          const elements = doc.querySelectorAll(selector);
          elements.forEach((el) => {
            // Skip if this element is inside a footer
            if (el.closest('#email-footer, #email-copy, [id*="footer"]')) {
              return;
            }

            const text = el.textContent?.trim() || "";
            // Filter out invisible characters, very short text, and preview placeholders
            const hasVisibleText =
              text.length > 3 &&
              !/^[\s\u200B-\u200D\uFEFF\u2060\u8291]*$/.test(text) &&
              !text.match(/^[\s\u8291]+$/); // Not just invisible chars

            if (hasVisibleText) {
              // Remove invisible characters from the text
              let cleanText = text
                .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
                .trim();

              // Skip website content
              if (isWebsiteContent(cleanText)) {
                return;
              }

              // Remove common footer patterns
              cleanText = cleanText
                .replace(/HTML\s+Online\s+Viewer\s*©?\s*\d{4}\.?\s*/gi, "")
                .replace(/Address,\s*City/gi, "")
                .replace(/Unsubscribe/gi, "")
                .trim();

              // Skip if too short after cleaning or if we've seen this exact text
              if (cleanText.length > 3 && !seenText.has(cleanText)) {
                seenText.add(cleanText);
                contentElements.push(cleanText);
              }
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });

      // If we didn't find enough content, try email content patterns
      if (contentElements.length < 3) {
        emailContentPatterns.forEach((selector) => {
          try {
            const elements = doc.querySelectorAll(selector);
            elements.forEach((el) => {
              // Skip if this element is inside a footer or social section
              if (
                el.closest(
                  '#email-footer, #email-copy, #email-socials, [id*="footer"], [id*="social"]'
                )
              ) {
                return;
              }

              const text = el.textContent?.trim() || "";
              // Filter out invisible characters, very short text, and preview placeholders
              const hasVisibleText =
                text.length > 10 && // Longer minimum for pattern-based extraction
                !/^[\s\u200B-\u200D\uFEFF\u2060\u8291]*$/.test(text) &&
                !text.match(/^[\s\u8291]+$/); // Not just invisible chars

              if (hasVisibleText) {
                // Remove invisible characters from the text
                let cleanText = text
                  .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
                  .trim();

                // Skip website content
                if (isWebsiteContent(cleanText)) {
                  return;
                }

                // Remove common footer patterns
                cleanText = cleanText
                  .replace(/HTML\s+Online\s+Viewer\s*©?\s*\d{4}\.?\s*/gi, "")
                  .replace(/Address,\s*City/gi, "")
                  .replace(/Unsubscribe/gi, "")
                  .trim();

                // Skip if too short after cleaning or if we've seen this exact text
                if (cleanText.length > 10 && !seenText.has(cleanText)) {
                  seenText.add(cleanText);
                  contentElements.push(cleanText);
                }
              }
            });
          } catch (e) {
            // Ignore selector errors
          }
        });
      }

      // Join all content elements
      let plainText = contentElements.join(" ");

      // If we didn't find content with selectors, fall back to body text but filter invisible chars
      if (!plainText || !hasRealContent(plainText)) {
        // Try to get content from main email wrapper, excluding footer
        const emailWrapper = doc.querySelector("#emailWrapper");
        if (emailWrapper) {
          // Clone to avoid modifying original
          const wrapperClone = emailWrapper.cloneNode(true) as Element;

          // Remove footer, social, and other non-content sections from clone
          const nonContentSelectors = [
            "#email-footer",
            "#email-copy",
            "#email-socials",
            '[id*="footer"]',
            '[id*="social"]',
            '[id*="copy"]',
          ];
          nonContentSelectors.forEach((selector) => {
            const elements = wrapperClone.querySelectorAll(selector);
            elements.forEach((el) => el.remove());
          });

          // Extract text from table cells (common email structure)
          // Use innerText instead of textContent to avoid style tag content
          const tableCells = wrapperClone.querySelectorAll("td");
          const cellTexts: string[] = [];
          tableCells.forEach((cell) => {
            // Use innerText which excludes style tag content
            const text =
              (cell as HTMLElement).innerText?.trim() ||
              cell.textContent?.trim() ||
              "";
            // Filter out cells that are mostly CSS or very short
            if (
              text.length > 15 &&
              hasRealContent(text) &&
              !isWebsiteContent(text) &&
              !text.match(/^(unsubscribe|copyright|©|\d{4})/i) &&
              !text.match(/^[{:;}\s]+$/) // Not just CSS characters
            ) {
              cellTexts.push(text);
            }
          });

          if (cellTexts.length > 0) {
            plainText = cellTexts.join(" ");
          } else {
            // Use innerText to avoid style tag content
            const allText =
              (wrapperClone as HTMLElement).innerText ||
              wrapperClone.textContent ||
              "";

            // Remove invisible characters and footer patterns
            plainText = allText
              .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
              .replace(/HTML\s+Online\s+Viewer\s*©?\s*\d{4}\.?\s*/gi, "")
              .replace(/Address,\s*City/gi, "")
              .replace(/Unsubscribe/gi, "")
              .trim();

            // Validate it's not just CSS
            if (!hasRealContent(plainText)) {
              plainText = ""; // Reset if it's not real content
            }
          }
        } else {
          // Only use body/documentElement as last resort, and filter aggressively
          const contentElement = doc.body || doc.documentElement;
          if (!contentElement) {
            // If we can't find body or documentElement, fall back to parsing the raw content
            // But filter out style tags first
            let rawContent = email.content;
            // Remove style tags and their content
            rawContent = rawContent.replace(
              /<style[^>]*>[\s\S]*?<\/style>/gi,
              ""
            );
            // Remove script tags and their content
            rawContent = rawContent.replace(
              /<script[^>]*>[\s\S]*?<\/script>/gi,
              ""
            );
            plainText = rawContent
              .replace(/<[^>]*>/g, " ") // Remove remaining HTML tags
              .replace(/\s+/g, " ") // Normalize whitespace
              .trim();

            // Validate it's not just CSS
            if (!hasRealContent(plainText)) {
              plainText = ""; // Reset if it's not real content
            }
          } else {
            // Extract from table cells first (more reliable for emails)
            const tableCells = contentElement.querySelectorAll("td");
            const cellTexts: string[] = [];
            tableCells.forEach((cell) => {
              // Skip footer/social cells
              if (
                cell.closest(
                  '#email-footer, #email-copy, #email-socials, [id*="footer"], [id*="social"]'
                )
              ) {
                return;
              }

              // Use innerText which excludes style tag content
              const text =
                (cell as HTMLElement).innerText?.trim() ||
                cell.textContent?.trim() ||
                "";
              if (
                text.length > 15 &&
                hasRealContent(text) &&
                !isWebsiteContent(text) &&
                !text.match(/^(unsubscribe|copyright|©|\d{4})/i) &&
                !text.match(/^[{:;}\s]+$/) // Not just CSS characters
              ) {
                cellTexts.push(text);
              }
            });

            if (cellTexts.length > 0) {
              plainText = cellTexts.join(" ");
            } else {
              // Use innerText to avoid style tag content
              const allText =
                (contentElement as HTMLElement).innerText ||
                contentElement.textContent ||
                "";

              // Remove invisible characters and footer patterns
              plainText = allText
                .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
                .replace(/HTML\s+Online\s+Viewer\s*©?\s*\d{4}\.?\s*/gi, "")
                .replace(/Address,\s*City/gi, "")
                .replace(/Unsubscribe/gi, "")
                .trim();

              // Validate it's not just CSS
              if (!hasRealContent(plainText)) {
                plainText = ""; // Reset if it's not real content
              }
            }
          }
        }
      }

      // Clean up the text: remove extra whitespace, normalize newlines
      plainText = plainText
        .replace(/\s+/g, " ") // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, "\n") // Remove empty lines
        .trim();

      // Remove any remaining invisible characters and footer patterns
      plainText = plainText
        .replace(/[\u200B-\u200D\uFEFF\u2060\u8291]/g, "")
        .replace(/HTML\s+Online\s+Viewer\s*©?\s*\d{4}\.?\s*/gi, "")
        .replace(/Address,\s*City/gi, "")
        .replace(/Unsubscribe/gi, "")
        .trim();

      // Final pass: filter out website content patterns from the entire text
      // Split into sentences and filter out website-related sentences
      const sentences = plainText.split(/[.!?]\s+/);
      const filteredSentences = sentences.filter((sentence) => {
        const trimmed = sentence.trim();
        // Skip very short sentences
        if (trimmed.length < 10) return false;
        // Skip website content
        if (isWebsiteContent(trimmed)) return false;
        // Skip common website patterns
        if (
          trimmed.match(
            /(digistorms|pricing|plans|features|get started|sign up|login)/i
          )
        ) {
          return false;
        }
        return true;
      });

      // Remove duplicate sentences/phrases (common issue with email templates)
      // This also serves as the final deduplication pass
      const allSentences = plainText.split(/[.!?]\s+/);
      const uniqueSentences: string[] = [];
      const seenSentences = new Set<string>();

      allSentences.forEach((sentence) => {
        const trimmed = sentence.trim();
        // Skip very short sentences
        if (trimmed.length < 10) return;

        // Skip website content (final check)
        if (isWebsiteContent(trimmed)) return;

        // Skip common website patterns
        if (
          trimmed.match(
            /(digistorms\.ai|pricing|plans|features|get started|sign up|login|register)/i
          )
        ) {
          return;
        }

        // Deduplicate
        const normalized = trimmed.toLowerCase();
        if (!seenSentences.has(normalized)) {
          seenSentences.add(normalized);
          uniqueSentences.push(trimmed);
        }
      });

      plainText = uniqueSentences.join(". ").trim();

      // Final validation - ensure we have real content before sending
      if (!plainText || !hasRealContent(plainText)) {
        console.error(
          "❌ Failed to extract meaningful email content. Content preview:",
          plainText.substring(0, 200)
        );
        throw new Error(
          "Failed to extract meaningful content from email. Please ensure the email contains text content."
        );
      }

      // Limit to reasonable length (first 2000 chars should be enough for subject/preview generation)
      if (plainText.length > 2000) {
        plainText = plainText.substring(0, 2000) + "...";
      }

      // Debug: Log extracted content to help identify issues
      console.log("📧 Extracted email content for suggestions:", {
        contentLength: plainText.length,
        preview:
          plainText.substring(0, 200) + (plainText.length > 200 ? "..." : ""),
        hasWebsiteContent: isWebsiteContent(plainText.substring(0, 100)),
        wordCount: plainText.split(/\s+/).filter((w) => w.length > 2).length,
      });

      // Format use case as required by API
      const formattedUseCase = `${category}: ${effectiveUseCase}`;

      // Prepare form data
      const formData = new FormData();
      formData.append("use_case", formattedUseCase);
      formData.append("email_body", plainText);

      console.log("📧 Fetching suggestions with:", {
        useCase: formattedUseCase,
        emailBodyLength: plainText.length,
        emailBodyPreview: plainText.substring(0, 200),
      });

      const response = await fetch(
        "https://api-test.digistorms.net/email-generator/subject/suggest",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      if (controller.signal.aborted) return;

      const data: ApiSuggestionsResponse = await response.json();
      if (controller.signal.aborted) return;

      if (response.ok) {
        console.log("📧 API Response:", {
          status: data.status,
          suggestionsCount: data.suggestions?.length || 0,
          suggestions: data.suggestions,
        });

        if (data.status === "success" && data.suggestions?.length > 0) {
          setSubjectSuggestions(data.suggestions.map((s) => s.subject));
          setPreviewSuggestions(data.suggestions.map((s) => s.preview_text));

          if (!listsOnly) {
            const firstSuggestion = data.suggestions[0];
            const newSubject = firstSuggestion.subject || "";
            const newPreview = firstSuggestion.preview_text || "";

            setLocalSubject(newSubject);
            setLocalPreview(newPreview);

            if (newSubject) onSubjectChange?.(newSubject);
            if (newPreview) onPreviewChange?.(newPreview);

            onUpdate({
              ...email,
              subject: newSubject,
              preview: newPreview,
              _subjectOnlyUpdate: true,
              _previewOnlyUpdate: true,
            } as any);
          }
          suggestionListsLoadedForEmailIdRef.current = email.id;
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      console.error("❌ Error fetching suggestions:", error);
      console.error("Error details:", {
        error,
        effectiveUseCase,
        emailContentLength: email.content?.length || 0,
      });
      // Fall back to default suggestions if API fails
      const fallbackSubjects = [
        "Welcome to our service - Let's get you started!",
        "Your account is ready 🚀",
        "Welcome! Here's what to do first",
        "Let's create your first email",
        "Your journey begins now",
      ];
      const fallbackPreviews = [
        "Get started with our amazing features",
        "Everything you need to create powerful emails",
        "Your step-by-step guide to success",
        "Create, customize, and convert with ease",
        "Welcome to effortless email marketing",
      ];

      setSubjectSuggestions(fallbackSubjects);
      setPreviewSuggestions(fallbackPreviews);

      const newSubject = fallbackSubjects[0];
      const newPreview = fallbackPreviews[0];
      if (!listsOnly) {
        setLocalSubject(newSubject);
        setLocalPreview(newPreview);
        onSubjectChange?.(newSubject);
        onPreviewChange?.(newPreview);
        onUpdate({
          ...email,
          subject: newSubject,
          preview: newPreview,
          _subjectOnlyUpdate: true,
          _previewOnlyUpdate: true,
        } as any);
      }
      suggestionListsLoadedForEmailIdRef.current = email.id;
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // Initialize local state from email prop - only sync when email ID changes (new email)
  useEffect(() => {
    const isNewEmail = previousEmailIdRef.current !== email.id;

    if (isNewEmail) {
      setLocalSubject(email.subject || "");
      setLocalPreview(email.preview || "");
      setSubjectSuggestions([]);
      setPreviewSuggestions([]);
      suggestionListsLoadedForEmailIdRef.current = null;
      previousEmailIdRef.current = email.id;
    }
  }, [email.id]);

  // Fetch /subject/suggest once per email when content becomes available.
  // Intentionally omit email.content/email.subject/email.preview: including them re-ran the effect
  // when finalizeHtml/tweaks updated HTML or when subject hydrated a frame later, aborting the
  // in-flight request (duplicate "failed" rows in DevTools) and flashing the loading UI.
  const hasSuggestableContent = Boolean(
    email.content && email.content.trim().length > 0
  );
  useEffect(() => {
    if (!hasSuggestableContent || !effectiveUseCase) return;
    if (suggestionListsLoadedForEmailIdRef.current === email.id) return;

    const e = emailRef.current;
    const hasSubject = !!e.subject?.trim();
    const hasPreview =
      e.preview != null && String(e.preview).trim() !== "";
    const listsOnly = hasSubject && hasPreview;

    console.log("📧 Fetching subject/preview suggestions:", {
      emailId: e.id,
      effectiveUseCase,
      sequenceMode,
      listsOnly,
    });

    void fetchSuggestions({ listsOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchSuggestions intentionally omitted; use emailRef for fresh subject/preview
  }, [effectiveUseCase, sequenceMode, email.id, hasSuggestableContent]);

  const handleSubjectChange = (value: string) => {
    setLocalSubject(value);

    if (onSubjectChange) {
      onSubjectChange(value);
    }

    onUpdate({
      id: email.id,
      subject: value,
      preview: email.preview || "",
      content: email.content || "",
      style: email.style || "professional",
      brandTone: email.brandTone || "",
      isHtml: email.isHtml ?? true,
      _subjectOnlyUpdate: true,
    } as any);
  };

  const handlePreviewChange = (value: string) => {
    setLocalPreview(value);

    if (onPreviewChange) {
      onPreviewChange(value);
    }

    onUpdate({ ...email, preview: value, _previewOnlyUpdate: true } as any);
  };

  const handleCopySubject = async () => {
    try {
      await navigator.clipboard.writeText(localSubject);
      toast.success("Subject line copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy subject line");
    }
  };

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(localPreview);
      toast.success("Preview text copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy preview text");
    }
  };

  const regenerate = () => {
    suggestionListsLoadedForEmailIdRef.current = null;
    void fetchSuggestions({ listsOnly: false });
  };

  if (variant === "inline") {
    // While /suggest runs, if either field is still empty (common when switching sequence steps),
    // show the SAME loading line for both rows — never subject filled + preview as "…".
    const bothFieldsHaveText =
      Boolean(localSubject.trim()) && Boolean(localPreview.trim());
    const showUnifiedInlineLoading =
      isFetchingSuggestions && !bothFieldsHaveText;
    const showSubjectPlaceholder = showUnifiedInlineLoading;
    const showPreviewPlaceholder = showUnifiedInlineLoading;

    return (
      <>
        <div className="text-sm flex items-start gap-2 min-w-0">
          <span className="text-muted-foreground w-16 shrink-0 pt-2">Subject:</span>
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
            {showSubjectPlaceholder ? (
              <span className="text-muted-foreground animate-pulse py-2">
                Loading suggestions…
              </span>
            ) : (
              <>
                <SuggestionInputRow
                  id="email-editor-subject"
                  value={localSubject}
                  onValueChange={handleSubjectChange}
                  disabled={!user || !session}
                  suggestions={subjectSuggestions}
                  inputClassName="h-9 text-sm min-w-[140px]"
                  ariaLabel="Subject line suggestions"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCopySubject}
                  title="Copy subject"
                  disabled={!user || !session}
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </>
            )}
            {user && session && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isFetchingSuggestions}
                aria-busy={isFetchingSuggestions}
                onClick={regenerate}
                className={cn(
                  "h-9 shrink-0 px-2 text-muted-foreground transition-[opacity,filter] hover:text-foreground",
                  isFetchingSuggestions && "blur-[0.4px]"
                )}
              >
                Regenerate
              </Button>
            )}
          </div>
        </div>
        <div className="text-sm flex items-start gap-2 min-w-0">
          <span className="text-muted-foreground w-16 shrink-0 pt-2">Preview:</span>
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
            {showPreviewPlaceholder ? (
              <span className="text-muted-foreground animate-pulse py-2">
                Loading suggestions…
              </span>
            ) : (
              <>
                <SuggestionInputRow
                  id="email-editor-preview"
                  value={localPreview}
                  onValueChange={handlePreviewChange}
                  disabled={!user || !session}
                  suggestions={previewSuggestions}
                  wrapperClassName="max-w-[81%]"
                  inputClassName="h-9 text-sm min-w-0 text-muted-foreground"
                  ariaLabel="Preview text suggestions"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleCopyPreview}
                  title="Copy preview text"
                  disabled={!user || !session}
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        {(!user || !session) && (
          <p className="text-xs text-muted-foreground pl-[4.5rem]">
            Sign in to edit subject and preview.
          </p>
        )}
      </>
    );
  }

  return (
    <div className="mb-4">
      <div className="bg-white rounded-lg border border-border p-6 relative">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Subject Line & Preview
          </h3>
          {user && session && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFetchingSuggestions}
              aria-busy={isFetchingSuggestions}
              onClick={regenerate}
              className={cn(
                "text-muted-foreground transition-[opacity,filter] hover:text-foreground",
                isFetchingSuggestions && "blur-[0.4px]"
              )}
            >
              Regenerate
            </Button>
          )}
        </div>

        {isFetchingSuggestions ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            <p className="ml-4 text-muted-foreground">Getting suggestions...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="subject"
                className="text-sm font-medium text-foreground"
              >
                Subject Line
              </Label>
              <div className="flex gap-2 mt-1">
                <SuggestionInputRow
                  id="subject"
                  value={localSubject}
                  onValueChange={handleSubjectChange}
                  disabled={!user || !session}
                  suggestions={subjectSuggestions}
                  inputClassName="flex-1"
                  ariaLabel="Subject line suggestions"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySubject}
                  className="px-3 shrink-0"
                  title="Copy subject line"
                  disabled={!user || !session}
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label
                htmlFor="preview"
                className="text-sm font-medium text-foreground"
              >
                Preview Text
              </Label>
              <div className="flex gap-2 mt-1">
                <SuggestionInputRow
                  id="preview"
                  value={localPreview}
                  onValueChange={handlePreviewChange}
                  disabled={!user || !session}
                  suggestions={previewSuggestions}
                  inputClassName="flex-1"
                  ariaLabel="Preview text suggestions"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPreview}
                  className="px-3 shrink-0"
                  title="Copy preview text"
                  disabled={!user || !session}
                >
                  <CopyIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {(!user || !session) && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 rounded-lg pointer-events-none" />
        )}
      </div>
    </div>
  );
};
