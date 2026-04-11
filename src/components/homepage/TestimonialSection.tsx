import React from "react";
// Drew Price headshot and Grammarly logo are served as raw paths from
// /public/images/* (not via vite asset imports) — so no imports needed here.

export const TestimonialSection: React.FC = () => {
  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-[740px] mx-auto">
          <blockquote className="text-xl sm:text-2xl font-serif italic text-slate-900 leading-[1.5] mb-7">
            "DigiStorms is a game-changer for startups and growth-stage teams
            that want to build their onboarding email sequence fast. I recommend
            everyone I know give it a spin and see for themselves."
          </blockquote>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 mt-2">
            {/* Left: who he is */}
            <div className="flex items-center gap-3">
              <img
                src="/images/drew-price.png"
                alt="Drew Price"
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                width="44"
                height="44"
                decoding="async"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-900">Drew Price</p>
                <p className="text-sm text-slate-500">SVP Growth Marketing & Automation</p>
              </div>
            </div>

            {/* Right: what he did */}
            <div className="flex items-center gap-3">
              <span className="text-[13px] text-slate-400 text-right">Built the email marketing<br />program at</span>
              <img
                src="/images/grammarly-logo-full.png"
                alt="Grammarly"
                className="h-7 w-auto max-w-[120px] flex-shrink-0"
                height="28"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
