import React, { useMemo } from "react";
import { BriefData, EmailTemplate } from "@/types/emailGenerator";
import { renderEmailForContext } from "@/utils/emailRenderer";
import { TemplateTweaks } from "./TemplateTweaksSidebar";
import { getFooterHTML } from "@/utils/templateTweaks";

interface EmailGalleryProps {
  briefData: BriefData;
  onSelect: (email: EmailTemplate) => void;
  templateTweaks?: TemplateTweaks;
}

const generateRealisticEmails = (briefData: BriefData): EmailTemplate[] => {
  const emailTemplates = {
    welcome: [
      {
        style: "professional" as const,
        subject: `Welcome to ${briefData.companyName}`,
        brandTone: "Clean and trustworthy",
        content: `**Welcome to ${briefData.companyName}**

Thanks for joining us! To get started, ${briefData.primaryAction?.toLowerCase()} and start ${briefData.keyOutcome || "achieving your goals"
          }.

• ${briefData.keyOutcome || "Track performance instantly"}
• Get insights in real-time
• Scale with confidence

We're here if you need us — just reply to this email.

Best regards,
The ${briefData.companyName} Team

[${briefData.primaryAction || "Get Started"}]`,
      },
      {
        style: "friendly" as const,
        subject: `🎉 You're in! Here's what happens next`,
        brandTone: "Warm and approachable",
        content: `Hey there! 👋

Welcome to the ${briefData.companyName
          } family! We're genuinely excited you're here.

You know that feeling when you find exactly what you've been looking for? That's what we want ${briefData.productName
          } to be for you.

**Let's dive in:** ${briefData.primaryAction}

${briefData.keyOutcome
            ? `Why this matters: ${briefData.keyOutcome} — and who doesn't want that? 😊`
            : ""
          }

Quick question: What brought you to ${briefData.productName
          }? Hit reply and let us know — we love hearing from our community.

${briefData.supportOffered
            ? `Stuck on anything? ${briefData.supportOffered}`
            : "Need anything? Just reply to this email."
          }

Cheers to your success! 🚀
[Your Name] & the ${briefData.companyName} team

P.S. Follow us on Twitter @${(briefData.companyName || "yourcompany")
            .toLowerCase()
            .replace(
              /[^a-z0-9_]/g,
              ""
            )} for daily tips and behind-the-scenes updates.`,
      },
      {
        style: "urgent" as const,
        subject: `⚡ Your ${briefData.productName} account is ready — start now`,
        brandTone: "Direct and action-oriented",
        content: `Your ${briefData.productName} account is live.

Most successful ${briefData.targetAudience
          } see results within their first session.

**Action required:** ${briefData.primaryAction}

${briefData.keyOutcome ? `Expected outcome: ${briefData.keyOutcome}` : ""}

The difference between success and stagnation? Taking action immediately.

Start now: [Get Started Button]

${briefData.companyName}

P.S. This onboarding sequence is designed to get you results fast. Don't skip the next few emails.`,
      },
    ],
    "milestone-celebration": [
      {
        style: "professional" as const,
        subject: `Milestone achieved: ${briefData.milestone || "Congratulations"
          }`,
        brandTone: "Professional celebration",
        content: `Congratulations!

You've just ${briefData.milestone} — this puts you ahead of 80% of ${briefData.targetAudience
          } who use ${briefData.productName}.

**What this means:** ${briefData.keyOutcome || "You're building real momentum"}

**Your next opportunity:** ${briefData.primaryAction}

This milestone indicates you're getting genuine value from ${briefData.productName
          }. Users who reach this point typically see even greater results when they take the next step.

${briefData.supportOffered
            ? `Want to accelerate your progress? ${briefData.supportOffered}`
            : "Questions about your next steps? Reply to this email."
          }

Keep up the excellent work,
The ${briefData.companyName} Team

P.S. We'll be sharing advanced strategies with milestone achievers like you over the coming weeks.`,
      },
      {
        style: "friendly" as const,
        subject: `🏆 You're crushing it! (${briefData.milestone})`,
        brandTone: "Enthusiastic and celebratory",
        content: `Hey superstar! 🌟

We just noticed something amazing — you've ${briefData.milestone}!

Seriously, take a moment to celebrate this. ${briefData.keyOutcome
            ? `${briefData.keyOutcome} — that's huge!`
            : "This is a big deal!"
          }

You're in the top 20% of ${briefData.productName
          } users. Want to know what the top 5% do differently?

**They take this next step:** ${briefData.primaryAction}

${briefData.supportOffered
            ? `Pro tip: ${briefData.supportOffered}`
            : "Want a high-five? Hit reply — we love celebrating wins with our users! 🎉"
          }

Keep being awesome,
[Your Name] from ${briefData.companyName}

P.S. Screenshot this email and share your win! Tag us @${(
            briefData.companyName || "yourcompany"
          )
            .toLowerCase()
            .replace(
              /[^a-z0-9_]/g,
              ""
            )} — we love amplifying our users' success stories.`,
      },
      {
        style: "urgent" as const,
        subject: `🔥 Momentum alert: ${briefData.milestone}`,
        brandTone: "High-energy motivational",
        content: `You're on fire! 🔥

Achievement unlocked: ${briefData.milestone}

${briefData.keyOutcome
            ? `Impact: ${briefData.keyOutcome}`
            : "Results: Ahead of 85% of users"
          }

**Strike while you're hot:** ${briefData.primaryAction}

Peak performers don't pause. They compound their wins.

You have momentum. Use it.

[Take Action Now]

${briefData.companyName}

P.S. Only 15% of users reach this milestone. Only 3% take the next step immediately. Which group are you in?`,
      },
    ],
    "notify-trial-ending": [
      {
        style: "professional" as const,
        subject: `Your ${briefData.productName} trial expires in ${briefData.trialDuration || "3 days"
          }`,
        brandTone: "Professional and helpful",
        content: `Hi there,

Your ${briefData.trialDuration || "14-day"} trial of ${briefData.productName
          } expires soon.

Based on your usage, you've experienced firsthand how ${briefData.productName
          } ${briefData.keyOutcome || "can streamline your workflow"}.

**To continue your progress:** ${briefData.primaryAction}

What you keep:
• All your current data and settings
• Continued access to features you're already using
• ${briefData.supportOffered || "Priority support"}

${briefData.supportOffered
            ? `Have questions about plans? ${briefData.supportOffered}`
            : "Questions about pricing? Reply to this email for personalized help."
          }

We're here to ensure you make the right decision for your needs.

Best regards,
The ${briefData.companyName} Team

P.S. Your trial data will be preserved for 30 days, giving you time to upgrade when you're ready.`,
      },
      {
        style: "friendly" as const,
        subject: `Don't lose your ${briefData.productName} progress! 🚨`,
        brandTone: "Friendly and supportive",
        content: `Hey there! 👋

Quick heads up — your ${briefData.productName
          } trial ends soon, and we'd hate for you to lose all the great work you've done!

You've already ${briefData.keyOutcome || "made great progress"
          }, and we want to help you keep that momentum going.

**Ready to continue?** ${briefData.primaryAction}

Here's what happens when you upgrade:
✅ Keep everything you've built
✅ Unlock advanced features
✅ ${briefData.supportOffered || "Get priority support"}

${briefData.supportOffered
            ? `Not sure which plan fits? ${briefData.supportOffered}`
            : "Questions? Just hit reply — we're here to help! 😊"
          }

We're rooting for your success,
[Your Name] & the ${briefData.companyName} team

P.S. Over 10,000 ${briefData.targetAudience} trust ${briefData.productName
          } to help them succeed. Join them?`,
      },
      {
        style: "urgent" as const,
        subject: `⏰ FINAL NOTICE: ${briefData.productName} trial expires soon`,
        brandTone: "Urgent and direct",
        content: `Your ${briefData.productName
          } trial expires in less than 24 hours.

Don't lose access to:
• Your current progress
• ${briefData.keyOutcome || "Advanced features"}  
• All data you've created

**Last chance:** ${briefData.primaryAction}

${briefData.trialDuration || "14 days"
          } ago, you signed up because you needed a solution.

You found it. Don't lose it now.

[Upgrade Immediately]

${briefData.supportOffered
            ? `Emergency questions? ${briefData.supportOffered}`
            : "Last-minute questions? Call (555) 123-4567"
          }

Act now,
${briefData.companyName}

P.S. After expiration, account recovery takes 5-7 business days. Upgrade now to avoid interruption.`,
      },
    ],
  };

  const templates = emailTemplates[briefData.useCase];

  return templates?.map((template, index) => ({
    id: `${briefData.useCase}-${index}`,
    subject: template.subject,
    preview:
      template.content
        .split("\n")
        .find((line) => line.trim().length > 10)
        ?.substring(0, 120) + "..." ||
      template.content.substring(0, 120) + "...",
    content: template.content,
    style: template.style,
    brandTone: template.brandTone,
  }));
};

