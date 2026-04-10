import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/hooks/useAppStore";
import { useStateRestoration } from "@/hooks/useStateRestoration";
import { StatePersistence } from "@/store/persistence";
import { EmailEditor } from "@/components/email-generator/EmailEditor";
import { EmailSubjectPreviewSection } from "@/components/email-generator/EmailSubjectPreviewSection";
import { AIGeneratorPanel } from "@/components/email-generator/AIGeneratorPanel";
import { EmptyStateRedirect } from "@/components/email-generator/EmptyStateRedirect";
import { ProgressBar } from "@/components/email-generator/ProgressBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { EmailTemplate, UseCase, TemplateTweaks } from "@/types/emailGenerator";
import {
  ensureDigiStormsBadgeInitialized,
  hasDigiStormsBadge,
  isDigiStormsBadgeHidden,
} from "@/utils/digiStormsBadge";
import { emailHasGrayBackground } from "@/utils/emailRenderer";
import { TemplateTweaksSidebar } from "@/components/email-generator/TemplateTweaksSidebar";
import { applyTemplateTweaksToHtml } from "@/utils/templateTweaks";

const CustomizePage = () => {
  const navigate = useNavigate();
  const { workflow, history, combined } = useAppStore();
  const [isRestoring, setIsRestoring] = useState(true);
  const [isBadgeRemoved, setIsBadgeRemoved] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(workflow.selectedEmail?.subject || "");
  const [currentPreview, setCurrentPreview] = useState(workflow.selectedEmail?.preview || "");
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const handleSuggestionsLoading = useCallback((loading: boolean) => {
    setSuggestionsLoading(loading);
  }, []);

  const handleSubjectChangeDirectly = useCallback((newSubject: string) => {
    setCurrentSubject(newSubject);
  }, []);

  const handlePreviewChangeDirectly = useCallback((newPreview: string) => {
    setCurrentPreview(newPreview);
  }, []);

  const [templateTweaks, setTemplateTweaks] = useState<TemplateTweaks>(() => {
    return {
      tone: "professional",
      iconFamily: "material",
      language: "en",
    } as TemplateTweaks;
  });

  // Clear history on mount — one fresh session per Customize visit.
  // Previously depended on `location.pathname` (resolving to window.location)
  // which never changed under SPA routing; comment said "fresh session" but
  // the effect ran based on component mount/unmount anyway. Using [] is
  // explicit about the real intent.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    history.clear();
  }, []);

  // Restore state on mount
  useStateRestoration({
    onStateRestored: () => {
      setTimeout(() => {
        setIsRestoring(false);
      }, 100);
    },
    onNoStateFound: () => {
      setIsRestoring(false);
    },
  });

  // Restore selected email from storage. No auto-redirect on missing
  // state — fall through to EmptyStateRedirect below.
  // Deps: we intentionally omit `workflow` (new reference every render).
  // setSelectedEmail is a stable useCallback from useAppStore.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isRestoring) return;

    const selectedEmailFromStore = workflow.selectedEmail;
    const selectedEmailFromStorage = StatePersistence.loadSelectedEmail();

    if (!selectedEmailFromStore && selectedEmailFromStorage) {
      workflow.setSelectedEmail(selectedEmailFromStorage);
    }
  }, [workflow.selectedEmail, isRestoring]);

  // Keep checkbox state in sync with current email HTML
  useEffect(() => {
    const html = workflow.selectedEmail?.content || "";
    setIsBadgeRemoved(
      !hasDigiStormsBadge(html) || isDigiStormsBadgeHidden(html)
    );
  }, [workflow.selectedEmail?.content]);

  // Initialize badge AND history in a single ordered effect. Previously
  // these were two separate effects: badge init dispatched setSelectedEmail
  // with the post-badge content, but history init read selected.content in
  // the same render cycle before the dispatch committed, so history entry 0
  // was the pre-badge content. First undo removed the badge the user never
  // saw get applied. This version computes the post-badge content once and
  // uses it for BOTH the store update AND the history seed, guaranteed in
  // sync. Guarded by a ref so it runs exactly once per mount regardless of
  // how many times the effect deps change.
  const hasInitialized = useRef(false);
  const historyEntriesLength = history.entries.length;
  useEffect(() => {
    if (isRestoring) return;
    if (hasInitialized.current) return;

    const selected = workflow.selectedEmail;
    if (!selected?.content) return;

    // Compute the canonical first-frame content (post-badge init).
    const initialContent = selected.isHtml
      ? ensureDigiStormsBadgeInitialized(selected.content)
      : selected.content;

    // Apply badge if it changed anything.
    if (initialContent !== selected.content) {
      workflow.setSelectedEmail({ ...selected, content: initialContent });
    }

    // Seed history with the SAME content the user sees on frame 1.
    if (historyEntriesLength === 0) {
      history.addEntry(initialContent, "inline-edit");
    }

    hasInitialized.current = true;
    // Reset on unmount so a fresh visit re-initializes cleanly.
    return () => {
      hasInitialized.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRestoring, workflow.selectedEmail?.id]);

  // Handle template tweaks change
  const handleTweaksChange = useCallback((newTweaks: TemplateTweaks) => {
    setTemplateTweaks(newTweaks);

    if (workflow.selectedEmail?.content) {
      const tweakedHtml = applyTemplateTweaksToHtml(workflow.selectedEmail.content, newTweaks);
      if (tweakedHtml !== workflow.selectedEmail.content) {
        workflow.setSelectedEmail({
          ...workflow.selectedEmail,
          content: tweakedHtml,
        });
      }
    }
  }, [workflow]);

  const handleEmailUpdate = (
    email: EmailTemplate & {
      _subjectOnlyUpdate?: boolean;
      _previewOnlyUpdate?: boolean;
    },
    operation:
      | "inline-edit"
      | "block-move"
      | "block-duplicate"
      | "block-delete"
      | "block-insert"
      | "stormy-edit" = "inline-edit"
  ) => {
    const currentEmail = workflow.selectedEmail;

    const isSubjectOnlyUpdate = (email as any)._subjectOnlyUpdate;
    const isPreviewOnlyUpdate = (email as any)._previewOnlyUpdate;

    let updatedEmail: EmailTemplate;

    if ((isSubjectOnlyUpdate || isPreviewOnlyUpdate) && currentEmail) {
      updatedEmail = {
        ...currentEmail,
        subject: email.subject,
        preview: email.preview,
      };
    } else {
      updatedEmail = email;
    }

    delete (updatedEmail as any)._subjectOnlyUpdate;
    delete (updatedEmail as any)._previewOnlyUpdate;

    if (combined.shouldAddToHistory(updatedEmail.content)) {
      history.addEntry(updatedEmail.content, operation);
    }

    workflow.setSelectedEmail(updatedEmail);
  };

  const handleExport = () => {
    console.log("Exporting email:", workflow.selectedEmail);
  };

  // Undo handler
  const handleUndo = useCallback(() => {
    if (!history.canUndo) return;
    if (!workflow.selectedEmail) return;

    const targetContent = history.previousEntry?.content;
    if (!targetContent) return;

    history.performUndo();
    workflow.setSelectedEmail({
      ...workflow.selectedEmail,
      content: targetContent,
    });
  }, [history, workflow]);

  // Redo handler
  const handleRedo = useCallback(() => {
    if (!history.canRedo) return;
    if (!workflow.selectedEmail) return;

    const targetContent = history.nextEntry?.content;
    if (!targetContent) return;

    history.performRedo();
    workflow.setSelectedEmail({
      ...workflow.selectedEmail,
      content: targetContent,
    });
  }, [history, workflow]);

  const handleBack = () => {
    navigate("/email-generator/templates");
  };

  // Sync currentSubject and currentPreview when the displayed email changes
  useEffect(() => {
    const storeSubject = workflow.selectedEmail?.subject || "";
    const storePreview = workflow.selectedEmail?.preview || "";
    if (storeSubject !== currentSubject) setCurrentSubject(storeSubject);
    if (storePreview !== currentPreview) setCurrentPreview(storePreview);
  }, [
    workflow.selectedEmail?.id,
    workflow.selectedEmail?.subject,
    workflow.selectedEmail?.preview,
  ]);

  // Get the email to display in the editor
  const displayEmail = useMemo(() => {
    return workflow.selectedEmail;
  }, [workflow.selectedEmail]);

  // Extract company domain for the "From:" field
  const companyDomain = useMemo(() => {
    const raw = workflow.briefData?.companyName || "";
    if (!raw) return "";
    try {
      const withProtocol = raw.includes("://") ? raw : `https://${raw}`;
      const hostname = new URL(withProtocol).hostname.replace(/^www\./, "");
      return decodeURIComponent(hostname).replace(/\s+/g, "");
    } catch {
      return decodeURIComponent(
        raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]
      ).replace(/\s+/g, "");
    }
  }, [workflow.briefData]);

  // Show loading state while restoring
  if (isRestoring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // No selected email → show empty state with CTA instead of silent redirect
  if (!workflow.selectedEmail) {
    return <EmptyStateRedirect step="customize" />;
  }

  const content = (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen relative overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-r from-blue-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-r from-blue-100/20 to-cyan-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="group inline-flex items-center text-slate-600 hover:text-blue-600 font-medium transition-all duration-200"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            Back to email options
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <ProgressBar currentStep={5} />
        </div>

        <div className="space-y-8">
          {/* Header with title */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
                Make It Yours
              </h1>
              <p className="text-muted-foreground">
                Customize and export your lifecycle email — fast, effective, and on-brand.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[65%_1fr] gap-5">
            {/* Email Editor */}
            <div className="min-w-0">
              <div>
                <EmailEditor
                  key={displayEmail?.id}
                  email={displayEmail!}
                  subject={currentSubject || displayEmail?.subject || ""}
                  preview={currentPreview || displayEmail?.preview || ""}
                  suggestionsLoading={suggestionsLoading}
                  companyDomain={companyDomain}
                  fromSenderName={workflow.briefData?.senderName}
                  onUpdate={handleEmailUpdate}
                  onExport={handleExport}
                  selectedUseCase={workflow.selectedUseCase || undefined}
                  isApplyingHistory={history.isApplyingHistory}
                  editorBodyGray={
                    (templateTweaks.backgroundStyle !== undefined &&
                      templateTweaks.backgroundStyle !== "default") ||
                    templateTweaks.footerBlendBackground ||
                    emailHasGrayBackground(displayEmail?.content || "")
                  }
                  editorBackgroundStyle={templateTweaks.backgroundStyle}
                  footerBlendBackground={templateTweaks.footerBlendBackground}
                  subjectPreviewInline={
                    displayEmail ? (
                      <EmailSubjectPreviewSection
                        key={displayEmail.id}
                        variant="inline"
                        email={displayEmail}
                        onUpdate={handleEmailUpdate}
                        onSubjectChange={handleSubjectChangeDirectly}
                        onPreviewChange={handlePreviewChangeDirectly}
                        onSuggestionsLoading={handleSuggestionsLoading}
                        selectedUseCase={workflow.selectedUseCase || null}
                      />
                    ) : null
                  }
                />
              </div>
            </div>

            {/* Side column: AI panel */}
            <div className="min-w-0 flex flex-col gap-4">
              <AIGeneratorPanel
                email={displayEmail!}
                onUpdate={handleEmailUpdate}
                onExport={handleExport}
                hideSubjectPreviewSection
                selectedUseCase={workflow.selectedUseCase || null}
                onSelectNewUseCase={(useCase: UseCase) => {
                  workflow.setUseCase(useCase);
                  navigate(`/email-generator/brief?useCase=${useCase}`);
                }}
                previewContainerGray={
                  (templateTweaks.backgroundStyle !== undefined &&
                    templateTweaks.backgroundStyle !== "default") ||
                  emailHasGrayBackground(displayEmail?.content || "")
                }
                companyDomain={companyDomain}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      {content}
      <Footer />
    </div>
  );
};

export default CustomizePage;
