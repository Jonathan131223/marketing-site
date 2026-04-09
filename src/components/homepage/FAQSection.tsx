import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const FAQSection: React.FC = () => {
  const faqs = [
    {
      question: "How does DigiStorms generate onboarding emails?",
      answer: "DigiStorms analyzes your product to understand how users reach value. It identifies key steps in your onboarding journey, then generates a complete email sequence tailored to those milestones. Instead of writing emails from scratch, you get a structured onboarding flow aligned with how your product actually works."
    },
    {
      question: "How is DigiStorms different from other email tools?",
      answer: "Traditional tools require you to manually design sequences and guess what to send. DigiStorms does the opposite \u2014 it figures out your onboarding flow automatically and builds the right emails for you. It also triggers messages based on real user behavior, not fixed schedules, so users get the right message at the right time."
    },
    {
      question: "Can I edit the emails before sending them?",
      answer: "Yes. You have full control over every email. DigiStorms generates the initial sequence for you, but you can review, edit, and customize everything before going live."
    },
    {
      question: "How long does it take to get started?",
      answer: "Just a few minutes. You enter your website, DigiStorms analyzes your product, and your onboarding sequence is generated automatically. You can review and launch it right away."
    },
    {
      question: "What do I need to connect to get started?",
      answer: "All you need is your website to get started. To send emails and track user behavior, you'll connect your email provider and product events (via your existing tools or a simple integration)."
    },
    {
      question: "How does DigiStorms know when to send each email?",
      answer: "DigiStorms sends emails based on what users actually do in your product. For example, it can trigger messages when someone signs up, reaches a milestone, or stops engaging. This ensures every email is sent at the most relevant moment."
    },
    {
      question: "Does it really adapt to user behavior automatically?",
      answer: "Yes. DigiStorms continuously reacts to user activity. If a user progresses quickly, stalls, or skips steps, the system adjusts and sends the most relevant message \u2014 no manual intervention needed."
    },
    {
      question: "What results can I expect from using DigiStorms?",
      answer: "Most SaaS products lose users before they reach value. DigiStorms helps fix that by guiding users through onboarding with the right messages at the right time. The result is typically higher activation, better engagement, and more users converting to paid."
    }
  ];

  return (
    <section className="py-12 bg-background-warm">
      <div className="container mx-auto px-6 max-w-[720px]">
        <div className="text-center mb-10">
          <p className="text-[13px] font-semibold tracking-[0.08em] uppercase text-primary mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 tracking-[-0.01em]">
            Your questions, answered
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Accordion key={index} type="single" collapsible className="w-full">
              <AccordionItem value={`item-${index}`} className="bg-white border border-slate-100/80 rounded-xl shadow-sm overflow-hidden">
                <AccordionTrigger className="text-left text-base font-medium text-slate-900 hover:no-underline px-6 py-5 hover:bg-slate-50 transition-colors">
                  <span>{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-[15px] leading-relaxed px-6 pb-5 pt-0">
                  <div className="border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>

        {/* Hidden FAQ content for crawlers that don't execute JS */}
        <div className="sr-only" aria-hidden="true">
          {faqs.map((faq, index) => (
            <div key={`seo-${index}`}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
