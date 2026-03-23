import React from "react";
import drewPriceImage from "@/assets/testimonials/drew-price.png";
import grammarlyLogo from "@/assets/logos/grammarly-logo.png";

export const TestimonialSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Trusted by SaaS growth leaders
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
            Founders and growth teams use DigiStorms to turn onboarding into a real revenue driver.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100/80 px-10 py-16 sm:px-14 sm:py-20 md:px-20 md:py-24">
          <blockquote className="text-2xl sm:text-3xl md:text-4xl font-medium text-gray-900 leading-snug mb-12 md:mb-16">
            "DigiStorms is a game-changer for startups and growth-stage teams
            that want to build their onboarding email sequence fast. I recommend
            everyone I know give it a spin and see for themselves."
          </blockquote>

          <div className="flex items-center justify-between gap-6 flex-wrap pt-2">
            <div className="flex items-center gap-4">
              <img
                src={drewPriceImage}
                alt="Drew Price"
                className="w-11 h-11 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Drew Price
                </p>
                <p className="text-sm text-gray-500">
                  SVP Growth Marketing & Automation
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <svg
                width="290"
                height="48"
                viewBox="0 0 290 48"
                style={{ overflow: 'visible' }}
                className="flex-shrink-0"
              >
                <defs>
                  <path id="drewCurve" d="M 0,44 Q 145,24 290,10" />
                </defs>
                <text
                  style={{
                    fontFamily: "'Kalam', cursive",
                    fontSize: '17px',
                    fill: '#9ca3af',
                    fontWeight: 300,
                  }}
                >
                  <textPath href="#drewCurve">
                    Built the email marketing program at
                  </textPath>
                </text>
              </svg>
              <div className="overflow-hidden flex items-center justify-end flex-shrink-0" style={{ height: '2.4rem' }}>
                <img
                  src={grammarlyLogo}
                  alt="Grammarly"
                  className="w-auto opacity-80"
                  style={{ height: '6.3rem' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
