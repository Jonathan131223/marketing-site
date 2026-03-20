import React from "react";
import founderImage from "@/assets/founder/jonathan-profile.png";

export const FounderStorySection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 sm:gap-6 mb-6">
            <img
              src={founderImage}
              alt="Jonathan, creator of DigiStorms"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover flex-shrink-0 mx-auto sm:mx-0"
            />
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 text-center sm:text-left">
              👋 Hey – I'm Jonathan, the creator of DigiStorms.
            </h3>
          </div>
          <div className="space-y-4 text-gray-700">
            <p>Before building this, I spent years helping SaaS companies improve their onboarding emails — the ones that actually activate users and turn them into paying customers.</p>
            <p>And I kept seeing the same problem:</p>
            <p>teams spend weeks writing and designing onboarding sequences, only to end up with something generic… or never launch them at all.</p>
            <p>So I decided to fix it.</p>
            <p>I built DigiStorms for 3 simple reasons:</p>
            <ol className="list-decimal list-inside space-y-2 pl-1">
              <li>Help SaaS teams create high-converting onboarding emails in minutes, not weeks.</li>
              <li>Turn user activation into a real growth engine, not an afterthought.</li>
              <li>Make it effortless to guide every new signup toward their first value moment.</li>
            </ol>
            <p>Onboarding is one of the biggest missed opportunities in SaaS.</p>
            <p>Now, with DigiStorms, you can finally turn it into your competitive edge.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
