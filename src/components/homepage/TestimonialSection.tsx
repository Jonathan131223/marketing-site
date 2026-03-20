import React from "react";
import drewPriceImage from "@/assets/testimonials/drew-price.png";
import grammarlyLogo from "@/assets/logos/grammarly-logo.png";

export const TestimonialSection: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 bg-purple-50 overflow-hidden">
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900">
            Endorsed by top SaaS growth leaders
          </h2>
        </div>
        <div className="max-w-4xl mx-auto relative">
          <div className="relative bg-white/80 backdrop-blur-sm border-2 border-purple-200/60 rounded-3xl p-6 sm:p-8 md:p-12 shadow-lg hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
                  <p>
                    "I've been mentoring Jonathan for the past year, and from the start, his product instincts stood out. What he's built with DigiStorms has evolved from an audacious idea into{" "}
                    <span className="font-semibold">one of the most impressive tools I've seen</span> for SaaS founders and marketers. It lets you{" "}
                    <span className="font-semibold">create complete lifecycle email flows in minutes</span> — not weeks — without sacrificing quality or consistency.
                  </p>
                  <p>
                    I'm extremely proud of how far the product has come, and I genuinely believe{" "}
                    <span className="font-semibold">it's a game-changer for startups and growth-stage teams that want to build their 0-to-1 lifecycle motion fast</span>. I recommend everyone I know give DigiStorms a spin and see for themselves."
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mt-6 sm:mt-8">
                  <div className="flex-shrink-0">
                    <img src={drewPriceImage} alt="Drew Price" className="w-20 h-20 sm:w-32 sm:h-32 rounded-full ring-4 ring-purple-100 object-cover" />
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">— Drew Price</p>
                    <p className="text-sm sm:text-base text-gray-600">
                      Lifecycle marketing leader | Former CRM Director at Grammarly | Creator of the "Scaling CRM" newsletter
                    </p>
                    <img src={grammarlyLogo} alt="Grammarly" className="h-8 w-auto mt-3 opacity-60 mx-auto sm:mx-0" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
