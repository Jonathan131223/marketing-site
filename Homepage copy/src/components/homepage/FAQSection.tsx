
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "Do I need a Resend account?",
      answer: "No. DigiStorms generates your emails and lets you export or copy them. You can send through any ESP you already use: Resend, Mailchimp, Customer.io, or others."
    },
    {
      question: "Do I need Stripe?",
      answer: "No. DigiStorms works independently of your billing setup. You don't need Stripe or any payment integration to generate and use your onboarding emails."
    },
    {
      question: "How long does setup take?",
      answer: "Most users have their first email sequence ready in under 10 minutes. Enter your website URL, and DigiStorms analyzes your product and generates a full onboarding flow automatically."
    },
    {
      question: "Does this work for freemium?",
      answer: "Yes. DigiStorms is specifically designed for freemium and free-trial SaaS products. It focuses on activation milestones and upgrade moments, the exact emails that move free users to paid."
    },
    {
      question: "Can I edit the emails?",
      answer: "Yes. Every email is fully editable after generation. You get strong, structured drafts built on proven SaaS examples, then tweak the copy, CTAs, or tone to match your voice."
    },
    {
      question: "What happens when I hit my user limit?",
      answer: "New signups over your plan's monthly limit won't be enrolled in your onboarding sequence. Upgrade to Pro (1,000 users/month) or Business (5,000 users/month) at any time to raise your limit. Limits reset on the 1st of each month."
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-[#F8FAFC] relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Your questions, answered
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "22px" }}>
            Everything you need to know about DigiStorms and onboarding automation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {faqs.slice(0, 3).map((faq, index) => (
              <Accordion key={index} type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index}`} className="group bg-white border border-gray-100/80 rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-gray-900 hover:no-underline p-8 hover:bg-gray-50 transition-colors">
                    <span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm sm:text-base leading-relaxed px-8 pb-8 pt-0">
                    <div className="border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
          
          <div className="space-y-6">
            {faqs.slice(3).map((faq, index) => (
              <Accordion key={index + 3} type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index + 3}`} className="group bg-white border border-gray-100/80 rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-left text-base sm:text-lg font-medium text-gray-900 hover:no-underline p-8 hover:bg-gray-50 transition-colors">
                    <span>
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-sm sm:text-base leading-relaxed px-8 pb-8 pt-0">
                    <div className="border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
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
