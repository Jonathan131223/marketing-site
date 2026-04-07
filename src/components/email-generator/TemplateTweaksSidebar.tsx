import React, { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TemplateTweaks } from "@/types/emailGenerator";
import { AlignLeft, AlignCenter, AlignRight, ChevronDown, Check } from "lucide-react";
import { ALL_SOCIAL_PLATFORMS } from "@/utils/templateTweaks";

export { type TemplateTweaks };

interface TemplateTweaksSidebarProps {
  tweaks: TemplateTweaks;
  onTweaksChange: (tweaks: TemplateTweaks) => void;
  /** Default CTA color extracted from the template (optional) */
  templateCtaColor?: string;
  /** Remove the top margin and shadow (for slide-in panels) */
  compact?: boolean;
  /** When true, show footer section as "Coming Soon" (blurred). Used in sequence mode. */
  footerComingSoon?: boolean;
  /** Show "Apply to all emails" vs "Current email only" (only on email-sequence-generator/customize) */
  showApplyToAllCheckbox?: boolean;
  /** When showApplyToAllCheckbox: true = apply to all emails, false = current email only */
  applyToAllEmails?: boolean;
  /** When showApplyToAllCheckbox: callback when user changes the option */
  onApplyToAllChange?: (applyToAll: boolean) => void;
  /** Social icons detected from the original template HTML. Used to populate the icon picker. */
  detectedSocialIcons?: string[];
}

// Utility to extract CTA button color from template HTML
export const extractCtaColorFromHtml = (html: string): string | null => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Look for the CTA button's bgcolor attribute
    const ctaContainer = doc.querySelector('[id="email-cta"]');
    if (ctaContainer) {
      // Find nested TD with bgcolor (the button itself)
      const buttonTd = ctaContainer.querySelector("td[bgcolor]");
      if (buttonTd) {
        const bgcolor = buttonTd.getAttribute("bgcolor");
        if (bgcolor && /^#[0-9A-Fa-f]{6}$/i.test(bgcolor)) {
          return bgcolor;
        }
      }

      // Also check inline styles on the button link
      const buttonLink = ctaContainer.querySelector("a");
      if (buttonLink) {
        const style = buttonLink.getAttribute("style") || "";
        const bgMatch = style.match(/background(?:-color)?:\s*(#[0-9A-Fa-f]{6})/i);
        if (bgMatch) {
          return bgMatch[1];
        }
      }
    }

    // Fallback: look for any button with bgcolor
    const anyButtonTd = doc.querySelector('td[bgcolor][style*="border-radius"]');
    if (anyButtonTd) {
      const bgcolor = anyButtonTd.getAttribute("bgcolor");
      if (bgcolor && /^#[0-9A-Fa-f]{6}$/i.test(bgcolor)) {
        return bgcolor;
      }
    }
  } catch (e) {
    console.error("Failed to extract CTA color:", e);
  }
  return null;
};

// Pretty labels for social platforms
const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  twitter: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
};

