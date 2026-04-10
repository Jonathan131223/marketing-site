import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "@/hooks/useAppStore";
import { useStateRestoration } from "@/hooks/useStateRestoration";
import { StatePersistence } from "@/store/persistence";
import { EmailGallery } from "@/components/email-generator/EmailGallery";
import { EmptyStateRedirect } from "@/components/email-generator/EmptyStateRedirect";
import { ProgressBar } from "@/components/email-generator/ProgressBar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { EmailTemplate, TemplateTweaks } from "@/types/emailGenerator";
import { TemplateTweaksSidebar, extractCtaColorFromHtml } from "@/components/email-generator/TemplateTweaksSidebar";
import { extractSocialIconsFromHtml } from "@/utils/templateTweaks";

const TemplatesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workflow } = useAppStore();
  const [isRestoring, setIsRestoring] = useState(true);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

  // Initialize state lazily from URL or Store
  const [templateTweaks, setTemplateTweaks] = useState<TemplateTweaks>(() => {
    const urlColor = searchParams.get("ctaColor");
    const urlSocialStyle = searchParams.get("socialStyle");
    const urlLogoAlign = searchParams.get("logoAlign");
    const urlCtaAlign = searchParams.get("ctaAlign");
    const urlCtaRadius = searchParams.get("ctaRadius");
    const urlFooterType = searchParams.get("footerType");
    const urlLogoBlend = searchParams.get("logoBlend");
    const urlFooterBlend = searchParams.get("footerBlend");
    const urlBackgroundStyle = searchParams.get("bgStyle") as
      | "default"
      | "gray"
      | "gray_border"
      | "gray_border_no_radius"
      | null;
    const urlEnabledIcons = searchParams.get("enabledIcons");
    const storeTweaks = (workflow as any)
      .templateTweaks as TemplateTweaks | null;

    // Default tweaks
    const initial: TemplateTweaks = {
      tone: "professional",
      ctaButtonLook: undefined,
      ctaButtonColor: undefined,
      ctaButtonAlignment: undefined,
      ctaButtonBorderRadius: undefined,
      iconFamily: "material",
      socialIconsFamily: undefined,
      language: "en",
      logoAlignment: undefined,
      logoBlendBackground: undefined,
      footerType: undefined,
      footerBlendBackground: undefined,
      backgroundStyle: undefined,
    };

    // If Store has tweaks, use them as base
    if (storeTweaks) {
      Object.assign(initial, storeTweaks);

      if (urlColor) initial.ctaButtonColor = urlColor;
      else if (storeTweaks.ctaButtonColor)
        initial.ctaButtonColor = storeTweaks.ctaButtonColor;

      if (urlSocialStyle) initial.socialIconsFamily = urlSocialStyle;
      else if (storeTweaks.socialIconsFamily)
        initial.socialIconsFamily = storeTweaks.socialIconsFamily;

      if (urlLogoAlign) initial.logoAlignment = urlLogoAlign;
      else if (storeTweaks.logoAlignment)
        initial.logoAlignment = storeTweaks.logoAlignment;

      if (urlCtaAlign) initial.ctaButtonAlignment = urlCtaAlign;
      else if (storeTweaks.ctaButtonAlignment)
        initial.ctaButtonAlignment = storeTweaks.ctaButtonAlignment;

      if (urlCtaRadius) initial.ctaButtonBorderRadius = urlCtaRadius;
      else if (storeTweaks.ctaButtonBorderRadius)
        initial.ctaButtonBorderRadius = storeTweaks.ctaButtonBorderRadius;

      if (
        urlFooterType &&
        urlFooterType !== "branded" &&
        urlFooterType !== "generated" &&
        urlFooterType !== "default"
      ) {
        initial.footerType = urlFooterType;
      } else if (
        storeTweaks.footerType &&
        storeTweaks.footerType !== "branded" &&
        storeTweaks.footerType !== "generated" &&
        storeTweaks.footerType !== "default"
      ) {
        initial.footerType = storeTweaks.footerType;
      }

      if (urlBackgroundStyle) initial.backgroundStyle = urlBackgroundStyle;
      else if (storeTweaks.backgroundStyle)
        initial.backgroundStyle = storeTweaks.backgroundStyle;

      if (urlEnabledIcons) {
        const parsed = urlEnabledIcons.split(",").filter(Boolean);
        if (parsed.length > 0) initial.enabledSocialIcons = parsed;
      } else if (storeTweaks.enabledSocialIcons) {
        initial.enabledSocialIcons = storeTweaks.enabledSocialIcons;
      }

      if (urlLogoBlend === "1") initial.logoBlendBackground = true;
      else if (storeTweaks.logoBlendBackground) initial.logoBlendBackground = storeTweaks.logoBlendBackground;

      if (urlFooterBlend === "1") initial.footerBlendBackground = true;
      else if (storeTweaks.footerBlendBackground) initial.footerBlendBackground = storeTweaks.footerBlendBackground;
    } else {
      if (urlColor) initial.ctaButtonColor = urlColor;
      if (urlSocialStyle) initial.socialIconsFamily = urlSocialStyle;
      if (urlLogoAlign) initial.logoAlignment = urlLogoAlign;
      if (urlCtaAlign) initial.ctaButtonAlignment = urlCtaAlign;
      if (urlCtaRadius) initial.ctaButtonBorderRadius = urlCtaRadius;
      if (
        urlFooterType &&
        urlFooterType !== "branded" &&
        urlFooterType !== "generated" &&
        urlFooterType !== "default"
      ) {
        initial.footerType = urlFooterType;
      }
      if (urlBackgroundStyle) initial.backgroundStyle = urlBackgroundStyle;
      if (urlEnabledIcons) {
        const parsed = urlEnabledIcons.split(",").filter(Boolean);
        if (parsed.length > 0) initial.enabledSocialIcons = parsed;
      }
      if (urlLogoBlend === "1") initial.logoBlendBackground = true;
      if (urlFooterBlend === "1") initial.footerBlendBackground = true;
    }

    return initial;
  });

  // Effect to sync URL if state has data but URL doesn't
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        let changed = false;

        if (templateTweaks.ctaButtonColor && !prev.has("ctaColor")) {
          newParams.set("ctaColor", templateTweaks.ctaButtonColor!);
          changed = true;
        }

        if (
          templateTweaks.socialIconsFamily &&
          templateTweaks.socialIconsFamily !== "branded" &&
          templateTweaks.socialIconsFamily !== "default" &&
          templateTweaks.socialIconsFamily !== "generated" &&
          !prev.has("socialStyle")
        ) {
          newParams.set("socialStyle", templateTweaks.socialIconsFamily);
          changed = true;
        }

        if (templateTweaks.logoAlignment && !prev.has("logoAlign")) {
          newParams.set("logoAlign", templateTweaks.logoAlignment);
          changed = true;
        }

        if (templateTweaks.ctaButtonAlignment && !prev.has("ctaAlign")) {
          newParams.set("ctaAlign", templateTweaks.ctaButtonAlignment);
          changed = true;
        }

        if (templateTweaks.ctaButtonBorderRadius && !prev.has("ctaRadius")) {
          newParams.set("ctaRadius", templateTweaks.ctaButtonBorderRadius);
          changed = true;
        }

        if (
          templateTweaks.footerType &&
          templateTweaks.footerType !== "branded" &&
          templateTweaks.footerType !== "generated" &&
          templateTweaks.footerType !== "default" &&
          !prev.has("footerType")
        ) {
          newParams.set("footerType", templateTweaks.footerType);
          changed = true;
        }

        if (
          templateTweaks.backgroundStyle &&
          templateTweaks.backgroundStyle !== "default" &&
          !prev.has("bgStyle")
        ) {
          newParams.set("bgStyle", templateTweaks.backgroundStyle);
          changed = true;
        }

        if (
          templateTweaks.enabledSocialIcons &&
          templateTweaks.enabledSocialIcons.length > 0 &&
          templateTweaks.enabledSocialIcons.length < 5 &&
          !prev.has("enabledIcons")
        ) {
          newParams.set("enabledIcons", templateTweaks.enabledSocialIcons.join(","));
          changed = true;
        }

        if (templateTweaks.logoBlendBackground && !prev.has("logoBlend")) {
          newParams.set("logoBlend", "1");
          changed = true;
        }
        if (templateTweaks.footerBlendBackground && !prev.has("footerBlend")) {
          newParams.set("footerBlend", "1");
          changed = true;
        }

        return changed ? newParams : prev;
      },
      { replace: true }
    );
  }, [
    templateTweaks.ctaButtonColor,
    templateTweaks.socialIconsFamily,
    templateTweaks.logoAlignment,
    templateTweaks.logoBlendBackground,
    templateTweaks.ctaButtonAlignment,
    templateTweaks.ctaButtonBorderRadius,
    templateTweaks.footerType,
    templateTweaks.footerBlendBackground,
    templateTweaks.enabledSocialIcons,
    setSearchParams,
  ]);

  // Handler for tweaks change - updates both State, Store and URL
  const handleTweaksChange = (newTweaks: TemplateTweaks) => {
    setTemplateTweaks(newTweaks);
    workflow.setTemplateTweaks(newTweaks);

    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);

        if (newTweaks.ctaButtonColor) {
          newParams.set("ctaColor", newTweaks.ctaButtonColor);
        } else {
          newParams.delete("ctaColor");
        }

        if (
          newTweaks.socialIconsFamily &&
          newTweaks.socialIconsFamily !== "branded" &&
          newTweaks.socialIconsFamily !== "default" &&
          newTweaks.socialIconsFamily !== "generated"
        ) {
          newParams.set("socialStyle", newTweaks.socialIconsFamily);
        } else {
          newParams.delete("socialStyle");
        }

        if (newTweaks.logoAlignment) {
          newParams.set("logoAlign", newTweaks.logoAlignment);
        } else {
          newParams.delete("logoAlign");
        }

        if (newTweaks.ctaButtonAlignment) {
          newParams.set("ctaAlign", newTweaks.ctaButtonAlignment);
        } else {
          newParams.delete("ctaAlign");
        }

        if (newTweaks.ctaButtonBorderRadius) {
          newParams.set("ctaRadius", newTweaks.ctaButtonBorderRadius);
        } else {
          newParams.delete("ctaRadius");
        }

        if (
          newTweaks.footerType &&
          newTweaks.footerType !== "branded" &&
          newTweaks.footerType !== "generated" &&
          newTweaks.footerType !== "default"
        ) {
          newParams.set("footerType", newTweaks.footerType);
        } else {
          newParams.delete("footerType");
        }

        if (newTweaks.logoBlendBackground) {
          newParams.set("logoBlend", "1");
        } else {
          newParams.delete("logoBlend");
        }
        if (newTweaks.footerBlendBackground) {
          newParams.set("footerBlend", "1");
        } else {
          newParams.delete("footerBlend");
        }

        if (
          newTweaks.backgroundStyle &&
          newTweaks.backgroundStyle !== "default"
        ) {
          newParams.set("bgStyle", newTweaks.backgroundStyle);
        } else {
          newParams.delete("bgStyle");
        }

        if (
          newTweaks.enabledSocialIcons &&
          newTweaks.enabledSocialIcons.length > 0 &&
          newTweaks.enabledSocialIcons.length < 5
        ) {
          newParams.set("enabledIcons", newTweaks.enabledSocialIcons.join(","));
        } else {
          newParams.delete("enabledIcons");
        }

        return newParams;
      },
      { replace: true }
    );
  };

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

  // Check for brief data in both store and localStorage. No auto-redirect
  // on missing state — fall through to EmptyStateRedirect below.
  // Deps: we intentionally omit `workflow` (new reference every render).
  // setBriefData is a stable useCallback from useAppStore.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isRestoring) return;
    if (hasCheckedRedirect) return;

    const briefDataFromStore = workflow.briefData;
    const briefDataFromStorage = StatePersistence.loadBriefData();

    if (briefDataFromStore || briefDataFromStorage) {
      if (!briefDataFromStore && briefDataFromStorage) {
        workflow.setBriefData(briefDataFromStorage);
      }
    }
    setHasCheckedRedirect(true);
  }, [workflow.briefData, isRestoring, hasCheckedRedirect]);

  const handleEmailSelect = (email: EmailTemplate) => {
    workflow.setSelectedEmail(email);
    // Navigate to customize step
    navigate("/email-generator/customize");
  };

  const handleBack = () => {
    if (workflow.selectedUseCase) {
      navigate(`/email-generator/brief?useCase=${workflow.selectedUseCase}`);
    } else {
      navigate("/email-generator/brief");
    }
  };

  // Check for brief data in localStorage as fallback
  const briefDataFromStorage = StatePersistence.loadBriefData();
  const finalBriefData = workflow.briefData || briefDataFromStorage;

  // Extract the CTA button color from the first template
  const templateCtaColor = useMemo(() => {
    const htmlContent = finalBriefData?.apiResponse?.html_content;
    if (htmlContent && htmlContent.length > 0) {
      const firstTemplate = htmlContent[0]?.html;
      const extracted = firstTemplate ? extractCtaColorFromHtml(firstTemplate) : undefined;
      if (extracted) {
        return extracted;
      }
    }
    return undefined;
  }, [finalBriefData?.apiResponse?.html_content]);

  // Extract which social icons exist in the original templates
  const detectedSocialIcons = useMemo(() => {
    const htmlContent = finalBriefData?.apiResponse?.html_content;
    if (htmlContent && htmlContent.length > 0) {
      const firstTemplate = htmlContent[0]?.html;
      if (firstTemplate) {
        const icons = extractSocialIconsFromHtml(firstTemplate);
        if (icons.length > 0) return icons;
      }
    }
    return undefined;
  }, [finalBriefData?.apiResponse?.html_content]);

  // Show loading state while restoring
  if (isRestoring || (!hasCheckedRedirect && !finalBriefData)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // No brief data → show empty state with CTA instead of silent redirect
  if (!finalBriefData) {
    return <EmptyStateRedirect step="templates" />;
  }

  const content = (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen relative overflow-hidden">
      {/* Premium background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-[90%]">
        <div className="mb-12">
          <button
            onClick={handleBack}
            className="group inline-flex items-center text-slate-600 hover:text-blue-600 font-medium transition-all duration-200 hover:translate-x-1"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            Back to brief
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <ProgressBar currentStep={4} />
        </div>

        {/* Main content with 90/10 split */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Templates Gallery - 90% width */}
          <div className="w-full lg:flex-[0.9]">
            <EmailGallery
              briefData={finalBriefData}
              onSelect={handleEmailSelect}
              templateTweaks={templateTweaks}
            />
          </div>

          {/* Template Tweaks Sidebar - 10% width, sticky on scroll */}
          <div className="w-full lg:flex-[0.1] lg:min-w-[260px]">
            <div className="lg:sticky lg:top-[105px]">
              <TemplateTweaksSidebar
                tweaks={templateTweaks}
                onTweaksChange={handleTweaksChange}
                templateCtaColor={templateCtaColor}
                detectedSocialIcons={detectedSocialIcons}
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

export default TemplatesPage;
