import React, { RefObject, useState, useRef, useEffect } from "react";
import { renderEmailForContext } from "@/utils/emailRenderer";
import { Laptop, Smartphone } from "lucide-react";

export interface EmailClientPreviewProps {
  /** Raw email HTML; rendered with "preview" context inside the component */
  htmlContent: string;
  subject: string;
  /** Gray background behind content (e.g. when email body has gray bg) */
  hasGrayBackground?: boolean;
  /** Label in the mockup header (e.g. "Email Client" vs "Email Preview") */
  headerLabel?: string;
  /** Desktop = full width; mobile = 375px scaled */
  widthVariant?: "desktop" | "mobile";
  /** "auto" = measure on load and set height; otherwise use as style height (e.g. "500px") */
  iframeHeight?: "auto" | string;
  /** Optional ref for the iframe (e.g. for parent height logic on device switch) */
  iframeRef?: RefObject<HTMLIFrameElement | null>;
  /** Override From line (default: "DigiStorms <hello@company.com>") */
  fromLabel?: string;
  /** Override To line (default: "you@example.com") */
  toLabel?: string;
  /** When false, no scale(0.85) wrapper (e.g. for compact journey preview) */
  scaleContent?: boolean;
  className?: string;
}

export const EmailClientPreview: React.FC<EmailClientPreviewProps> = ({
  htmlContent,
  subject,
  hasGrayBackground = false,
  headerLabel = "Email Client",
  widthVariant = "desktop",
  iframeHeight = "auto",
  iframeRef,
  fromLabel = "DigiStorms <hello@company.com>",
  toLabel = "you@example.com",
  scaleContent = true,
  className,
}) => {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const localIframeRef = useRef<HTMLIFrameElement>(null);
  const srcDoc = renderEmailForContext(htmlContent, "preview");

  // Recalculate iframe height when switching desktop/mobile (width transition can change content height)
  useEffect(() => {
    if (iframeHeight !== "auto") return;
    const iframe = localIframeRef.current;
    if (!iframe) return;
    const parentWrapper = iframe.parentElement;
    const contentContainer = parentWrapper?.parentElement;
    const t = setTimeout(() => {
      try {
        iframe.style.height = "auto";
        const body = iframe.contentWindow?.document.body;
        const html = iframe.contentWindow?.document.documentElement;
        if (body && html) {
          void body.offsetHeight;
          const height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
          );
          if (height > 0) {
            const finalHeight = height + 20;
            iframe.style.height = `${finalHeight}px`;
            if (parentWrapper) parentWrapper.style.height = `${finalHeight}px`;
            if (contentContainer) {
              contentContainer.style.height = `${scaleContent ? finalHeight * 0.85 : finalHeight}px`;
            }
          }
        }
      } catch (err) {
        console.error("Failed to recalc iframe height on device switch", err);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [device, iframeHeight, scaleContent]);

  return (
    <div className={`rounded-lg border shadow-sm overflow-hidden ${className ?? ""}`}>
      {/* Browser-style header with traffic lights + Desktop/Mobile toggle */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center justify-between border-b">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <span className="text-xs text-muted-foreground">{headerLabel}</span>
        <div className="flex rounded-lg border overflow-hidden">
          <button
            type="button"
            onClick={() => setDevice("desktop")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
              device === "desktop" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
            }`}
          >
            <Laptop className="w-4 h-4" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice("mobile")}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors border-l ${
              device === "mobile" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>
      </div>

      {/* Email metadata (From, To, Subject) */}
      <div className="bg-white px-6 py-4 border-b space-y-1.5">
        <div className="text-sm flex">
          <span className="text-muted-foreground w-16">From:</span>
          <span>{fromLabel}</span>
        </div>
        <div className="text-sm flex">
          <span className="text-muted-foreground w-16">To:</span>
          <span>{toLabel}</span>
        </div>
        <div className="text-sm flex">
          <span className="text-muted-foreground w-16">Subject:</span>
          <span className="font-medium">{subject || "No subject"}</span>
        </div>
      </div>

      {/* Email content */}
      <div
        className={`flex justify-center overflow-hidden transition-[height] duration-300 ease-in-out ${
          hasGrayBackground ? "bg-[#f3f4f6]" : "bg-white"
        }`}
        style={{ minHeight: "200px" }}
      >
        <div
          className={`transition-[width] duration-300 ease-in-out ${
            device === "mobile" ? "w-[375px]" : "w-full max-w-[700px]"
          }`}
          style={
            scaleContent
              ? { transform: "scale(0.85)", transformOrigin: "top center" }
              : undefined
          }
        >
          <iframe
            ref={(el) => {
              (localIframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = el;
              if (iframeRef) {
                (iframeRef as React.MutableRefObject<HTMLIFrameElement | null>).current = el;
              }
            }}
            title="Email Preview"
            srcDoc={srcDoc}
            className="w-full border-0"
            style={{
              backgroundColor: hasGrayBackground ? "#f3f4f6" : "transparent",
              height:
                iframeHeight === "auto"
                  ? undefined
                  : typeof iframeHeight === "string"
                    ? iframeHeight
                    : `${iframeHeight}px`,
            }}
            sandbox="allow-same-origin allow-popups allow-top-navigation-by-user-activation"
            onLoad={
              iframeHeight === "auto"
                ? (e) => {
                    const iframe = e.currentTarget;
                    setTimeout(() => {
                      try {
                        const body = iframe.contentWindow?.document.body;
                        const html = iframe.contentWindow?.document.documentElement;
                        if (body && html) {
                          const height = Math.max(
                            body.scrollHeight,
                            body.offsetHeight,
                            html.clientHeight,
                            html.scrollHeight,
                            html.offsetHeight
                          );
                          if (height > 0) {
                            const finalHeight = height + 20;
                            iframe.style.height = `${finalHeight}px`;
                            if (iframe.parentElement) {
                              iframe.parentElement.style.height = `${finalHeight}px`;
                              if (iframe.parentElement.parentElement) {
                                const visualHeight = scaleContent ? finalHeight * 0.85 : finalHeight;
                                iframe.parentElement.parentElement.style.height = `${visualHeight}px`;
                              }
                            }
                          }
                        }
                      } catch (err) {
                        console.error("Failed to resize iframe", err);
                      }
                    }, 300);
                  }
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};
