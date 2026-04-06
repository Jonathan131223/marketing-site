import React, { useEffect } from "react";

interface RebuildNoticeModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export const RebuildNoticeModal: React.FC<RebuildNoticeModalProps> = ({
  open,
  onClose,
  onContinue,
}) => {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rebuild-notice-title"
        className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8 border border-gray-100 text-left"
      >
        <h2
          id="rebuild-notice-title"
          className="text-xl font-semibold text-gray-900 mb-3"
        >
          Thanks for stopping by
        </h2>
        <div className="text-gray-600 text-[15px] leading-relaxed space-y-3 mb-6">
          <p>
            We&apos;re rebuilding DigiStorms right now, so you might notice a
            small glitch here and there. We&apos;d love for you to explore and
            play with the app—but we don&apos;t recommend sending real
            customer emails through it just yet.
          </p>
          <p>
            When you&apos;re ready, continue and poke around. We&apos;re
            smoothing things out and really appreciate your patience.
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onContinue}
            data-flat-purple
            style={{
              backgroundColor: "#1D4ED8",
              boxShadow: "none",
              outline: "none",
              border: "none",
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-white hover:opacity-95 transition-opacity"
          >
            Continue to the app
          </button>
        </div>
      </div>
    </div>
  );
};
