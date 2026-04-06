/**
 * Utility functions for applying template tweaks to email HTML
 */

import { TemplateTweaks } from "@/types/emailGenerator";

/** All known social platforms (order used for rendering) */
export const ALL_SOCIAL_PLATFORMS = ["linkedin", "twitter", "instagram", "facebook", "youtube"] as const;
export type SocialPlatform = (typeof ALL_SOCIAL_PLATFORMS)[number];

/**
 * Extract which social icon platforms are present in an email's HTML.
 * Returns an array like ["linkedin","twitter","instagram"].
 */
export function extractSocialIconsFromHtml(html: string): string[] {
  if (!html) return [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const found = new Set<string>();

    const imgs = doc.querySelectorAll(
      'img[src*="socials/"], img[alt*="linkedin" i], img[alt*="twitter" i], img[alt*="instagram" i], img[alt*="facebook" i], img[alt*="youtube" i], img[alt*="x" i]'
    );
    imgs.forEach((img) => {
      const src = img.getAttribute("src") || "";
      const alt = (img.getAttribute("alt") || "").toLowerCase();
      if (src.includes("linkedin") || alt.includes("linkedin")) found.add("linkedin");
      else if (src.includes("twitter") || alt.includes("twitter") || src.includes("x_") || alt === "x") found.add("twitter");
      else if (src.includes("instagram") || alt.includes("instagram")) found.add("instagram");
      else if (src.includes("facebook") || alt.includes("facebook")) found.add("facebook");
      else if (src.includes("youtube") || alt.includes("youtube")) found.add("youtube");
    });

    // Return in canonical order
    return ALL_SOCIAL_PLATFORMS.filter((p) => found.has(p));
  } catch {
    return [];
  }
}

