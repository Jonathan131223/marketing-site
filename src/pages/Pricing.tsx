import React, { useState } from "react";
import { Check, Gift, Star, Zap, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { appUrl } from "@/config/appUrl";

const CALENDLY_CONCIERGE_URL = "https://calendly.com/jonathan-digistorms/30-min-call";

const sharedFeatures = [
  "7-email onboarding sequence generated for your product",
  "Milestone-based sending (signup, milestone 1, milestone 2, upgrade)",
  "Email editor included",
  "Dashboard to monitor onboarding progress",
];

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    badge: "FREE FOREVER",
    badgeColor: "bg-gray-100 text-gray-600",
    description: "Try it out, no commitment",
    creditsText: "100 users / month",
    resetText: "Users reset monthly",
    icon: <Gift className="h-3.5 w-3.5" />,
    features: sharedFeatures,
    buttonText: "Get started free",
    buttonStyle: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    cardStyle: "bg-white border-2 border-gray-200",
    highlight: false,
    link: () => appUrl("/portal"),
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    period: "/month",
    badge: "MOST POPULAR",
    badgeColor: "bg-emerald-50 text-emerald-700",
    description: "Perfect for growing teams",
    creditsText: "1,000 users / month",
    annualText: "Or $182/year (20% off)",
    icon: <Zap className="h-3.5 w-3.5" />,
    features: sharedFeatures,
    buttonText: "Start Pro",
    buttonStyle: "bg-gray-900 text-white hover:bg-gray-800",
    cardStyle: "bg-white border-2 border-gray-200",
    highlight: true,
    link: () => appUrl("/portal"),
  },
  {
    id: "business",
    name: "Business",
    price: "$59",
    period: "/month",
    badge: "BEST VALUE",
    badgeColor: "bg-purple-50 text-purple-700",
    description: "For scaling SaaS products",
    creditsText: "5,000 users / month",
    annualText: "Or $566/year (20% off)",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    features: sharedFeatures,
    buttonText: "Start Business",
    buttonStyle: "bg-purple-600 text-white hover:bg-purple-700",
    cardStyle: "bg-white border-2 border-gray-200",
    highlight: false,
    link: () => appUrl("/portal"),
  },
  {
    id: "concierge",
    name: "Concierge",
    price: "$690",
    period: "/month",
    badge: "DONE FOR YOU",
    badgeColor: "bg-white/20 text-white",
    description: "We create your emails for you",
    creditsText: "Done-for-you email strategy",
    icon: <Star className="h-3.5 w-3.5" />,
    features: [
      "Custom-crafted emails by lifecycle experts (7 emails per month)",
      "Unlimited revisions until you're happy",
      "Monthly strategy & consulting call",
      "Implementation into your email platform",
      "30 days money-back guarantee",
    ],
    buttonText: "Book a Call →",
    buttonStyle: "bg-white text-primary hover:bg-primary/6",
    cardStyle: "bg-gradient-to-br from-primary to-primary/90 text-white shadow-xl",
    highlight: false,
    isPremium: true,
    link: () => CALENDLY_CONCIERGE_URL,
  },
];

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      <main>
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Onboarding that <span className="text-primary">runs itself</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mx-auto">
            Simple, usage-based pricing. Pay for the users you onboard — nothing else.
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 shadow-sm hover:shadow-lg transition-shadow flex flex-col ${plan.cardStyle}`}
              >
                <div className="mb-6">
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4 ${plan.badgeColor}`}>
                    {plan.icon}
                    {plan.badge}
                  </div>
                  <h3 className={`text-2xl font-bold ${plan.isPremium ? "text-white" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-1 ${plan.isPremium ? "text-white/80" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold ${plan.isPremium ? "text-white" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={plan.isPremium ? "text-white/70" : "text-gray-500"}>{plan.period}</span>
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${plan.isPremium ? "text-white/80" : "text-gray-500"}`}>
                    <span className={`font-semibold ${plan.isPremium ? "text-white" : "text-gray-900"}`}>
                      {plan.creditsText}
                    </span>{" "}
                    {!plan.isPremium && "included"}
                  </p>
                  {plan.resetText && <p className="text-xs text-gray-400 mt-1">{plan.resetText}</p>}
                  {plan.annualText && <p className="text-xs text-gray-400 mt-1">{plan.annualText}</p>}
                </div>

                <div className="mb-8">
                  <p className={`text-sm font-medium mb-4 ${plan.isPremium ? "text-white" : "text-gray-700"}`}>
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check
                          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.isPremium ? "text-white/80" : "text-emerald-500"}`}
                        />
                        <span className={`text-sm ${plan.isPremium ? "text-white/90" : "text-gray-600"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={plan.link()}
                  target={plan.id === "concierge" ? "_blank" : undefined}
                  rel={plan.id === "concierge" ? "noopener noreferrer" : undefined}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-colors text-center block ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            Users = unique user.signed_up events per month.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
