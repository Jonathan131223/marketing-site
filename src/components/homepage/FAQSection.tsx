import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FAQSection: React.FC = () => {
  const faqs = [
    { question: "Do I need a Resend account?", answer: "No. DigiStorms generates your emails and lets you export or copy them. You can send through any ESP you already use — Resend, Mailchimp, Customer.io, or others." },
    { question: "Do I need Stripe?", answer: "No. DigiStorms works independently of your billing setup. You don't need Stripe or any payment integration to generate and use your onboarding emails." },
    { question: "How long does setup take?", answer: "Most users have their first email sequence ready in under 10 minutes. Enter your website URL, and DigiStorms analyzes your product and generates a full onboarding flow automatically." },
    { question: "Does this work for freemium?", answer: "Yes. DigiStorms is specifically designed for freemium and free-trial SaaS products. It focuses on activation milestones and upgrade moments — the exact emails that move free users to paid." },
    { question: "Can I edit the emails?", answer: "Yes. Every email is fully editable after generation. You get strong, structured drafts built on proven SaaS examples — then tweak the copy, CTAs, or tone to match your voice." },
    { question: "What happens when I hit my user limit?", answer: "New signups over your plan's monthly limit won't be enrolled in your onboarding sequence. Upgrade to Pro (1,000 users/month) or Business (5,000 users/month) at any time to raise your limit. Limits reset on the 1st of each month." },
  ];

  return (
    <section className="py-16 md:py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">Your questions, answered</h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to know about our email generation platform.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {faqs.slice(0, 3).map((faq, index) => (
              <Accordion key={index} type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index}`} className="group bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-indigo-200 overflow-hidden">
                  <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-gray-900 hover:no-underline px-4 sm:px-8 py-4 sm:py-6 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300">
                    <span className="group-hover:text-indigo-700 transition-colors duration-300">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm sm:text-base leading-relaxed px-4 sm:px-8 pb-4 sm:pb-6 pt-0">
                    <div className="border-t border-gray-100 pt-4 sm:pt-6">{faq.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
          <div className="space-y-6">
            {faqs.slice(3).map((faq, index) => (
              <Accordion key={index + 3} type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index + 3}`} className="group bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-indigo-200 overflow-hidden">
                  <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-gray-900 hover:no-underline px-4 sm:px-8 py-4 sm:py-6 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300">
                    <span className="group-hover:text-indigo-700 transition-colors duration-300">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm sm:text-base leading-relaxed px-4 sm:px-8 pb-4 sm:pb-6 pt-0">
                    <div className="border-t border-gray-100 pt-4 sm:pt-6">{faq.answer}</div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