// Footer Templates Generator - shared between EmailGallery and sequence mode
export const getFooterHTML = (
  type: string,
  data: {
    unsubscribeHref: string;
    copyrightText: string;
    logoSrc: string;
    socialSuffix: string;
  }
): string => {
  const { unsubscribeHref, copyrightText, logoSrc, socialSuffix } = data;

  // Always include all platforms — the display:none filter in applyTemplateTweaksToHtml
  // handles showing/hiding individual icons. This ensures icons stay in the DOM for toggling.
  const platforms = [...ALL_SOCIAL_PLATFORMS];

  // Helper: build a social icon TD (large size, for centered / left footers)
  const socialTdLarge = (platform: string, suffix: string) =>
    `<td class="active-i" align="center"><a style="text-decoration:none;" href="#"><img src="https://storage.googleapis.com/digistorms-assets/assets/socials/${platform}_${suffix}.png" width="35" style="width:35px; font:bold 16px/20px Arial, Helvetica, sans-serif; color:#000; vertical-align:top;" alt="${platform}" border="0"></a></td>`;

  // Helper: build a social icon TD (small size, for split / bordered footers)
  const socialTdSmall = (platform: string, suffix: string) =>
    `<td class="active-i" align="center"><a style="text-decoration:none;" href="#"><img src="https://storage.googleapis.com/digistorms-assets/assets/socials/${platform}_${suffix}.png" width="22" style="width:22px; font:bold 16px/20px Arial, Helvetica, sans-serif; color:#000; vertical-align:top;" alt="${platform === "twitter" ? "x" : platform}" border="0"></a></td>`;

  // Build dynamic social rows from the enabled platforms list
  const buildSocialRow = (builder: (p: string, s: string) => string, gap: string) =>
    platforms.map((p, i) => builder(p, socialSuffix) + (i < platforms.length - 1 ? `<td width="${gap}"></td>` : "")).join("\n       ");

  // Common Socials HTML Block (centered)
  const socialsHTML = `
     <table align="center" style="margin:0 auto;" cellpadding="0" cellspacing="0"><tbody><tr>
       ${buildSocialRow(socialTdLarge, "15")}
     </tr></tbody></table>
   `;

  // Left-aligned Socials HTML Block
  const socialsHTMLLeft = `
     <table align="left" style="margin:0;" cellpadding="0" cellspacing="0"><tbody><tr>
       ${buildSocialRow(socialTdLarge, "15")}
     </tr></tbody></table>
   `;

  // Smaller version for split layout
  const socialsHTMLSmall = `
     <table class="t-c" cellpadding="0" cellspacing="0">
        <tbody><tr>${buildSocialRow(socialTdSmall, "10")}</tr>
     </tbody></table>
  `;

  if (type === "split") {
    // Type 2
    return `
            <tr>
              <td class="pb-30" style="padding: 0 15px 38px">
                <table class="w-100p maxw-540" width="566" align="center" style="margin: 0 auto" cellpadding="0" cellspacing="0">
                  <tbody><tr>
                    <td class="pb-20" style="padding: 0 0 24px">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tbody><tr class="thold email-block">
                          <th class="tfoot" width="142" align="center" style="vertical-align: top">
                            <div class="m-0" style="margin: 0 0 0 3px">
                              <a style="text-decoration: none" href="#">
                                <img src="${logoSrc}" width="142" style="
                                    width: 142px;
                                    font: bold 16px/20px Arial, Helvetica,
                                      sans-serif;
                                    color: #000;
                                    vertical-align: top;
                                  " alt="logo" border="0">
                              </a>
                            </div>
                          </th>
                          <th class="trow" width="20" height="15" style="line-height: 1px; font-size: 1px"></th>
                          <th class="thead" align="left">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tbody><tr class="email-block">
                                <td class="p-0" align="right" style="padding: 0 13px 0 0" id="email-socials">
                                  ${socialsHTMLSmall}
                                </td>
                              </tr>
                            </tbody></table>
                          </th>
                        </tr>
                      </tbody></table>
                    </td>
                  </tr>
                  <tr class="email-block">
                    <td class="ta-c h-u p-0" style="
                        padding: 0 13px;
                        font: 12px/14px Arial, Helvetica, sans-serif, Inter;
                        color: #505457;
                      ">
                      <p style="margin: 0 0 10px">
                        ${copyrightText}
                      </p>
                      <a style="color: #505457; text-decoration: underline" href="${unsubscribeHref}">Unsubscribe</a>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
     `;
  }

  if (type === "minimal") {
    // Type 3 - 10px top padding for breathing room on templates 2, 5, 6, 10-18
    return `
            <tr>
              <td class="pb-30" style="padding: 17px 15px 30px">
                <table width="540" align="center" style="
                    max-width: 540px;
                    width: 100% !important;
                    margin: 0 auto;
                  " cellpadding="0" cellspacing="0">
                  <tbody><tr class="email-block">
                    <td class="pb-30" id="email-socials" style="padding: 0 0 38px">
                      ${socialsHTML}
                    </td>
                  </tr>
                  <tr class="email-block">
                    <td class="ta-c h-u" style="
                        font: 11px/14px Arial, Helvetica, sans-serif, Inter;
                        color: #505050;
                      ">
                      <p style="margin: 0 0 20px">
                        ${copyrightText}
                      </p>
                      <a style="color: #505050; text-decoration: underline" href="${unsubscribeHref}">Unsubscribe</a>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
     `;
  }

  if (type === "left") {
    // Left-aligned footer (like templates 5, 6, 7)
    return `
            <tr>
              <td class="pb-30" style="padding: 0 15px 38px">
                <table width="540" align="left" style="max-width: 540px; width: 100% !important; margin: 0" cellpadding="0" cellspacing="0">
                  <tbody><tr class="email-block">
                    <td class="pb-30" id="email-socials" style="padding: 0 0 38px">
                      ${socialsHTMLLeft}
                    </td>
                  </tr>
                  <tr class="email-block">
                    <td class="ta-c h-u" style="
                        font: 11px/14px Arial, Helvetica, sans-serif, Inter;
                        color: #505050;
                      ">
                      <p style="margin: 0 0 20px">
                        ${copyrightText}
                      </p>
                      <a style="color: #505050; text-decoration: underline" href="${unsubscribeHref}">Unsubscribe</a>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
     `;
  }

  if (type === "centered_colored") {
    // Centered footer with colored social icons (uses provided suffix, falls back to _3)
    const coloredSuffix = socialSuffix || "3";
    const socialsHTMLColored = `
       <table align="center" style="margin:0 auto;" cellpadding="0" cellspacing="0"><tbody><tr>
         ${platforms.map((p, i) => socialTdLarge(p, coloredSuffix) + (i < platforms.length - 1 ? '<td width="15"></td>' : "")).join("\n         ")}
       </tr></tbody></table>
     `;
    return `
            <tr>
              <td id="email-footer" class="pb-30" style="padding: 0 15px 38px">
                <table width="540" align="center" style="
                    max-width: 540px;
                    width: 100% !important;
                    margin: 0 auto;
                  " cellpadding="0" cellspacing="0">
                  <tbody><tr class="email-block">
                    <td id="email-socials" class="pb-30" style="padding: 19px 0 19px">
                      <table align="center" style="margin: 0 auto" cellpadding="0" cellspacing="0">
                        <tbody><tr>
                          <td align="center">${socialsHTMLColored}</td>
                        </tr>
                      </tbody></table>
                    </td>
                  </tr>
                  <tr class="email-block">
                    <td id="email-copy" align="center" style="
                        font: 11px/14px Arial, Helvetica, sans-serif, Inter;
                        color: #505050;
                        padding: 10px 0;
                      ">
                      <p style="margin: 0 0 30px">
                        ${copyrightText}
                      </p>
                      <a style="color: #505050; text-decoration: underline" href="${unsubscribeHref}">Unsubscribe</a>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
     `;
  }

  if (type === "bordered_split") {
    // Bordered Split: Text/unsubscribe at top with border, then logo left + socials right below
    // Uses provided suffix, falls back to grey (_4)
    const borderedSuffix = socialSuffix || "4";
    const socialsHTMLRight = `
       <table class="t-c" cellpadding="0" cellspacing="0"><tbody><tr>
         ${platforms.map((p, i) => socialTdSmall(p, borderedSuffix) + (i < platforms.length - 1 ? '<td width="15"></td>' : "")).join("\n         ")}
       </tr></tbody></table>
     `;
    return `
            <tr>
              <td id="email-footer" class="pb-30" style="padding: 30px 15px 38px">
                <table width="595" align="center" style="max-width: 595px; width: 100% !important; margin: 0 auto;" cellpadding="0" cellspacing="0">
                  <tbody>
                    <tr class="email-block">
                      <td class="ta-c" style="padding: 0 0 27px; font: 12px/21px Arial, Helvetica, sans-serif, Inter; color: #848484; letter-spacing: 0.15px; border-bottom: 1px solid #e8e8e8;">
                        If you'd rather not receive this kind of email, you can <a style="color: #848484; text-decoration: underline;" href="${unsubscribeHref}">Unsubscribe</a> or manage your email&nbsp;<span class="h-u"><a style="color: #848484; text-decoration: none;" href="#">preferences</a></span>.<br/>
                        ${copyrightText}
                      </td>
                    </tr>
                    <tr class="email-block">
                      <td style="padding: 24px 0 0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tbody><tr>
                            <th class="tflex" width="142" align="center" style="vertical-align: top;">
                              <a style="text-decoration: none;" href="#">
                                <img src="${logoSrc}" width="142" style="width: 142px; font: bold 16px/20px Arial, Helvetica, sans-serif; color: #000; vertical-align: top;" alt="logo" border="0">
                              </a>
                            </th>
                            <th class="tflex" width="30" height="20" style="line-height: 1px; font-size: 1px;"></th>
                            <th class="tflex" align="right" id="email-socials">
                              ${socialsHTMLRight}
                            </th>
                          </tr></tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
     `;
  }

  // Default / Branded (Type 1)
  return `
            <tr>
              <td id="email-footer" class="pb-30" style="padding: 0 15px 38px">
                <table width="540" align="center" style="
                    max-width: 540px;
                    width: 100% !important;
                    margin: 0 auto;
                  " cellpadding="0" cellspacing="0">
                  <tbody><tr class="email-block">
                    <td id="email-socials" class="pb-30" style="padding: 19px 0 19px">
                      ${socialsHTML}
                    </td>
                  </tr>
                  <tr class="email-block">
                    <td id="email-copy" align="center" style="
                        font: 11px/14px Arial, Helvetica, sans-serif, Inter;
                        color: #505050;
                        padding: 10px 0;
                      ">
                      <p style="margin: 0 0 30px">
                        ${copyrightText}
                      </p>
                      <a style="color: #505050; text-decoration: underline" href="${unsubscribeHref}">Unsubscribe</a>
                    </td>
                  </tr>
                </tbody></table>
              </td>
            </tr>
   `;
};