// Function to apply template tweaks to email HTML content (uses shared getFooterHTML from templateTweaks utility)
const applyTemplateTweaks = (
  htmlContent: string,
  tweaks: TemplateTweaks
): string => {
  let modifiedContent = htmlContent;

  // DOMParser is more reliable than regex for complex HTML structures
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(modifiedContent, "text/html");
    let changed = false;

    // Apply Footer Type (Must be done early to ensure structure exists for other tweaks)
    // Skip if footerType is "generated", "branded", "default" (all mean default) or undefined
    if (
      tweaks.footerType &&
      tweaks.footerType !== "default" &&
      tweaks.footerType !== "branded" &&
      tweaks.footerType !== "generated"
    ) {
      // Find existing footer
      // 1. Try ID
      let footer = doc.querySelector('[id="email-footer"]');
      // 2. Try finding last main row if ID missing
      if (!footer) {
        // Most templates have a structure where footer is the last row in the main container
        const mainTable = doc.querySelector(
          "#emailWrapper > tbody > tr > td > table"
        );
        if (mainTable) {
          const rows = mainTable.querySelectorAll(":scope > tbody > tr");
          if (rows.length > 0) {
            // Find the last row that looks like a footer (contains "unsubscribe").
            // We scan backwards so appending extra blocks (like badges) doesn't break detection.
            for (let i = rows.length - 1; i >= 0; i--) {
              const row = rows[i] as HTMLElement;
              if (row.getAttribute("data-digistorms-badge") === "1") continue;
              if (row.textContent?.toLowerCase().includes("unsubscribe")) {
                // The footer is usually inside a TD of this TR, or the TR itself is the container wrapper
                // Our templates return a TR. So we should replace the TR.
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
          // Walk up to find the main row container
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

        let copyrightText =
          "深圳市腾讯计算机系统有限公司 © 2025.<br>Address, City";
        const copyrightP =
          doc.querySelector("#email-copy p") ||
          Array.from(doc.querySelectorAll("p")).find((p) =>
            p.textContent?.includes("©")
          );
        if (copyrightP) {
          copyrightText = copyrightP.innerHTML;
        }

        // Logo Src (for Split footer)
        // Try to find the header logo to reuse in footer if needed
        // 1. Try by ID first (most reliable based on template structure)
        let logoImg = doc.querySelector("#email-header-image img");

        // 2. If not found, try by alt text variants
        if (!logoImg) {
          logoImg = doc.querySelector(
            'img[alt*="logo" i], img[alt*="header" i], img[alt*="digistorms" i]'
          );
        }

        const logoSrc = logoImg
          ? logoImg.getAttribute("src") ||
          "https://api.digistorms.net/assets/user_uploads/a04e6929-b128-48ff-aba6-200dcd066c71.jpg"
          : "https://api.digistorms.net/assets/user_uploads/a04e6929-b128-48ff-aba6-200dcd066c71.jpg";

        // Determine social suffix based on tweaks (to keep it consistent immediately)
        // Only use socialIconsFamily if it's explicitly set (not default/branded)
        const socialStyleMap: Record<string, string> = {
          black_filled: "1",
          black_line: "2",
          colored: "3",
          grey: "4",
        };
        // Use socialIconsFamily if set, otherwise default to "3" (colored/branded)
        const socialSuffix =
          tweaks.socialIconsFamily && socialStyleMap[tweaks.socialIconsFamily]
            ? socialStyleMap[tweaks.socialIconsFamily]
            : "3";

        // Generate New Footer HTML (always includes all 5 icons; display filter hides disabled ones later)
        const newFooterHTML = getFooterHTML(tweaks.footerType, {
          unsubscribeHref,
          copyrightText,
          logoSrc,
          socialSuffix,
        });

        // Replace
        // The newFooterHTML is a <tr>...</tr>. We need to replace the existing footer TR.
        // If 'footer' is the TD inside the TR (id="email-footer"), we need to target its parent TR.
        let targetTr = footer;
        if (footer.tagName === "TD") {
          targetTr = footer.parentElement as HTMLElement;
        }

        // Create a temp container to parse the new HTML string
        const tempContainer = doc.createElement("tbody");
        tempContainer.innerHTML = newFooterHTML;
        const newTr = tempContainer.firstElementChild;

        if (targetTr && targetTr.parentNode && newTr) {
          targetTr.parentNode.replaceChild(newTr, targetTr);
          changed = true;
          console.log(
            `🎨 applyTemplateTweaks: Replaced Footer with type: ${tweaks.footerType}`
          );
        }
      }
    }

    // Apply Logo Alignment
    if (tweaks.logoAlignment) {
      const align = tweaks.logoAlignment;
      // Target header images/logos by common ID patterns or alt text
      const logoContainers = doc.querySelectorAll(
        '[id*="email-header"], [id*="email-logo"], [id="header"], [id="logo"]'
      );

      const applyLogoAlignment = (container: Element) => {
        container.setAttribute("align", align);
        if (container instanceof HTMLElement) {
          // Use !important to override utility classes like .ta-c
          container.style.setProperty("text-align", align, "important");
          changed = true;
        }
      };

      logoContainers.forEach(applyLogoAlignment);

      // Fallback: If no ID-based containers found, look for images with alt text containing "logo" or "header"
      // or specific known alt texts like "digistorms"
      if (logoContainers.length === 0) {
        const potentialLogos = doc.querySelectorAll(
          'img[alt*="logo" i], img[alt*="header" i], img[alt*="digistorms" i]'
        );
        potentialLogos.forEach((img) => {
          // Find the closest TD container
          const container = img.closest("td");
          if (container) {
            applyLogoAlignment(container);
          }
        });
      }

      if (changed) {
        console.log(`🎨 applyTemplateTweaks: Applied Logo alignment: ${align}`);
      }
    }

    // Apply CTA Button Alignment
    if (tweaks.ctaButtonAlignment) {
      const align = tweaks.ctaButtonAlignment;
      const ctaContainers = doc.querySelectorAll('[id="email-cta"]');

      ctaContainers.forEach((container) => {
        // 1. Align the container TD
        container.setAttribute("align", align);
        if (container instanceof HTMLElement) {
          container.style.textAlign = align;
        }

        // 2. Align the inner table (button wrapper)
        const innerTable = container.querySelector("table");
        if (innerTable && innerTable instanceof HTMLElement) {
          innerTable.setAttribute("align", align);

          // Reset margins based on alignment
          if (align === "center") {
            innerTable.style.marginLeft = "auto";
            innerTable.style.marginRight = "auto";
          } else if (align === "left") {
            innerTable.style.marginLeft = "0";
            innerTable.style.marginRight = "auto";
          } else if (align === "right") {
            innerTable.style.marginLeft = "auto";
            innerTable.style.marginRight = "0";
          }

          // 3. Ensure the table cell inside also follows suit
          const innerTd = innerTable.querySelector("td");
          if (innerTd) {
            innerTd.setAttribute("align", align);
            // Also align the text content inside the button, but preserve other styles
            if (innerTd instanceof HTMLElement) {
              // Ensure text inside button remains centered
              innerTd.style.textAlign = "center";
              // DO NOT modify border-radius here - preserve original from backend template
              // Border-radius should only be changed via ctaButtonBorderRadius or ctaButtonLook tweaks
            }
          }
        }
        changed = true;
      });

      if (changed) {
        console.log(`🎨 applyTemplateTweaks: Applied CTA alignment: ${align}`);
      }
    }

    // Apply CTA Button Color (using DOM method)
    if (tweaks.ctaButtonColor) {
      const color = tweaks.ctaButtonColor;
      if (/^#[0-9A-Fa-f]{6}$/i.test(color)) {
        const ctaContainers = doc.querySelectorAll('[id="email-cta"]');

        ctaContainers.forEach((container) => {
          // Find the nested TD with bgcolor (the button itself)
          // It might be deeper inside a table
          const buttonTd = container.querySelector("td[bgcolor]");
          if (buttonTd) {
            buttonTd.setAttribute("bgcolor", color);
            // Also update style if present
            if (buttonTd instanceof HTMLElement) {
              buttonTd.style.backgroundColor = color;
            }
            changed = true;
          }
        });

        if (changed) {
          console.log(`🎨 applyTemplateTweaks: Applied CTA color: ${color}`);
        }
      }
    }

    // Apply CTA Button Look (Border Radius / Styles)
    if (tweaks.ctaButtonLook) {
      const buttonStyleMap: Record<string, string> = {
        rounded: "border-radius: 8px;",
        sharp: "border-radius: 0px;",
        pill: "border-radius: 50px;", // 50px is safer for email clients than 9999px
        outlined:
          "border: 2px solid currentColor !important; background: transparent !important;",
        gradient:
          "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;",
      };

      const style = buttonStyleMap[tweaks.ctaButtonLook];
      if (style) {
        // Find actual button links (often marked with data-gemini-button="1" or just inside email-cta)
        const buttons = doc.querySelectorAll(
          'a[data-gemini-button="1"], [id="email-cta"] a'
        );

        buttons.forEach((btn) => {
          if (btn instanceof HTMLElement) {
            // Always ensure text-align: center is present on the button text itself
            // Using !important to override any inherited alignment
            const existingStyle = btn.getAttribute("style") || "";
            // Clean up any existing text-align to avoid duplicates
            const cleanStyle = existingStyle.replace(
              /text-align:\s*[^;]+;?/gi,
              ""
            );

            // Append new style with centered text
            btn.setAttribute(
              "style",
              cleanStyle + "; " + style + "; text-align: center;"
            );

            // Also apply border-radius to the parent TD if it's a button container
            // (Common pattern: TD has background color and border radius)
            if (
              tweaks.ctaButtonLook === "rounded" ||
              tweaks.ctaButtonLook === "sharp" ||
              tweaks.ctaButtonLook === "pill"
            ) {
              const parentTd = btn.closest("td[bgcolor]");
              if (parentTd && parentTd instanceof HTMLElement) {
                let radius = "0px";
                if (tweaks.ctaButtonLook === "rounded") radius = "8px";
                if (tweaks.ctaButtonLook === "pill") radius = "50px";
                parentTd.style.borderRadius = radius;
              }
            }
            changed = true;
          }
        });
      }
    } else {
      // Default behavior: ensure buttons are centered if no specific look is applied
      // This handles the case where only alignment is changed but not the look
      const buttons = doc.querySelectorAll(
        'a[data-gemini-button="1"], [id="email-cta"] a'
      );
      buttons.forEach((btn) => {
        if (btn instanceof HTMLElement) {
          const existingStyle = btn.getAttribute("style") || "";

          // Explicitly preserve 50px border-radius if detected or if it looks like a button
          // The user requested 50px explicitly to be preserved/enforced when other things are touched
          let newStyle = existingStyle;
          if (!newStyle.includes("text-align")) {
            newStyle += "; text-align: center;";
          }

          // If the button or its parent TD has a border radius, we want to keep it.
          // If the user is complaining about 50px being lost, we can enforce it on the link if it's missing
          // But wait, the 50px is usually on the TD for Outlook compatibility, or on the A for others.

          // Let's ensure the parent TD has 50px if it looks like a pill button (default for many templates)
          // OR just trust the existing styles unless we are forced to fix it.

          // User specific request: "border radius shoul be 50px as it was. apply it or at least do not touch"
          // Since we might have touched it in previous iterations or via other tools, let's make sure
          // we are NOT overriding it with default 8px or 0px.

          // Current code doesn't touch border-radius if !tweaks.ctaButtonLook.
          // But if the template has 8px and user wants 50px, they should select 'pill'.
          // If the template starts with 50px, and we don't touch it, it should stay 50px.

          btn.setAttribute("style", newStyle);
          changed = true;
        }
      });
    }

    // Apply CTA Button Border Radius (Explicit setting overrides look)
    if (tweaks.ctaButtonBorderRadius) {
      const radius = tweaks.ctaButtonBorderRadius;
      const buttons = doc.querySelectorAll(
        'a[data-gemini-button="1"], [id="email-cta"] a'
      );

      buttons.forEach((btn) => {
        if (btn instanceof HTMLElement) {
          const parentTd = btn.closest("td[bgcolor]");

          // Apply to parent TD if it exists (common for buttons)
          if (parentTd && parentTd instanceof HTMLElement) {
            parentTd.style.setProperty("border-radius", radius, "important");
            // Also set style attribute to ensure it sticks
            // Check if style attr exists to append or create
            const pStyle = parentTd.getAttribute("style") || "";
            // Replace existing or append
            let newPStyle = pStyle;
            if (newPStyle.match(/border-radius:\s*[^;]+;?/i)) {
              newPStyle = newPStyle.replace(
                /border-radius:\s*[^;]+;?/gi,
                `border-radius: ${radius} !important;`
              );
            } else {
              newPStyle += `; border-radius: ${radius} !important;`;
            }
            parentTd.setAttribute("style", newPStyle);
          }

          // Apply to the link itself as well
          const currentStyle = btn.getAttribute("style") || "";
          let newStyle = currentStyle;
          if (newStyle.match(/border-radius:\s*[^;]+;?/i)) {
            newStyle = newStyle.replace(
              /border-radius:\s*[^;]+;?/gi,
              `border-radius: ${radius} !important;`
            );
          } else {
            newStyle += `; border-radius: ${radius} !important;`;
          }
          btn.setAttribute("style", newStyle);
          changed = true;
        }
      });

      if (changed) {
        console.log(
          `🎨 applyTemplateTweaks: Applied CTA border radius: ${radius}`
        );
      }
    }

    // Apply Language
    if (tweaks.language && tweaks.language !== "en") {
      const html = doc.querySelector("html");
      if (html) {
        html.setAttribute("lang", tweaks.language);
        changed = true;
      }
    }

    // Apply Social Icons Style (DOM method)
    // Note: If Footer Type was applied, we already set the correct images.
    // But we should still run this to catch any other social icons or if the user changes style AND footer.
    if (
      tweaks.socialIconsFamily &&
      tweaks.socialIconsFamily !== "branded" &&
      tweaks.socialIconsFamily !== "default"
    ) {
      const styleMap: Record<string, string> = {
        black_filled: "1",
        black_line: "2",
        colored: "3",
        grey: "4",
      };
      const suffix = styleMap[tweaks.socialIconsFamily];

      if (suffix) {
        const images = doc.querySelectorAll('img[src*="/assets/socials/"]');
        images.forEach((img) => {
          const src = img.getAttribute("src");
          if (src && src.match(/_[1-4]\.png$/)) {
            const newSrc = src.replace(/_[1-4]\.png$/, `_${suffix}.png`);
            img.setAttribute("src", newSrc);
            changed = true;
          }
        });
      }
    }

    // Apply Enabled Social Icons filter — show/hide platforms via display property
    // Always runs to ensure previously-hidden icons get un-hidden when selection resets
    {
      const enabled = tweaks.enabledSocialIcons
        ? new Set(tweaks.enabledSocialIcons)
        : null; // null = show all
      const socialImgs = doc.querySelectorAll(
        'img[src*="socials/"], img[alt*="linkedin" i], img[alt*="twitter" i], img[alt*="instagram" i], img[alt*="facebook" i], img[alt*="youtube" i], img[alt*="x" i]'
      );
      socialImgs.forEach((img) => {
        const src = img.getAttribute("src") || "";
        const alt = (img.getAttribute("alt") || "").toLowerCase();
        let platform = "";
        if (src.includes("linkedin") || alt.includes("linkedin")) platform = "linkedin";
        else if (src.includes("twitter") || alt.includes("twitter") || src.includes("x_") || alt === "x") platform = "twitter";
        else if (src.includes("instagram") || alt.includes("instagram")) platform = "instagram";
        else if (src.includes("facebook") || alt.includes("facebook")) platform = "facebook";
        else if (src.includes("youtube") || alt.includes("youtube")) platform = "youtube";

        if (platform) {
          const iconTd = img.closest("td.active-i") || img.closest("td");
          if (iconTd) {
            const shouldHide = enabled ? !enabled.has(platform) : false;
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
    }

    // Apply Background Style
    if (tweaks.backgroundStyle && tweaks.backgroundStyle !== "default") {
      const bgColor = "#f0f0f0";

      if (
        tweaks.backgroundStyle === "gray" ||
        tweaks.backgroundStyle === "gray_border" ||
        tweaks.backgroundStyle === "gray_border_no_radius"
      ) {
        // 1. Ensure Body & Wrapper are Gray
        const body = doc.querySelector("body");
        if (body) {
          body.style.backgroundColor = bgColor;
          body.style.margin = "0";
          body.style.padding = "0";
        }

        const wrapper = doc.querySelector("#emailWrapper");
        if (wrapper instanceof HTMLElement) {
          wrapper.style.backgroundColor = bgColor;
          // Ensure the wrapper has padding to spacing the inner content from edges
          // Try to find the direct TD
          const wrapperTd = wrapper.querySelector("td");
          if (wrapperTd) {
            wrapperTd.style.padding = "30px 0";
          }
        }

        // 2. Identify and Style the Inner Content Container
        const mainContainer = doc.querySelector(
          "#emailWrapper > tbody > tr > td > table"
        );

        if (mainContainer instanceof HTMLElement) {
          mainContainer.style.backgroundColor = "#ffffff";
          // We already added padding to wrapper, but let's keep this if it was specific
          // const parentTd = mainContainer.parentElement;
          // if (parentTd) {
          //   parentTd.style.padding = "30px 0";
          // }

          // Apply Border if requested
          if (
            tweaks.backgroundStyle === "gray_border" ||
            tweaks.backgroundStyle === "gray_border_no_radius"
          ) {
            // Apply border directly to the main container table
            // Using a light gray border and rounding
            mainContainer.style.border = "1px solid #e5e7eb"; // gray-200
            mainContainer.style.borderRadius =
              tweaks.backgroundStyle === "gray_border" ? "12px" : "0px";
            // Ensure border-collapse is separate to allow border-radius
            mainContainer.style.borderCollapse = "separate";
            // Add overflow hidden to clip content to border radius
            mainContainer.style.overflow = "hidden";
          }
        } else {
          // Fallback
          const potentialMain = doc.querySelector(
            "table[width='600'], table[width='640'], table[width='566'], table[width='540'], table.main"
          );
          if (potentialMain instanceof HTMLElement) {
            potentialMain.style.backgroundColor = "#ffffff";

            if (
              tweaks.backgroundStyle === "gray_border" ||
              tweaks.backgroundStyle === "gray_border_no_radius"
            ) {
              potentialMain.style.border = "1px solid #e5e7eb";
              potentialMain.style.borderRadius =
                tweaks.backgroundStyle === "gray_border" ? "12px" : "0px";
              potentialMain.style.borderCollapse = "separate";
              potentialMain.style.overflow = "hidden";
            }
          }
        }

        changed = true;
      }
    }

    // Logo Blend-In — move logo above the content card so it sits in the outer background area
    {
      const blendIn = tweaks.logoBlendBackground === true;
      const wrapper = doc.querySelector("#emailWrapper");
      const gWrapperTd = wrapper?.querySelector(":scope > tbody > tr > td");
      const blendedLogo = doc.querySelector('table[data-blended-logo="1"]');

      let galleryContentTable: Element | null = null;
      if (gWrapperTd) {
        const directTables = gWrapperTd.querySelectorAll(":scope > table");
        for (const t of Array.from(directTables)) {
          if (t.getAttribute("data-blended-logo") === "1") continue;
          galleryContentTable = t;
          break;
        }
      }

      if (blendIn && gWrapperTd && galleryContentTable) {
        if (!blendedLogo) {
          let logoHeader: Element | null = doc.querySelector('[id="email-header-image"]');
          if (!logoHeader) {
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

              const origInnerTable = logoTr.closest("table");
              const origInnerWidth = origInnerTable?.getAttribute("width") || "560";

              const contentWrapTd = logoTr.closest("table")?.parentElement;
              logoTr.remove();

              if (contentWrapTd instanceof HTMLElement && contentWrapTd.tagName === "TD") {
                contentWrapTd.style.paddingTop = "20px";
              }

              const blendedTable = doc.createElement("table");
              blendedTable.setAttribute("data-blended-logo", "1");
              blendedTable.setAttribute("width", origInnerWidth);
              blendedTable.setAttribute("cellpadding", "0");
              blendedTable.setAttribute("cellspacing", "0");
              blendedTable.style.cssText =
                `max-width: ${origInnerWidth}px; width: 100% !important; margin: 0 auto; border: none !important; border-radius: 0 !important; background: transparent !important;`;

              const bTbody = doc.createElement("tbody");
              const bTr = doc.createElement("tr");
              const bTd = doc.createElement("td");
              bTd.id = "email-header-image";
              bTd.className = origClassName;
              bTd.style.cssText = `padding: 0 0 8px;${origTextAlign ? ` text-align: ${origTextAlign};` : ""}`;
              if (origAlign) bTd.setAttribute("align", origAlign);
              bTd.innerHTML = logoInnerHtml;

              bTr.appendChild(bTd);
              bTbody.appendChild(bTr);
              blendedTable.appendChild(bTbody);

              gWrapperTd.insertBefore(blendedTable, galleryContentTable);
              changed = true;
            }
          }
        } else {
          // Blended logo already exists — fix old code's forced values
          (blendedLogo as HTMLElement).removeAttribute("align");
          const blendedTd = blendedLogo.querySelector("#email-header-image") as HTMLElement | null;
          if (blendedTd) {
            if (!tweaks.logoAlignment) {
              blendedTd.removeAttribute("align");
              blendedTd.style.removeProperty("text-align");
            }
            blendedTd.style.padding = "0px 0px 8px";
            changed = true;
          }
        }
        // Always apply 35px top padding on the OUTER headline wrapper (first visible content row).
        // Do NOT use #email-headline's table parent — that can be a nested inner td, causing
        // double padding (outer 20px + inner 35px = 55px).
        let headlineWrapperTd: Element | null = null;
        const rows = galleryContentTable.querySelectorAll(":scope > tbody > tr");
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
      } else if (!blendIn && blendedLogo && galleryContentTable) {
        const blendedTd = blendedLogo.querySelector("#email-header-image");
        if (blendedTd) {
          const align = blendedTd.getAttribute("align") || "center";
          const logoInnerHtml = blendedTd.innerHTML;

          blendedLogo.remove();

          const headline = galleryContentTable.querySelector("#email-headline");
          const firstBlock =
            headline?.closest("tr") ||
            galleryContentTable.querySelector("tr.email-block");
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

            const contentWrapTd = innerTbody.closest("table")?.parentElement;
            if (contentWrapTd instanceof HTMLElement && contentWrapTd.tagName === "TD") {
              contentWrapTd.style.paddingTop = "0";
            }
            // Restore outer headline wrapper td padding to default when logo moves back in
            let restoreWrapperTd: Element | null = null;
            const restoreRows = galleryContentTable.querySelectorAll(":scope > tbody > tr");
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
    {
      const blendIn = tweaks.footerBlendBackground === true;
      const wrapper = doc.querySelector("#emailWrapper");
      const gWrapperTd = wrapper?.querySelector(":scope > tbody > tr > td");
      const blendedFooter = doc.querySelector('table[data-blended-footer="1"]');

      const getFooterContentTable = (): Element | null => {
        if (!gWrapperTd) return null;
        for (const t of gWrapperTd.querySelectorAll(":scope > table")) {
          if (t.getAttribute("data-blended-logo") === "1") continue;
          if (t.getAttribute("data-blended-footer") === "1") continue;
          return t;
        }
        return null;
      };
      const galleryFooterContentTable = getFooterContentTable();

      if (blendIn && gWrapperTd && galleryFooterContentTable) {
        if (!blendedFooter) {
          let footerRow: Element | null = doc.querySelector('[id="email-footer"]')?.closest("tr");
          if (!footerRow) {
            const rows = galleryFooterContentTable.querySelectorAll(":scope > tbody > tr");
            for (let i = rows.length - 1; i >= 0; i--) {
              const row = rows[i] as HTMLElement;
              if (row.getAttribute("data-digistorms-badge") === "1") continue;
              if (row.textContent?.toLowerCase().includes("unsubscribe")) {
                footerRow = row;
                break;
              }
            }
          }
          if (footerRow && galleryFooterContentTable.contains(footerRow)) {
            const contentWidth = galleryFooterContentTable.getAttribute("width") || "640";
            const footerInnerTable = footerRow.querySelector("table");
            const footerWidth = footerInnerTable?.getAttribute("width") || contentWidth;

            // Also extract DigiStorms badge row so it appears below the footer when blended
            const badgeRow = doc.querySelector('tr[data-digistorms-badge="1"]');
            const badgeInContentArea =
              badgeRow &&
              gWrapperTd?.contains(badgeRow) &&
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

            galleryFooterContentTable.insertAdjacentElement("afterend", blendedFooterTable);
            changed = true;
          }
        }
      } else if (!blendIn && blendedFooter && galleryFooterContentTable) {
        const contentTbody = galleryFooterContentTable.querySelector(":scope > tbody");
        if (contentTbody) {
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

    // Return serialized HTML if changes were made
    if (changed) {
      // doc.documentElement.outerHTML returns the full HTML including <html>...</html>
      return doc.documentElement.outerHTML;
    }

    return modifiedContent;
  } catch (e) {
    console.error("Error in applyTemplateTweaks DOM operations:", e);
    // Fallback to original content if DOM parsing fails
    return modifiedContent;
  }
};

export const EmailGallery: React.FC<EmailGalleryProps> = ({
  briefData,
  onSelect,
  templateTweaks,
}) => {
  // Memoize base emails to prevent unnecessary recalculations
  const baseEmails = useMemo(() => {
    // Use API response if available, otherwise use mock data
    const apiEmails = briefData.apiResponse?.html_content || [];

    if (apiEmails.length > 0) {
      // Get proper subject and preview based on use case
      const getSubjectForUseCase = (useCase: string) => {
        const subjects = {
          welcome: "Welcome to DigiStorms — let's get you started!",
          "milestone-celebration": "You just hit your first milestone!",
          "notify-trial-ending": "Your DigiStorms trial expires in 3 days",
          "activate-trialists": "Ready to unlock DigiStorms's full potential?",
          "trigger-nudge": "Quick question about your DigiStorms setup",
          "stall-detection-rescue":
            "Need help getting started with DigiStorms?",
          "reactivate-trialists":
            "We miss you! Your DigiStorms account is waiting",
          "nurture-trialists":
            "Still thinking about DigiStorms? Here's what you missed",
        };
        return subjects[useCase] || "Welcome to DigiStorms!";
      };

      const getPreviewForUseCase = (useCase: string) => {
        const previews = {
          welcome:
            "Get started with our amazing features and unlock your potential",
          "milestone-celebration":
            "Congratulations on your progress — here's what's next",
          "notify-trial-ending":
            "Don't lose access to your projects and team features",
          "activate-trialists":
            "Discover advanced features that will transform your workflow",
          "trigger-nudge":
            "One small step to unlock the full power of DigiStorms",
          "stall-detection-rescue":
            "Let us help you get the most out of your DigiStorms experience",
          "reactivate-trialists":
            "Your account is ready and waiting — let's continue where you left off",
          "nurture-trialists":
            "See the latest features and updates you've been missing",
        };
        return (
          previews[useCase] || "Everything you need to create powerful emails"
        );
      };

      return apiEmails.map((variant: any, index: number) => ({
        id: `api-${index}`,
        subject: getSubjectForUseCase(briefData.useCase),
        preview: getPreviewForUseCase(briefData.useCase),
        content: variant.html,
        style: variant.variant_name,
        brandTone: variant.variant_name.replace(/_/g, " "),
        isHtml: true,
      }));
    } else {
      return generateRealisticEmails(briefData);
    }
  }, [briefData]);

  // Apply template tweaks to all emails
  // Create a stable key that changes when tweaks change
  const tweaksKey = `${templateTweaks?.ctaButtonColor || "no-color"}-${templateTweaks?.ctaButtonAlignment || "no-align"
    }-${templateTweaks?.ctaButtonBorderRadius || "no-radius"}-${templateTweaks?.logoAlignment || "no-logo-align"
    }-${templateTweaks?.socialIconsFamily || "no-social"}-${templateTweaks?.footerType || "no-footer"
    }-${templateTweaks?.enabledSocialIcons?.join(",") || "all-icons"
    }-${templateTweaks?.backgroundStyle || "default"}-${templateTweaks?.logoBlendBackground ? "blend" : "no-blend"}-${templateTweaks?.footerBlendBackground ? "footer-blend" : "no-footer-blend"}`;

  const emails = useMemo(() => {
    console.log("🔄 EmailGallery useMemo triggered", {
      hasTweaks: !!templateTweaks,
      ctaButtonColor: templateTweaks?.ctaButtonColor,
      ctaButtonAlignment: templateTweaks?.ctaButtonAlignment,
      logoAlignment: templateTweaks?.logoAlignment,
      socialIconsFamily: templateTweaks?.socialIconsFamily,
      footerType: templateTweaks?.footerType,
      tweaksKey,
      baseEmailsCount: baseEmails?.length || 0,
    });

    // Always apply tweaks function, even if ctaButtonColor is undefined
    // The function will check internally and skip if needed
    const modifiedEmails = baseEmails?.map((email) => {
      const modifiedContent =
        email.isHtml && templateTweaks
          ? applyTemplateTweaks(email.content, templateTweaks)
          : email.content;

      const changed = email.content !== modifiedContent;
      if (changed) {
        console.log("📧 Email modified:", {
          id: email.id,
          originalLength: email.content.length,
          modifiedLength: modifiedContent.length,
        });
      }

      return {
        ...email,
        content: modifiedContent,
      };
    });

    return modifiedEmails;
  }, [baseEmails, tweaksKey, templateTweaks]);

  // const getStyleColor = (style: string) => {
  //   switch (style) {
  //     case 'professional': return 'from-blue-500 to-indigo-600';
  //     case 'friendly': return 'from-green-500 to-emerald-600';
  //     case 'urgent': return 'from-red-500 to-pink-600';
  //     default: return 'from-purple-500 to-purple-600';
  //   }
  // };

  // const getStyleIcon = (style: string) => {
  //   switch (style) {
  //     case 'professional': return '💼';
  //     case 'friendly': return '😊';
  //     case 'urgent': return '⚡';
  //     default: return '📧';
  //   }
  // };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Your Generated Email Options
        </h2>
        <p className="text-gray-600 text-lg">
          Choose the email that best fits your brand voice and objectives
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {emails?.map((email, index) => (
          <div
            key={email.id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-md transition-all duration-300 overflow-hidden transform hover:scale-105"
          >
            {/* Purple Header with Variant Name */}
            <div className="bg-purple-600 px-4 py-3">
              <h3 className="text-white font-semibold text-sm capitalize">
                Template #{index + 1}
              </h3>
            </div>

            {/* Full Email Preview */}
            <div className="flex flex-col h-[450px]">
              {email.isHtml ? (
                <div className="flex-1 overflow-hidden">
                  <iframe
                    key={`${email.id}-${tweaksKey}-${email.content
                      .substring(0, 50)
                      .replace(/[^a-zA-Z0-9]/g, "")}`}
                    srcDoc={renderEmailForContext(email.content, "preview")}
                    className="w-full h-full border-0 rounded-lg origin-top-left"
                    style={{
                      width: "270%",
                      height: "270%",
                      transform: "scale(0.38)",
                      transformOrigin: "top left",
                    }}
                    title={`Email preview ${email.style}`}
                  />
                </div>
              ) : (
                <div className="flex-1 p-6 text-sm text-gray-700 overflow-auto">
                  {email.content.split("\n").map((line, index) => (
                    <div key={index} className="mb-2">
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {/* Customize Button */}
              <div className="p-4 border-t">
                <button
                  onClick={() =>
                    onSelect({
                      ...email,
                      subject: "",
                      preview: "",
                    })
                  }
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Customize This Email
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
