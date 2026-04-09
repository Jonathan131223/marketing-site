import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorksSection } from "@/components/homepage/HowItWorksSection";
import { ComparisonSection } from "@/components/homepage/ComparisonSection";
import { BenefitsSection } from "@/components/homepage/BenefitsSection";
import { TestimonialSection } from "@/components/homepage/TestimonialSection";
import { FAQSection } from "@/components/homepage/FAQSection";
import { FinalCTASection } from "@/components/homepage/FinalCTASection";
import { Footer } from "@/components/Footer";
import { appUrl } from "@/config/appUrl";
import { normalizeWebsiteUrl } from "@/lib/normalizeWebsiteUrl";

const Index = () => {
  const [heroWebsiteUrl, setHeroWebsiteUrl] = useState("");
  const [ctaWebsiteUrl, setCtaWebsiteUrl] = useState("");

  const redirectToAnalyze = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    try {
      const normalized = normalizeWebsiteUrl(trimmed);
      window.location.href = appUrl(
        `/email-sequence-generator?analyze=1&url=${encodeURIComponent(normalized)}`
      );
    } catch {
      window.location.href = appUrl("/email-sequence-generator");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>DigiStorms - AI Onboarding Agent for SaaS | Turn Free Users into Paying Customers</title>
        <meta name="description" content="DigiStorms is your AI onboarding agent. It tracks user behavior and sends the right emails at the right time. Turn free users into paying customers, on autopilot." />
        <link rel="canonical" href="https://www.digistorms.ai/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="DigiStorms - AI Onboarding Agent for SaaS" />
        <meta property="og:description" content="Turn free users into paying customers, on autopilot. DigiStorms is your AI onboarding agent." />
        <meta property="og:url" content="https://www.digistorms.ai/" />
        <meta property="og:image" content="https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DigiStorms - AI Onboarding Agent for SaaS" />
        <meta name="twitter:description" content="Turn free users into paying customers, on autopilot. DigiStorms is your AI onboarding agent." />
        <meta name="twitter:image" content="https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta property="og:site_name" content="DigiStorms" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:site" content="@digistorms_ai" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DigiStorms",
          "url": "https://www.digistorms.ai",
          "description": "AI onboarding agent for SaaS",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.digistorms.ai/library?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "DigiStorms",
          "url": "https://www.digistorms.ai",
          "logo": {
            "@type": "ImageObject",
            "url": "https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png",
            "width": 1200,
            "height": 630
          },
          "description": "AI onboarding agent that helps SaaS companies turn free users into paying customers",
          "founder": {
            "@type": "Person",
            "name": "Jonathan Bernard",
            "url": "https://www.linkedin.com/in/jonathan-digistorms/"
          },
          "sameAs": [
            "https://www.linkedin.com/company/digi-storms/",
            "https://x.com/digistorms_ai"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "url": "https://www.digistorms.ai/contact"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "DigiStorms",
          "url": "https://www.digistorms.ai",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": "AI onboarding agent for SaaS. Analyzes your product and creates behavior-based onboarding email sequences automatically.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How does DigiStorms generate onboarding emails?",
              "acceptedAnswer": { "@type": "Answer", "text": "DigiStorms analyzes your product to understand how users reach value. It identifies key steps in your onboarding journey, then generates a complete email sequence tailored to those milestones." }
            },
            {
              "@type": "Question",
              "name": "How is DigiStorms different from other email tools?",
              "acceptedAnswer": { "@type": "Answer", "text": "Traditional tools require you to manually design sequences and guess what to send. DigiStorms figures out your onboarding flow automatically and triggers messages based on real user behavior, not fixed schedules." }
            },
            {
              "@type": "Question",
              "name": "Can I edit the emails before sending them?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. You have full control over every email. DigiStorms generates the initial sequence, but you can review, edit, and customize everything before going live." }
            },
            {
              "@type": "Question",
              "name": "How long does it take to get started?",
              "acceptedAnswer": { "@type": "Answer", "text": "Just a few minutes. Enter your website, DigiStorms analyzes your product, and your onboarding sequence is generated automatically." }
            },
            {
              "@type": "Question",
              "name": "What do I need to connect to get started?",
              "acceptedAnswer": { "@type": "Answer", "text": "All you need is your website. To send emails and track user behavior, connect your email provider and product events via a simple integration." }
            },
            {
              "@type": "Question",
              "name": "How does DigiStorms know when to send each email?",
              "acceptedAnswer": { "@type": "Answer", "text": "DigiStorms sends emails based on what users actually do in your product. It triggers messages when someone signs up, reaches a milestone, or stops engaging." }
            },
            {
              "@type": "Question",
              "name": "Does it really adapt to user behavior automatically?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. DigiStorms continuously reacts to user activity. If a user progresses quickly, stalls, or skips steps, the system adjusts and sends the most relevant message." }
            },
            {
              "@type": "Question",
              "name": "What results can I expect from using DigiStorms?",
              "acceptedAnswer": { "@type": "Answer", "text": "DigiStorms guides users through onboarding with the right messages at the right time. The result is typically higher activation, better engagement, and more users converting to paid." }
            }
          ]
        })}</script>
      </Helmet>
      <Navbar />
      <main>
        {/* Section 1: Hero (white) */}
        <HeroSection
          websiteUrl={heroWebsiteUrl}
          onWebsiteUrlChange={setHeroWebsiteUrl}
          onSubmit={() => redirectToAnalyze(heroWebsiteUrl)}
        />
        {/* Section 2: How It Works (cream) */}
        <HowItWorksSection />
        {/* Section 3: The Difference (white) */}
        <ComparisonSection />
        {/* Section 4: Benefits (cream) */}
        <BenefitsSection />
        {/* Section 5: Drew Price Testimonial (white) */}
        <TestimonialSection />
        {/* Section 6: FAQ (cream) */}
        <FAQSection />
        {/* Section 7: Final CTA (white) */}
        <FinalCTASection
          websiteUrl={ctaWebsiteUrl}
          onWebsiteUrlChange={setCtaWebsiteUrl}
          onSubmit={() => redirectToAnalyze(ctaWebsiteUrl)}
        />
      </main>
      {/* Footer (cream) */}
      <Footer />
    </div>
  );
};

export default Index;