/**
 * Apply template tweaks to email HTML content
 * Always applies values (using defaults when undefined) to support reset functionality
 */
export function applyTemplateTweaksToHtml(
  htmlContent: string,
  tweaks: TemplateTweaks
): string {
  if (!htmlContent) return htmlContent;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    let changed = false;

    // Detect current social icon style suffix from existing icons BEFORE any modifications
    // This preserves the scraped style (e.g. _4 for grey) as the fallback
    let detectedSocialSuffix = "3"; // default if no icons exist
    const existingSocialImg = doc.querySelector('img[src*="socials/"]');
    if (existingSocialImg) {
      const srcForDetection = existingSocialImg.getAttribute("src") || "";
      const suffixMatch = srcForDetection.match(/_(\d+)\.png/);
      if (suffixMatch) {
        detectedSocialSuffix = suffixMatch[1];
      }
    }

    // Apply Logo Alignment — only when explicitly set by user.
    // undefined = preserve the template's original alignment so that
    // left-aligned logos stay left when blended in.
    if (tweaks.logoAlignment) {
      const align = tweaks.logoAlignment;
      const logoHeader = doc.querySelector('[id="email-header-image"]');
      if (logoHeader) {
        if (logoHeader.tagName === "TD") {
          logoHeader.setAttribute("align", align);
          (logoHeader as HTMLElement).style.textAlign = align;
          changed = true;
        } else {
          const td = logoHeader.closest("td");
          if (td) {
            td.setAttribute("align", align);
            td.style.textAlign = align;
            changed = true;
          }
        }
      }
    }

    // Apply CTA Button Alignment (default: center)
    {
      const align = tweaks.ctaButtonAlignment || "center";
      const ctaContainer = doc.querySelector('[id="email-cta"]');
      if (ctaContainer) {
        // Update the outer TD
        if (ctaContainer.tagName === "TD") {
          ctaContainer.setAttribute("align", align);
          (ctaContainer as HTMLElement).style.textAlign = align;
        }
        
        // CRITICAL: Also update the inner table that contains the button
        const innerTable = ctaContainer.querySelector("table");
        if (innerTable) {
          innerTable.setAttribute("align", align);
          if (align === "left") {
            (innerTable as HTMLElement).style.margin = "0";
          } else if (align === "right") {
            (innerTable as HTMLElement).style.margin = "0 0 0 auto";
          } else {
            (innerTable as HTMLElement).style.margin = "0 auto";
          }
          changed = true;
        }
      }
    }

    // Apply CTA Button Color
    if (tweaks.ctaButtonColor) {
      const color = tweaks.ctaButtonColor;
      const ctaContainer = doc.querySelector('[id="email-cta"]');
      if (ctaContainer) {
        // Find the button TD - it's inside the inner table
        // Look for TD with bgcolor attribute OR the TD containing the button link
        let buttonTd = ctaContainer.querySelector("td[bgcolor]");
        if (!buttonTd) {
          // Fallback: find TD that contains the anchor
          const anchor = ctaContainer.querySelector("a[data-gemini-button]") || ctaContainer.querySelector("a");
          if (anchor) {
            buttonTd = anchor.closest("td");
          }
        }
        
        if (buttonTd) {
          buttonTd.setAttribute("bgcolor", color);
          (buttonTd as HTMLElement).style.backgroundColor = color;
          changed = true;
        }

        // Update the link style (some templates have bg on the link)
        const buttonLink = ctaContainer.querySelector("a[data-gemini-button]") || ctaContainer.querySelector("a");
        if (buttonLink) {
          // Don't add background-color to the link if it's on the TD
          // Just ensure the color is set if it was already there
          const currentStyle = buttonLink.getAttribute("style") || "";
          if (currentStyle.includes("background")) {
            const newStyle = currentStyle
              .replace(/background(-color)?:\s*[^;]+;?/gi, "")
              .trim();
            buttonLink.setAttribute(
              "style",
              `${newStyle}; background-color: ${color};`.replace(/^;\s*/, "")
            );
          }
          changed = true;
        }
      }
    }

    // Apply CTA Button Border Radius
    // Only apply when explicitly set by user — undefined = don't touch template's original radius
    if (tweaks.ctaButtonBorderRadius) {
      const radius = tweaks.ctaButtonBorderRadius;
      const ctaContainer = doc.querySelector('[id="email-cta"]');
      if (ctaContainer) {
        // Find the button TD
        let buttonTd = ctaContainer.querySelector("td[bgcolor]");
        if (!buttonTd) {
          const anchor = ctaContainer.querySelector("a[data-gemini-button]") || ctaContainer.querySelector("a");
          if (anchor) {
            buttonTd = anchor.closest("td");
          }
        }
        
        if (buttonTd) {
          const currentStyle = (buttonTd as HTMLElement).getAttribute("style") || "";
          const newStyle = currentStyle
            .replace(/border-radius:\s*[^;]+;?/gi, "")
            .trim();
          (buttonTd as HTMLElement).setAttribute(
            "style",
            `${newStyle}; border-radius: ${radius};`.replace(/^;\s*/, "")
          );
          changed = true;
        }

        // Also update the link's border-radius for click area
        const buttonLink = ctaContainer.querySelector("a[data-gemini-button]") || ctaContainer.querySelector("a");
        if (buttonLink) {
          const currentStyle = buttonLink.getAttribute("style") || "";
          const newStyle = currentStyle
            .replace(/border-radius:\s*[^;]+;?/gi, "")
            .trim();
          buttonLink.setAttribute(
            "style",
            `${newStyle}; border-radius: ${radius};`.replace(/^;\s*/, "")
          );
          changed = true;
        }
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // IMPORTANT: Footer replacement MUST happen BEFORE social icon style/filter
    // so the new footer's icons get styled and filtered correctly.
    // ──────────────────────────────────────────────────────────────────────

    // Footer Type - Replace entire footer HTML (same logic as EmailGallery)
    // Only process if footerType is explicitly set (even to "generated" which means Default)
    // undefined = never touched, don't change footer
    // "generated" or "default" or "branded" = explicitly selected default, apply centered_colored
    // other values = apply that specific type
    if (tweaks.footerType) {
      const effectiveFooterType = ["default", "branded", "generated"].includes(tweaks.footerType)
        ? "centered_colored" // Default footer style
        : tweaks.footerType;
      // Find existing footer
      // 1. Try ID
      let footer: Element | null = doc.querySelector('[id="email-footer"]');
      // 2. Try finding last main row if ID missing
      if (!footer) {
        const mainTable = doc.querySelector(
          "#emailWrapper > tbody > tr > td > table"
        );
        if (mainTable) {
          const rows = mainTable.querySelectorAll(":scope > tbody > tr");
          if (rows.length > 0) {
            // Find the last row that looks like a footer (contains "unsubscribe")
            for (let i = rows.length - 1; i >= 0; i--) {
              const row = rows[i] as HTMLElement;
              if (row.getAttribute("data-digistorms-badge") === "1") continue;
              if (row.textContent?.toLowerCase().includes("unsubscribe")) {
                footer = row;
                break;
              }
            }
          }
        }
      }

      // If still not found, try any element containing unsubscribe link
      if (!footer) {
        const unsub = doc.querySelector('a[href*="unsubscribe"]');
        if (unsub) {
          footer =
            unsub.closest("tr.email-block")?.parentElement?.closest("tr") ||
            (unsub
              .closest("table")
              ?.closest("td")
              ?.closest("tr") as HTMLElement);
        }
      }

      if (footer) {
        // Extract Data
        const unsubLink = doc.querySelector('a[href*="unsubscribe"]');
        const unsubscribeHref = unsubLink
          ? unsubLink.getAttribute("href") || "https://unsubscribe.com"
          : "https://unsubscribe.com";

        let copyrightText = "Company Name © " + new Date().getFullYear() + ".<br>Address, City";
        const copyrightP =
          doc.querySelector("#email-copy p") ||
          Array.from(doc.querySelectorAll("p")).find((p) =>
            p.textContent?.includes("©")
          );
        if (copyrightP) {
          copyrightText = copyrightP.innerHTML;
        }

        // Logo Src (for Split footer)
        let logoImg = doc.querySelector("#email-header-image img");
        if (!logoImg) {
          logoImg = doc.querySelector(
            'img[alt*="logo" i], img[alt*="header" i], img[alt*="digistorms" i]'
          );
        }
        const logoSrc = logoImg
          ? logoImg.getAttribute("src") ||
            "https://api.digistorms.net/assets/user_uploads/a04e6929-b128-48ff-aba6-200dcd066c71.jpg"
          : "https://api.digistorms.net/assets/user_uploads/a04e6929-b128-48ff-aba6-200dcd066c71.jpg";

        // Determine social suffix based on tweaks, falling back to detected (scraped) style
        const socialStyleMap: Record<string, string> = {
          black_filled: "1",
          black_line: "2",
          colored: "3",
          grey: "4",
        };
        const socialSuffix =
          tweaks.socialIconsFamily && socialStyleMap[tweaks.socialIconsFamily]
            ? socialStyleMap[tweaks.socialIconsFamily]
            : detectedSocialSuffix;

        // Generate New Footer HTML (always includes all 5 icons; style + filter applied below)
        const newFooterHTML = getFooterHTML(effectiveFooterType, {
          unsubscribeHref,
          copyrightText,
          logoSrc,
          socialSuffix,
        });

        // Replace footer
        let targetTr = footer;
        if (footer.tagName === "TD") {
          targetTr = footer.parentElement as Element;
        }

        // Create a temp container to parse the new HTML string
        const tempContainer = doc.createElement("tbody");
        tempContainer.innerHTML = newFooterHTML;
        const newTr = tempContainer.firstElementChild;

        if (targetTr && targetTr.parentNode && newTr) {
          targetTr.parentNode.replaceChild(newTr, targetTr);
          changed = true;
          console.log(
            `🎨 applyTemplateTweaksToHtml: Replaced Footer with type: ${effectiveFooterType}`
          );
        }
      }
    }

    // Apply Social Icons Style (runs AFTER footer replacement so new footer icons are styled too)
    // Only apply when socialIconsFamily is explicitly set (including "generated"/"branded"/"default" which reset to colored)
    // undefined = never touched by user → don't modify social icons
    if (tweaks.socialIconsFamily) {
      const styleMap: Record<string, string> = {
        black_filled: "1",
        black_line: "2",
        colored: "3",
        grey: "4",
      };
      // "generated", "branded", "default" all reset to colored (suffix 3)
      const suffix = styleMap[tweaks.socialIconsFamily] || "3";

      const socialIcons = doc.querySelectorAll(
        'img[src*="socials/"], img[alt*="linkedin" i], img[alt*="twitter" i], img[alt*="instagram" i], img[alt*="facebook" i], img[alt*="youtube" i], img[alt*="x" i]'
      );
      socialIcons.forEach((img) => {
        const src = img.getAttribute("src") || "";
        const alt = (img.getAttribute("alt") || "").toLowerCase();
        
        // Determine platform from src or alt
        let platform = "";
        if (src.includes("linkedin") || alt.includes("linkedin")) platform = "linkedin";
        else if (src.includes("twitter") || alt.includes("twitter") || src.includes("x_") || alt === "x") platform = "twitter";
        else if (src.includes("instagram") || alt.includes("instagram")) platform = "instagram";
        else if (src.includes("facebook") || alt.includes("facebook")) platform = "facebook";
        else if (src.includes("youtube") || alt.includes("youtube")) platform = "youtube";

        if (platform) {
          const newSrc = `https://storage.googleapis.com/digistorms-assets/assets/socials/${platform}_${suffix}.png`;
          if (img.getAttribute("src") !== newSrc) {
            img.setAttribute("src", newSrc);
            changed = true;
          }
        }
      });
    }

    // Apply Enabled Social Icons filter (runs AFTER footer replacement so new footer icons are filtered too)
    // Always runs to ensure previously-hidden icons get un-hidden when selection changes
    // Also CREATES missing icon elements for platforms that are enabled but not in the DOM
    // undefined = show all, explicit array = show only those
    {
      const enabled = tweaks.enabledSocialIcons
        ? new Set(tweaks.enabledSocialIcons)
        : null; // null means "show all"

      const foundPlatforms = new Set<string>();
      let iconRow: Element | null = null;
      let iconWidth = "35";

      const socialIcons = doc.querySelectorAll(
        'img[src*="socials/"], img[alt*="linkedin" i], img[alt*="twitter" i], img[alt*="instagram" i], img[alt*="facebook" i], img[alt*="youtube" i], img[alt*="x" i]'
      );
      socialIcons.forEach((img) => {
        const src = img.getAttribute("src") || "";
        const alt = (img.getAttribute("alt") || "").toLowerCase();
        let platform = "";
        if (src.includes("linkedin") || alt.includes("linkedin")) platform = "linkedin";
        else if (src.includes("twitter") || alt.includes("twitter") || src.includes("x_") || alt === "x") platform = "twitter";
        else if (src.includes("instagram") || alt.includes("instagram")) platform = "instagram";
        else if (src.includes("facebook") || alt.includes("facebook")) platform = "facebook";
        else if (src.includes("youtube") || alt.includes("youtube")) platform = "youtube";

        if (platform) {
          foundPlatforms.add(platform);
          const iconTd = img.closest("td.active-i") || img.closest("td");
          if (iconTd) {
            // Track the row containing social icons for injection of missing icons
            if (!iconRow) {
              iconRow = iconTd.parentElement as Element;
              const w = img.getAttribute("width");
              if (w) iconWidth = w;
            }

            // null = show all; Set = show only those in the set
            const shouldHide = enabled ? !enabled.has(platform) : false;
            // Find associated spacer td (next or previous sibling with width attr)
            const nextSibling = iconTd.nextElementSibling;
            const prevSibling = iconTd.previousElementSibling;
            const spacer = (nextSibling && nextSibling.tagName === "TD" && nextSibling.getAttribute("width") && !nextSibling.querySelector("img"))
              ? nextSibling
              : (prevSibling && prevSibling.tagName === "TD" && prevSibling.getAttribute("width") && !prevSibling.querySelector("img"))
                ? prevSibling
                : null;

            (iconTd as HTMLElement).style.display = shouldHide ? "none" : "";
            if (spacer) {
              (spacer as HTMLElement).style.display = shouldHide ? "none" : "";
            }
            changed = true;
          }
        }
      });

      // Fallback: find icon row from #email-socials container if no icons were found
      if (!iconRow) {
        const socialsContainer = doc.querySelector("#email-socials");
        if (socialsContainer) {
          iconRow = socialsContainer.querySelector("table tr");
        }
      }

      // Inject missing icons: enabled platforms that don't exist in the DOM yet
      if (enabled && iconRow) {
        const missingPlatforms = ALL_SOCIAL_PLATFORMS.filter(
          (p) => enabled.has(p) && !foundPlatforms.has(p)
        );

        if (missingPlatforms.length > 0) {
          const styleMap: Record<string, string> = {
            black_filled: "1",
            black_line: "2",
            colored: "3",
            grey: "4",
          };
          const suffix =
            tweaks.socialIconsFamily && styleMap[tweaks.socialIconsFamily]
              ? styleMap[tweaks.socialIconsFamily]
              : detectedSocialSuffix;
          const spacerWidth = iconWidth === "22" ? "10" : "15";

          for (const platform of missingPlatforms) {
            const spacerTd = doc.createElement("td");
            spacerTd.setAttribute("width", spacerWidth);

            const iconTd = doc.createElement("td");
            iconTd.className = "active-i";
            iconTd.setAttribute("align", "center");
            const altText = platform === "twitter" ? "x" : platform;
            iconTd.innerHTML = `<a style="text-decoration:none;" href="#"><img src="https://storage.googleapis.com/digistorms-assets/assets/socials/${platform}_${suffix}.png" width="${iconWidth}" style="width:${iconWidth}px; font:bold 16px/20px Arial, Helvetica, sans-serif; color:#000; vertical-align:top;" alt="${altText}" border="0"></a>`;

            iconRow.appendChild(spacerTd);
            iconRow.appendChild(iconTd);
            changed = true;
          }

          console.log(
            `🎨 applyTemplateTweaksToHtml: Injected missing social icons: ${missingPlatforms.join(", ")}`
          );
        }
      }
    }

    // Apply Background Style (always apply, default resets to white)
    {
      const wrapper = doc.querySelector("#emailWrapper");
      if (wrapper) {
        const wrapperTd = wrapper.querySelector(":scope > tbody > tr > td");
        const contentTable = wrapperTd?.querySelector(':scope > table:not([data-blended-logo="1"])');
        const bgStyle = tweaks.backgroundStyle || "default";
        
        if (wrapperTd) {
          // Reset to defaults first
          wrapperTd.removeAttribute("bgcolor");
          (wrapperTd as HTMLElement).style.backgroundColor = "";
          if (contentTable) {
            (contentTable as HTMLElement).style.border = "";
            (contentTable as HTMLElement).style.borderRadius = "";
            (contentTable as HTMLElement).style.overflow = "";
          }
          
          // Apply new style
          switch (bgStyle) {
            case "gray":
              wrapperTd.setAttribute("bgcolor", "#f3f4f6");
              (wrapperTd as HTMLElement).style.backgroundColor = "#f3f4f6";
              break;
            case "gray_border":
              wrapperTd.setAttribute("bgcolor", "#f3f4f6");
              (wrapperTd as HTMLElement).style.backgroundColor = "#f3f4f6";
              if (contentTable) {
                (contentTable as HTMLElement).style.border = "1px solid #e5e7eb";
                (contentTable as HTMLElement).style.borderRadius = "8px";
                (contentTable as HTMLElement).style.overflow = "hidden";
              }
              break;
            case "gray_border_no_radius":
              wrapperTd.setAttribute("bgcolor", "#f3f4f6");
              (wrapperTd as HTMLElement).style.backgroundColor = "#f3f4f6";
              if (contentTable) {
                (contentTable as HTMLElement).style.border = "1px solid #e5e7eb";
                (contentTable as HTMLElement).style.borderRadius = "0";
              }
              break;
            // "default" - already reset above, white background
          }
          changed = true;
        }
      }
    }

    // Logo Blend-In — move logo above the content card so it sits in the outer background area
    // Runs LAST so that all other tweaks (logo alignment, background style) are already applied.
    {
      const blendIn = tweaks.logoBlendBackground === true;
      const wrapper = doc.querySelector("#emailWrapper");
      const wrapperTd = wrapper?.querySelector(":scope > tbody > tr > td");
      const blendedLogo = doc.querySelector('table[data-blended-logo="1"]');

      // Find the real content table (skip the blended logo table if present)
      let blendContentTable: Element | null = null;
      if (wrapperTd) {
        const directTables = wrapperTd.querySelectorAll(":scope > table");
        for (const t of Array.from(directTables)) {
          if (t.getAttribute("data-blended-logo") === "1") continue;
          blendContentTable = t;
          break;
        }
      }

      if (blendIn && wrapperTd && blendContentTable) {
        if (!blendedLogo) {
          // Logo is inside the content card — extract it and place above
          let logoHeader: Element | null = doc.querySelector('[id="email-header-image"]');
          if (!logoHeader) {
            // Fallback: find first tr.email-block whose TD directly contains a linked logo image
            const blocks = doc.querySelectorAll("tr.email-block");
            for (let i = 0; i < Math.min(blocks.length, 3); i++) {
              const td = blocks[i].querySelector(":scope > td");
              if (!td) continue;
              const link = td.querySelector(":scope > a");
              const img = link?.querySelector("img");
              if (!img) continue;
              const imgW = parseInt(img.getAttribute("width") || "0", 10);
              if (imgW > 0 && imgW <= 250) { logoHeader = td; break; }
            }
          }
          if (logoHeader) {
            const logoTr = logoHeader.closest("tr");
            if (logoTr) {
              const logoInnerHtml = logoHeader.innerHTML;
              const origClassName = logoHeader.getAttribute("class") || "pb-20";
              const origAlign = logoHeader.getAttribute("align");
              const origTextAlign = (logoHeader as HTMLElement).style?.textAlign || "";

              // Read the inner table width where the logo originally lived (e.g. 560px).
              // A centered table of this width above the card sits at the exact same
              // horizontal position as the same-width table centered inside the card.
              const origInnerTable = logoTr.closest("table");
              const origInnerWidth = origInnerTable?.getAttribute("width") || "560";

              const contentWrapTd = logoTr.closest("table")?.parentElement;

              logoTr.remove();

              if (contentWrapTd instanceof HTMLElement && contentWrapTd.tagName === "TD") {
                contentWrapTd.style.paddingTop = "20px";
              }

              // Use the SAME width as the original inner table so horizontal
              // alignment is preserved exactly. No align attr on the table —
              // margin: 0 auto handles page centering without cascading to cells.
              const blendedTable = doc.createElement("table");
              blendedTable.setAttribute("data-blended-logo", "1");
              blendedTable.setAttribute("width", origInnerWidth);
              blendedTable.setAttribute("cellpadding", "0");
              blendedTable.setAttribute("cellspacing", "0");
              blendedTable.style.cssText =
                `max-width: ${origInnerWidth}px; width: 100% !important; margin: 0 auto; border: none !important; border-radius: 0 !important; background: transparent !important;`;

              const tbody = doc.createElement("tbody");
              const tr = doc.createElement("tr");
              const td = doc.createElement("td");
              td.id = "email-header-image";
              td.className = origClassName;
              td.style.cssText = `padding: 0 0 8px;${origTextAlign ? ` text-align: ${origTextAlign};` : ""}`;
              if (origAlign) td.setAttribute("align", origAlign);
              td.innerHTML = logoInnerHtml;

              tr.appendChild(td);
              tbody.appendChild(tr);
              blendedTable.appendChild(tbody);

              wrapperTd.insertBefore(blendedTable, blendContentTable);
              changed = true;
            }
          }
        } else {
          // Blended logo already exists — fix table and TD from old code.
          // Old code forced align="center" on both the table and the TD,
          // and added text-align:center + padding:20px 15px. Strip all of that.
          (blendedLogo as HTMLElement).removeAttribute("align");
          const blendedTd = blendedLogo.querySelector("#email-header-image") as HTMLElement | null;
          if (blendedTd) {
            // Strip the forced alignment the old code injected, unless the
            // user has explicitly chosen an alignment via the sidebar
            // (the logo alignment section above already applied it).
            if (!tweaks.logoAlignment) {
              blendedTd.removeAttribute("align");
              blendedTd.style.removeProperty("text-align");
            }
            blendedTd.style.padding = "0px 0px 8px";
            changed = true;
          }
        }
        // Always apply 35px top padding on the OUTER headline wrapper when blend-in is active.
        // Must use the first visible content row's td (direct child of blendContentTable) — NOT
        // the parent of #email-headline's table, which can be a nested inner td and cause
        // double padding (e.g. outer 20px + inner 35px = 55px).
        let headlineWrapperTd: Element | null = null;
        const rows = blendContentTable.querySelectorAll(":scope > tbody > tr");
        for (const row of rows) {
          const td = row.querySelector(":scope > td");
          if (!td || td.tagName !== "TD") continue;
          const tdStyle = td.getAttribute("style") || "";
          if (tdStyle.includes("display: none") || tdStyle.includes("display:none")) continue;
          headlineWrapperTd = td;
          break;
        }
        if (headlineWrapperTd && headlineWrapperTd instanceof HTMLElement && headlineWrapperTd.tagName === "TD") {
          const style = headlineWrapperTd.getAttribute("style") || "";
          const withoutPadding = style.replace(/\s*padding:\s*[^;]+;?/gi, "").trim();
          headlineWrapperTd.setAttribute("style", (withoutPadding ? withoutPadding + "; " : "") + "padding: 35px 15px 35px");
          changed = true;
        }
      } else if (!blendIn && blendedLogo && blendContentTable) {
        // Logo is currently blended — move it back into the content card
        const blendedTd = blendedLogo.querySelector("#email-header-image");
        if (blendedTd) {
          const align = blendedTd.getAttribute("align") || "center";
          const logoInnerHtml = blendedTd.innerHTML;

          blendedLogo.remove();

          // Find the headline (or first email-block) inside the inner 560px table
          const headline = blendContentTable.querySelector("#email-headline");
          const firstBlock =
            headline?.closest("tr") ||
            blendContentTable.querySelector("tr.email-block");
          const innerTbody = firstBlock?.parentElement;

          if (innerTbody && firstBlock) {
            const logoTr = doc.createElement("tr");
            logoTr.className = "email-block";
            logoTr.style.position = "relative";
            const logoTd = doc.createElement("td");
            logoTd.id = "email-header-image";
            logoTd.className = "pb-20";
            logoTd.setAttribute("align", align);
            logoTd.style.cssText = `padding: 15px 0 30px; text-align: ${align};`;
            logoTd.innerHTML = logoInnerHtml;

            logoTr.appendChild(logoTd);
            innerTbody.insertBefore(logoTr, firstBlock);

            // Remove the extra top padding we added when blending
            const contentWrapTd = innerTbody.closest("table")?.parentElement;
            if (contentWrapTd instanceof HTMLElement && contentWrapTd.tagName === "TD") {
              contentWrapTd.style.paddingTop = "0";
            }
            // Restore the outer headline wrapper td padding to default when logo moves back in
            let restoreWrapperTd: Element | null = null;
            const restoreRows = blendContentTable.querySelectorAll(":scope > tbody > tr");
            for (const row of restoreRows) {
              const td = row.querySelector(":scope > td");
              if (!td || td.tagName !== "TD") continue;
              const tdStyle = td.getAttribute("style") || "";
              if (tdStyle.includes("display: none") || tdStyle.includes("display:none")) continue;
              restoreWrapperTd = td;
              break;
            }
            if (restoreWrapperTd && restoreWrapperTd instanceof HTMLElement && restoreWrapperTd.tagName === "TD") {
              const style = restoreWrapperTd.getAttribute("style") || "";
              const withoutPadding = style.replace(/\s*padding:\s*[^;]+;?/gi, "").trim();
              restoreWrapperTd.setAttribute("style", (withoutPadding ? withoutPadding + "; " : "") + "padding: 20px 15px 35px");
            }

            changed = true;
          }
        }
      }
    }

    // Footer Blend-In — move footer below the content card so it sits in the outer background area
    // Runs after logo blend-in so all tweaks (including footer type) are applied first.
    {
      const blendIn = tweaks.footerBlendBackground === true;
      const wrapper = doc.querySelector("#emailWrapper");
      const wrapperTd = wrapper?.querySelector(":scope > tbody > tr > td");
      const blendedFooter = doc.querySelector('table[data-blended-footer="1"]');

      // Find the content table (skip blended logo and blended footer tables)
      const getContentTable = (): Element | null => {
        if (!wrapperTd) return null;
        for (const t of wrapperTd.querySelectorAll(":scope > table")) {
          if (t.getAttribute("data-blended-logo") === "1") continue;
          if (t.getAttribute("data-blended-footer") === "1") continue;
          return t;
        }
        return null;
      };
      const footerContentTable = getContentTable();

      if (blendIn && wrapperTd && footerContentTable) {
        if (!blendedFooter) {
          // Footer is inside the content card — extract it and place below
          let footerRow: Element | null = doc.querySelector('[id="email-footer"]')?.closest("tr");
          if (!footerRow) {
            // Fallback: last row in content table containing "unsubscribe"
            const rows = footerContentTable.querySelectorAll(":scope > tbody > tr");
            for (let i = rows.length - 1; i >= 0; i--) {
              const row = rows[i] as HTMLElement;
              if (row.getAttribute("data-digistorms-badge") === "1") continue;
              if (row.textContent?.toLowerCase().includes("unsubscribe")) {
                footerRow = row;
                break;
              }
            }
          }
          if (footerRow && footerContentTable.contains(footerRow)) {
            const contentWidth = footerContentTable.getAttribute("width") || "640";
            const footerInnerTable = footerRow.querySelector("table");
            const footerWidth = footerInnerTable?.getAttribute("width") || contentWidth;

            // Also extract DigiStorms badge row so it appears below the footer when blended.
            // Search doc-wide — badge can be in content table or nested tables.
            const badgeRow = doc.querySelector('tr[data-digistorms-badge="1"]');
            const badgeInContentArea =
              badgeRow &&
              wrapperTd?.contains(badgeRow) &&
              !blendedFooter?.contains(badgeRow);

            footerRow.remove();
            if (badgeRow && badgeInContentArea) badgeRow.remove();

            const blendedFooterTable = doc.createElement("table");
            blendedFooterTable.setAttribute("data-blended-footer", "1");
            blendedFooterTable.setAttribute("width", footerWidth);
            blendedFooterTable.setAttribute("cellpadding", "0");
            blendedFooterTable.setAttribute("cellspacing", "0");
            blendedFooterTable.style.cssText =
              `max-width: ${footerWidth}px; width: 100% !important; margin: 15px auto 0; border: none !important; border-radius: 0 !important; background: transparent !important;`;

            const tbody = doc.createElement("tbody");
            tbody.appendChild(footerRow);
            if (badgeRow && badgeInContentArea) tbody.appendChild(badgeRow);
            blendedFooterTable.appendChild(tbody);

            footerContentTable.insertAdjacentElement("afterend", blendedFooterTable);
            changed = true;
          }
        }
      } else if (!blendIn && blendedFooter && footerContentTable) {
        // Footer is currently blended — move footer and badge back into the content card
        const contentTbody = footerContentTable.querySelector(":scope > tbody");
        if (contentTbody) {
          // Restore order: footer first, badge second (badge always below footer)
          const footerRow = blendedFooter.querySelector(
            'tr:not([data-digistorms-badge="1"])'
          );
          const badgeRow = blendedFooter.querySelector(
            'tr[data-digistorms-badge="1"]'
          );
          if (footerRow) contentTbody.appendChild(footerRow);
          if (badgeRow) contentTbody.appendChild(badgeRow);
          blendedFooter.remove();
          changed = true;
        }
      }
    }

    // Badge placement fix — ensure "Powered by DigiStorms" is always below the footer, never in the logo area.
    // The badge can end up in the blended logo table when digiStormsBadge uses Strategy 3 (first table in wrapper).
    {
      const blendedLogo = doc.querySelector('table[data-blended-logo="1"]');
      const blendedFooter = doc.querySelector('table[data-blended-footer="1"]');
      const wrapperTd = doc.querySelector("#emailWrapper")?.querySelector(":scope > tbody > tr > td");
      const badgeRow = doc.querySelector('tr[data-digistorms-badge="1"]');

      if (badgeRow && wrapperTd?.contains(badgeRow)) {
        const badgeInLogoTable = blendedLogo?.contains(badgeRow);

        if (badgeInLogoTable && blendedFooter) {
          // Move badge from logo table to footer table (below footer content)
          badgeRow.remove();
          const footerTbody = blendedFooter.querySelector(":scope > tbody");
          if (footerTbody) {
            footerTbody.appendChild(badgeRow);
            changed = true;
          }
        } else if (badgeInLogoTable && !blendedFooter) {
          // No blended footer — create a badge-only table after the content table
          const getContentTable = (): Element | null => {
            if (!wrapperTd) return null;
            for (const t of wrapperTd.querySelectorAll(":scope > table")) {
              if (t.getAttribute("data-blended-logo") === "1") continue;
              if (t.getAttribute("data-blended-footer") === "1") continue;
              return t;
            }
            return null;
          };
          const contentTable = getContentTable();
          if (contentTable) {
            badgeRow.remove();
            const badgeTable = doc.createElement("table");
            badgeTable.setAttribute("width", "560");
            badgeTable.setAttribute("cellpadding", "0");
            badgeTable.setAttribute("cellspacing", "0");
            badgeTable.style.cssText =
              "max-width: 560px; width: 100% !important; margin: 15px auto 0; border: none !important; background: transparent !important;";
            const tbody = doc.createElement("tbody");
            tbody.appendChild(badgeRow);
            badgeTable.appendChild(tbody);
            contentTable.insertAdjacentElement("afterend", badgeTable);
            changed = true;
          }
        }
      }
    }

    if (changed) {
      // Reconstruct HTML with doctype so saved content is valid and consistent in DB
      const doctypeMatch = htmlContent.match(/<!doctype[^>]*>/i);
      const doctype = doctypeMatch ? doctypeMatch[0] : "<!DOCTYPE html>";
      const rebuilt = doc.documentElement.outerHTML;
      return `${doctype}\n${rebuilt}`;
    }

    return htmlContent;
  } catch (e) {
    console.error("Error applying template tweaks:", e);
    return htmlContent;
  }
}

/**
 * Get default template tweaks
 */
export function getDefaultTweaks(): TemplateTweaks {
  return {
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
}

/**
 * Parse tweaks from URL search params
 */
export function parseTweaksFromUrl(searchParams: URLSearchParams): Partial<TemplateTweaks> {
  const tweaks: Partial<TemplateTweaks> = {};

  const ctaColor = searchParams.get("ctaColor");
  if (ctaColor) tweaks.ctaButtonColor = ctaColor;

  const socialStyle = searchParams.get("socialStyle");
  if (socialStyle) tweaks.socialIconsFamily = socialStyle;

  const logoAlign = searchParams.get("logoAlign");
  if (logoAlign) tweaks.logoAlignment = logoAlign;

  const ctaAlign = searchParams.get("ctaAlign");
  if (ctaAlign) tweaks.ctaButtonAlignment = ctaAlign;

  const ctaRadius = searchParams.get("ctaRadius");
  if (ctaRadius) tweaks.ctaButtonBorderRadius = ctaRadius;

  const bgStyle = searchParams.get("bgStyle");
  if (bgStyle) tweaks.backgroundStyle = bgStyle as TemplateTweaks["backgroundStyle"];

  const footerType = searchParams.get("footerType");
  if (footerType && !["branded", "generated", "default"].includes(footerType)) {
    tweaks.footerType = footerType;
  }

  const enabledIcons = searchParams.get("enabledIcons");
  if (enabledIcons) {
    const parsed = enabledIcons.split(",").filter(Boolean);
    if (parsed.length > 0) tweaks.enabledSocialIcons = parsed;
  }

  const logoBlend = searchParams.get("logoBlend");
  if (logoBlend === "1") tweaks.logoBlendBackground = true;

  const footerBlend = searchParams.get("footerBlend");
  if (footerBlend === "1") tweaks.footerBlendBackground = true;

  return tweaks;
}

/**
 * Serialize tweaks to URL search params
 */
export function serializeTweaksToUrl(tweaks: TemplateTweaks): URLSearchParams {
  const params = new URLSearchParams();

  if (tweaks.ctaButtonColor) {
    params.set("ctaColor", tweaks.ctaButtonColor);
  }
  if (tweaks.socialIconsFamily && !["branded", "generated", "default"].includes(tweaks.socialIconsFamily)) {
    params.set("socialStyle", tweaks.socialIconsFamily);
  }
  if (tweaks.logoAlignment) {
    params.set("logoAlign", tweaks.logoAlignment);
  }
  if (tweaks.ctaButtonAlignment) {
    params.set("ctaAlign", tweaks.ctaButtonAlignment);
  }
  if (tweaks.ctaButtonBorderRadius) {
    params.set("ctaRadius", tweaks.ctaButtonBorderRadius);
  }
  if (tweaks.backgroundStyle && tweaks.backgroundStyle !== "default") {
    params.set("bgStyle", tweaks.backgroundStyle);
  }
  if (tweaks.footerType && !["branded", "generated", "default"].includes(tweaks.footerType)) {
    params.set("footerType", tweaks.footerType);
  }
  if (tweaks.enabledSocialIcons && tweaks.enabledSocialIcons.length > 0 && tweaks.enabledSocialIcons.length < ALL_SOCIAL_PLATFORMS.length) {
    params.set("enabledIcons", tweaks.enabledSocialIcons.join(","));
  }
  if (tweaks.logoBlendBackground) {
    params.set("logoBlend", "1");
  }
  if (tweaks.footerBlendBackground) {
    params.set("footerBlend", "1");
  }

  return params;
}
