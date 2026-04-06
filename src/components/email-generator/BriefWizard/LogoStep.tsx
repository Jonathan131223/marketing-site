import React, { useState } from "react";
import { ArrowRight, ArrowLeft, Image, Wand2, Loader2 } from "lucide-react";
/**
 * Stub for background removal — the original used a Supabase Edge Function.
 * Returns the original URL unchanged so the UI keeps working.
 */
async function removeBackgroundFromUrl(imageUrl: string): Promise<string> {
  console.warn("removeBackgroundFromUrl: background removal is not available in this environment");
  return imageUrl;
}

interface LogoStepProps {
  currentLogoUrl: string | null;
  onLogoChange: (file: File | null, url: string | null) => void;
  onNext: () => void;
  onBack: () => void;
  isUploading: boolean;
  // Legacy props - kept for backwards compatibility but no longer used
  extractedLogoUrl?: string | null;
  hideExtractedLogo?: boolean;
}

export const LogoStep: React.FC<LogoStepProps> = ({
  currentLogoUrl,
  onLogoChange,
  onNext,
  onBack,
  isUploading,
}) => {
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgRemovalError, setBgRemovalError] = useState<string | null>(null);

  const handleRemoveBackground = async () => {
    if (!currentLogoUrl) return;

    setIsRemovingBg(true);
    setBgRemovalError(null);

    try {
      // Get the processed image as base64 data URL
      const processedDataUrl = await removeBackgroundFromUrl(currentLogoUrl);

      // Convert base64 data URL to Blob for upload
      const response = await fetch(processedDataUrl);
      const blob = await response.blob();

      // Create a File from the Blob
      const file = new File([blob], "logo-no-bg.png", { type: "image/png" });

      // Upload the processed image to get a proper URL
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(
        "https://api-test.digistorms.net/user_images/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload processed image");
      }

      const result = await uploadResponse.json();
      onLogoChange(null, result.image_url);
    } catch (error) {
      console.error("Background removal failed:", error);
      setBgRemovalError(
        error instanceof Error ? error.message : "Failed to remove background"
      );
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          "https://api-test.digistorms.net/user_images/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();
        onLogoChange(null, result.image_url);
      } catch (error) {
        console.error("Logo upload failed:", error);
        onLogoChange(file, null);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-slate-900/10 p-10 border border-slate-200/50">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Upload Your Logo
          </h2>
          <p className="text-slate-600">
            Your logo will appear in the email previews (optional)
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.svg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <div
              className={`p-8 rounded-xl border-2 border-dashed transition-all ${currentLogoUrl
                ? "border-purple-500 bg-purple-50"
                : "border-slate-300 hover:border-purple-400"
                }`}
            >
              <div className="flex flex-col items-center text-center">
                {currentLogoUrl ? (
                  <>
                    <div className="w-20 h-20 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden mb-4 shadow-sm">
                      <img
                        src={currentLogoUrl}
                        alt="Uploaded logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p className="text-slate-700 font-medium">Logo uploaded</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Click to replace
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                      <Image className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-700">
                      <span className="text-purple-600 font-medium">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      PNG, JPG, SVG up to 5MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Remove Background Button */}
          {currentLogoUrl && (
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleRemoveBackground}
                disabled={isRemovingBg}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRemovingBg ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing background...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Remove Background
                  </>
                )}
              </button>
              {bgRemovalError && (
                <p className="text-sm text-red-500">{bgRemovalError}</p>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 inline-flex items-center justify-center px-6 py-4 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!currentLogoUrl}
              className="flex-1 group inline-flex items-center justify-center bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 transition-all duration-300 shadow-xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
