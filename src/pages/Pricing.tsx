import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Check, Minus, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { appUrl } from "@/config/appUrl";
import { Link } from "react-router-dom";

const CALENDLY_URL = "https://calendly.com/jonathan-digistorms/30-min-call";

const tiers = [
  { label: "100 new signups per month",    monthlyPrice: 0,   btnText: "Get started free", isContact: false },
  { label: "1,000 new signups per month",  monthlyPrice: 19,  btnText: "Start now",        isContact: false },
  { label: "5,000 new signups per month",  monthlyPrice: 59,  btnText: "Start now",        isContact: false },
  { label: "10,000 new signups per month", monthlyPrice: 149, btnText: "Start now",        isContact: false },
  { label: "More than 10,000",     monthlyPrice: null, btnText: "Contact us",      isContact: true  },
];

const selfServeFeatures = [
  "Turn new users into paying customers automatically",
  "Emails triggered by real user behavior",
  "See exactly where users drop off",
  "Improve activation without manual work",
];

const conciergeFeatures = [
  "Custom-crafted emails by lifecycle experts",
  "Complete lifecycle journey covered",
  "Unlimited revisions until you're happy",
  "Monthly strategy & consulting call",
  "Implementation into your email platform",
  "30-day money-back guarantee",
];

const Pricing: React.FC = () => {
  const [annual, setAnnual] = useState(false);
  const [tierIndex, setTierIndex] = useState(1);

  const tier = tiers[tierIndex];

  const displayPrice = () => {
    if (tier.monthlyPrice === null) return null;
    if (tier.monthlyPrice === 0) return { amount: "$0", period: "forever" };
    const price = annual ? Math.round(tier.monthlyPrice * 0.8) : tier.monthlyPrice;
    return { amount: `$${price}`, period: annual ? "/ mo, billed annually" : "/ month" };
  };

  const price = displayPrice();

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Pricing - DigiStorms AI Agent for Onboarding Emails</title>
        <meta name="description" content="Simple, transparent pricing for DigiStorms. Get your full onboarding email system built and running — from signup to upgrade." />
        <link rel="canonical" href="https://digistorms.ai/pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Pricing - DigiStorms AI Agent for Onboarding Emails" />
        <meta property="og:description" content="Simple, transparent pricing for DigiStorms. Get your full onboarding email system built and running — from signup to upgrade." />
        <meta property="og:url" content="https://digistorms.ai/pricing" />
        <meta property="og:image" content="https://digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing — DigiStorms AI Lifecycle Email Agent" />
        <meta name="twitter:description" content="Simple, transparent pricing for DigiStorms." />
        <meta name="twitter:image" content="https://digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
      </Helmet>
      <Navbar />

      <main>
        {/* Header */}
        <div className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Onboarding that <span className="text-primary">runs itself</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto mb-10">
            Pay for the users you onboard — nothing else.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-2 py-1.5 shadow-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                !annual ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                annual ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {/* Two equal columns */}
        <div className="mx-auto max-w-4xl px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── Left: Self-serve ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <div className="px-8 pt-8 pb-6 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Self-serve</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">Start free, scale as you grow</h2>

                {/* User tier stepper */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <button
                    onClick={() => setTierIndex((i) => Math.max(0, i - 1))}
                    disabled={tierIndex === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    aria-label="Decrease tier"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-semibold text-gray-800 text-center px-3">
                    {tier.label}
                  </span>
                  <button
                    onClick={() => setTierIndex((i) => Math.min(tiers.length - 1, i + 1))}
                    disabled={tierIndex === tiers.length - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    aria-label="Increase tier"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Price */}
                <div className="mt-5 min-h-[56px]">
                  {tier.isContact ? (
                    <p className="text-gray-500 text-sm">Pricing available on request.</p>
                  ) : price ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">{price.amount}</span>
                      <span className="text-gray-400 text-sm">{price.period}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Features */}
              <div className="px-8 py-6 flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">What's included:</p>
                <ul className="space-y-3">
                  {selfServeFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-8 pb-8">
                {tier.isContact ? (
                  <Link
                    to="/contact"
                    className="block w-full text-center py-3 px-6 rounded-xl font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Contact us
                  </Link>
                ) : (
                  <a
                    href={appUrl("/portal")}
                    className="block w-full text-center py-3 px-6 rounded-xl font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                  >
                    {tier.btnText}
                  </a>
                )}
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-2.5 px-6 rounded-xl text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors mt-2"
                >
                  Or book a demo →
                </a>
              </div>
            </div>

            {/* ── Right: Concierge ── */}
            <div
              className="rounded-2xl shadow-sm flex flex-col overflow-hidden"
              style={{ background: "linear-gradient(145deg, #754bdd 0%, #5a35b5 100%)" }}
            >
              <div className="px-8 pt-8 pb-6 border-b border-white/10">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">Done for you</p>
                <h2 className="text-2xl font-bold text-white mb-1">Concierge</h2>
                <p className="text-white/60 text-sm">We create and run your emails for you</p>
              </div>

              {/* Features */}
              <div className="px-8 py-6 flex-1">
                <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">What's included:</p>
                <ul className="space-y-3">
                  {conciergeFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-white/60 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="px-8 pb-8">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 px-6 rounded-xl font-semibold bg-white text-[#754bdd] hover:bg-white/90 transition-colors"
                >
                  Book a call →
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