export const TemplateTweaksSidebar: React.FC<TemplateTweaksSidebarProps> = ({
  tweaks,
  onTweaksChange,
  templateCtaColor,
  compact = false,
  footerComingSoon = false,
  showApplyToAllCheckbox = false,
  applyToAllEmails = true,
  onApplyToAllChange,
  detectedSocialIcons,
}) => {
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const [socialDropdownOpen, setSocialDropdownOpen] = useState(false);
  const socialDropdownRef = useRef<HTMLDivElement>(null);

  // Use template color as default, fall back to purple
  const defaultColor = templateCtaColor || "#1D4ED8";

  // Local state for CTA Color and Radius (require Apply button)
  const [pendingColor, setPendingColor] = useState(tweaks.ctaButtonColor || defaultColor);
  const [pendingRadius, setPendingRadius] = useState(tweaks.ctaButtonBorderRadius || "50px");

  // Sync local state when tweaks prop changes or templateCtaColor changes
  useEffect(() => {
    setPendingColor(tweaks.ctaButtonColor || templateCtaColor || "#1D4ED8");
    setPendingRadius(tweaks.ctaButtonBorderRadius || "50px");
  }, [tweaks.ctaButtonColor, tweaks.ctaButtonBorderRadius, templateCtaColor]);

  // Preload social icons on mount
  useEffect(() => {
    const platforms = ["linkedin", "twitter", "instagram", "facebook", "youtube"];
    const suffixes = ["1", "2", "3", "4"];
    platforms.forEach((platform) => {
      suffixes.forEach((suffix) => {
        const img = new Image();
        img.src = `https://storage.googleapis.com/digistorms-assets/assets/socials/${platform}_${suffix}.png`;
      });
    });
  }, []);

  // Close social dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (socialDropdownRef.current && !socialDropdownRef.current.contains(e.target as Node)) {
        setSocialDropdownOpen(false);
      }
    };
    if (socialDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [socialDropdownOpen]);

  // Always show all 5 platforms in the dropdown
  const availableSocialIcons = [...ALL_SOCIAL_PLATFORMS];

  // Currently enabled icons: explicit tweaks > detected from template > all
  const enabledIcons = tweaks.enabledSocialIcons
    || (detectedSocialIcons && detectedSocialIcons.length > 0 ? detectedSocialIcons : [...ALL_SOCIAL_PLATFORMS]);

  const handleToggleSocialIcon = (platform: string) => {
    const currentEnabled = new Set(enabledIcons);
    if (currentEnabled.has(platform)) {
      // Don't allow disabling the last icon
      if (currentEnabled.size <= 1) return;
      currentEnabled.delete(platform);
    } else {
      currentEnabled.add(platform);
    }
    // Preserve canonical order
    const ordered = ALL_SOCIAL_PLATFORMS.filter((p) => currentEnabled.has(p));
    onTweaksChange({
      ...tweaks,
      enabledSocialIcons: ordered,
    });
  };

  // Auto-apply helper - immediately applies changes
  const applyTweak = (key: keyof TemplateTweaks, value: string | undefined) => {
    console.log(`🔄 Auto-applying ${key}:`, value);
    const updates: Partial<TemplateTweaks> = { [key]: value };

    // When changing footer type, ensure enabledSocialIcons is explicitly set
    // so the footer template doesn't show all 5 icons when only 3 were scraped
    if (key === "footerType" && !tweaks.enabledSocialIcons) {
      updates.enabledSocialIcons = [...enabledIcons];
    }

    onTweaksChange({
      ...tweaks,
      ...updates,
    });
  };

  // Alignment Pills Component
  const AlignmentSelector = ({
    value,
    onChange,
  }: {
    value: string | undefined;
    onChange: (val: string) => void;
  }) => {
    const alignments = [
      { value: "left", icon: AlignLeft, label: "Left" },
      { value: "center", icon: AlignCenter, label: "Center" },
      { value: "right", icon: AlignRight, label: "Right" },
    ];

    return (
      <div className="flex p-1 bg-slate-100 rounded-lg w-full gap-1">
        {alignments.map((align) => {
          const Icon = align.icon;
          const isSelected = value === align.value || (!value && align.value === "center");
          return (
            <button
              key={align.value}
              onClick={() => onChange(align.value)}
              className={`flex-1 flex items-center justify-center py-1.5 px-2 rounded-md text-sm transition-all duration-200 ${isSelected
                ? "bg-white shadow-sm text-blue-600 font-medium"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              title={align.label}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
    );
  };

  // Generic Pill Selector Component
  const PillSelector = ({
    options,
    value,
    onChange,
    columns = 2,
  }: {
    options: { value: string; label: string }[];
    value: string | undefined;
    onChange: (val: string) => void;
    columns?: number;
  }) => {
    return (
      <div
        className={`grid gap-1.5 p-1 bg-slate-100 rounded-lg`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {options.map((option) => {
          const isSelected = value === option.value || (!value && option.value === "generated");
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-200 ${isSelected
                ? "bg-white shadow-sm text-blue-600 border border-blue-200"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    );
  };

  // Normalize values for display
  const getNormalizedValue = (val: string | undefined, defaultVal: string = "generated") => {
    if (!val || val === "branded" || val === "default") return defaultVal;
    return val;
  };

  return (
    <div className={compact ? "relative" : "relative mt-[110px]"}>
      <div className={compact ? "h-fit" : "bg-white rounded-lg shadow-lg p-4 h-fit"}>
        {!compact && (
          <h3 className="text-base font-semibold text-slate-900 mb-4">
            Templates Editor
          </h3>
        )}

        <div className="space-y-5 pb-0">
          {/* Apply to all vs current email only - only in sequence customize */}
          {showApplyToAllCheckbox && onApplyToAllChange && (
            <>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-500">
                  Apply tweaks to
                </Label>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => onApplyToAllChange(true)}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${applyToAllEmails ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    All emails
                  </button>
                  <button
                    type="button"
                    onClick={() => onApplyToAllChange(false)}
                    className={`flex-1 py-2 px-3 text-sm font-medium transition-colors border-l border-slate-200 ${!applyToAllEmails ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    Current email
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {applyToAllEmails
                    ? "Changes apply to every email in the sequence."
                    : "Changes apply only to the currently selected email."}
                </p>
              </div>
              <div className="border-t border-slate-100" />
            </>
          )}

          {/* Logo Alignment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-slate-500">
                LOGO
              </Label>
              {tweaks.logoAlignment && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => applyTweak("logoAlignment", undefined)}
                >
                  Reset
                </Button>
              )}
            </div>
            <AlignmentSelector
              value={tweaks.logoAlignment}
              onChange={(val) => applyTweak("logoAlignment", val)}
            />

            {/* Blend-In Logo */}
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={tweaks.logoBlendBackground || false}
                onChange={(e) => {
                  onTweaksChange({
                    ...tweaks,
                    logoBlendBackground: e.target.checked || undefined,
                  });
                }}
                className="h-4 w-4 accent-blue-600 mt-0.5 shrink-0"
              />
              <div>
                <span className="text-sm text-slate-700">Blend-in logo</span>
                <p className="text-xs text-slate-400 mt-0.5">
                  Moves the logo above the content card. Works best with a non-white background.
                </p>
              </div>
            </label>
          </div>

          <div className="border-t border-slate-100" />

          {/* CTA Button Alignment */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-slate-500">
                CTA
              </Label>
              {tweaks.ctaButtonAlignment && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => applyTweak("ctaButtonAlignment", undefined)}
                >
                  Reset
                </Button>
              )}
            </div>
            <AlignmentSelector
              value={tweaks.ctaButtonAlignment}
              onChange={(val) => applyTweak("ctaButtonAlignment", val)}
            />
          </div>

          <div className="border-t border-slate-100" />

          {/* CTA Button Color */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-slate-500">
                CTA Color
              </Label>
              {tweaks.ctaButtonColor && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => {
                    setPendingColor(defaultColor);
                    applyTweak("ctaButtonColor", undefined);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <input
                ref={colorPickerRef}
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/i.test(pendingColor) ? pendingColor : defaultColor}
                onChange={(e) => setPendingColor(e.target.value)}
                className="w-8 h-8 border border-slate-300 rounded-md cursor-pointer flex-shrink-0"
                style={{ minWidth: "32px", maxWidth: "32px" }}
              />
              <input
                type="text"
                value={pendingColor}
                onChange={(e) => {
                  let hex = e.target.value.replace(/^#/, "").replace(/[^0-9A-Fa-f]/g, "");
                  if (hex.length > 6) hex = hex.substring(0, 6);
                  setPendingColor("#" + hex);
                }}
                placeholder={defaultColor}
                className="flex-1 px-1.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={pendingColor === (tweaks.ctaButtonColor || defaultColor)}
              onClick={() => applyTweak("ctaButtonColor", pendingColor)}
              className="w-full h-7 text-xs bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 disabled:opacity-40"
            >
              Apply
            </Button>
          </div>

          <div className="border-t border-slate-100" />

          {/* CTA Button Radius */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-slate-500">
                CTA Border Radius
              </Label>
              {tweaks.ctaButtonBorderRadius && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => {
                    setPendingRadius("50px");
                    applyTweak("ctaButtonBorderRadius", undefined);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={(() => {
                  const n = parseInt(pendingRadius, 10);
                  return Number.isNaN(n) ? 50 : Math.max(0, Math.min(50, n));
                })()}
                onChange={(e) => {
                  // Only update the display value during drag — don't trigger the
                  // expensive HTML rewrite on every tick (causes visual juggling)
                  setPendingRadius(e.target.value + "px");
                }}
                onMouseUp={(e) => {
                  // Apply the tweak once when the user releases the slider
                  const value = (e.target as HTMLInputElement).value + "px";
                  applyTweak("ctaButtonBorderRadius", value);
                }}
                onTouchEnd={(e) => {
                  const value = (e.target as HTMLInputElement).value + "px";
                  applyTweak("ctaButtonBorderRadius", value);
                }}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 w-12 text-center shrink-0">
                {pendingRadius}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Social Icons Style - Pill Buttons */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-slate-500">
                Social Icons
              </Label>
              {tweaks.socialIconsFamily &&
                !["generated", "branded", "default"].includes(tweaks.socialIconsFamily) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                    onClick={() => applyTweak("socialIconsFamily", "generated")}
                  >
                    Reset
                  </Button>
                )}
            </div>
            <PillSelector
              options={[
                { value: "generated", label: "Default" },
                { value: "colored", label: "Colored" },
                { value: "grey", label: "Grey" },
                { value: "black_filled", label: "Filled" },
                { value: "black_line", label: "Line" },
              ]}
              value={getNormalizedValue(tweaks.socialIconsFamily)}
              onChange={(val) => applyTweak("socialIconsFamily", val)}
              columns={3}
            />

            {/* Social Icons Picker - dropdown with checkboxes */}
            <div className="relative" ref={socialDropdownRef}>
              <button
                type="button"
                onClick={() => setSocialDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
              >
                <span className="font-medium">
                  {enabledIcons.length === availableSocialIcons.length
                    ? "All icons shown"
                    : `${enabledIcons.length} of ${availableSocialIcons.length} shown`}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 ${socialDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {socialDropdownOpen && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                  {availableSocialIcons.map((platform) => {
                    const isEnabled = enabledIcons.includes(platform);
                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handleToggleSocialIcon(platform)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-slate-50 transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            isEnabled
                              ? "bg-blue-600 border-blue-600"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isEnabled && <Check size={10} className="text-white" />}
                        </div>
                        <span className={isEnabled ? "text-slate-900 font-medium" : "text-slate-500"}>
                          {SOCIAL_LABELS[platform] || platform}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reset social icons selection — show all 5 */}
            {tweaks.enabledSocialIcons && tweaks.enabledSocialIcons.length < ALL_SOCIAL_PLATFORMS.length && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs w-fit"
                onClick={() => onTweaksChange({ ...tweaks, enabledSocialIcons: [...ALL_SOCIAL_PLATFORMS] })}
              >
                Reset selection
              </Button>
            )}
          </div>

          <div className="border-t border-slate-100" />

          {/* Footer Type - active in generic flow; "Coming Soon" in sequence mode */}
          <div className="relative">
            {footerComingSoon && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 rounded-lg flex items-center justify-center">
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              </div>
            )}
            <div className={`space-y-2 ${footerComingSoon ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-slate-500">
                  Footer
                </Label>
                {!footerComingSoon && tweaks.footerType &&
                  !["generated", "branded", "default"].includes(tweaks.footerType) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                      onClick={() => applyTweak("footerType", "generated")}
                    >
                      Reset
                    </Button>
                  )}
              </div>
              <PillSelector
                options={[
                  { value: "generated", label: "Default" },
                  { value: "centered_colored", label: "Centered" },
                  { value: "split", label: "Split" },
                  { value: "minimal", label: "Minimal" },
                  { value: "left", label: "Left" },
                  { value: "bordered_split", label: "Bordered" },
                ]}
                value={getNormalizedValue(tweaks.footerType)}
                onChange={(val) => applyTweak("footerType", val)}
                columns={3}
              />

              {/* Blend-In Footer */}
              <label className="flex items-start gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={tweaks.footerBlendBackground || false}
                  onChange={(e) => {
                    onTweaksChange({
                      ...tweaks,
                      footerBlendBackground: e.target.checked || undefined,
                    });
                  }}
                  className="h-4 w-4 accent-blue-600 mt-0.5 shrink-0"
                />
                <div>
                  <span className="text-sm text-slate-700">Blend-in footer</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Moves the footer below the content card. Works best with a non-white background.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* Background Style - Pill Buttons */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium text-slate-500">
                Background Type
              </Label>
              {tweaks.backgroundStyle && tweaks.backgroundStyle !== "default" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => applyTweak("backgroundStyle", undefined)}
                >
                  Reset
                </Button>
              )}
            </div>
            <PillSelector
              options={[
                { value: "default", label: "White" },
                { value: "gray", label: "Gray" },
                { value: "gray_border", label: "Round Border" },
                { value: "gray_border_no_radius", label: "Square Border" },
              ]}
              value={tweaks.backgroundStyle || "default"}
              onChange={(val) =>
                applyTweak(
                  "backgroundStyle",
                  val === "default" ? undefined : (val as "gray" | "gray_border" | "gray_border_no_radius")
                )
              }
              columns={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
