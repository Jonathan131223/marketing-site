import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import jonProfile from "@/assets/founder/jonathan-profile.png";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>About DigiStorms — From Consulting to AI Onboarding Agent</title>
        <meta name="description" content="DigiStorms started from consulting with SaaS companies on lifecycle email. After seeing the same onboarding problems everywhere, we built an AI agent to automate what we were doing manually." />
        <link rel="canonical" href="https://www.digistorms.ai/about" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About DigiStorms — From Consulting to AI Onboarding Agent" />
        <meta property="og:description" content="How a consulting pattern became an AI agent for onboarding emails." />
        <meta property="og:url" content="https://www.digistorms.ai/about" />
        <meta property="og:image" content="https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta property="og:site_name" content="DigiStorms" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About DigiStorms — From Consulting to AI Onboarding Agent" />
        <meta name="twitter:description" content="How a consulting pattern became an AI agent for onboarding emails." />
        <meta name="twitter:image" content="https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta name="twitter:site" content="@digistorms_ai" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About DigiStorms",
          "description": "DigiStorms started from consulting with SaaS companies on lifecycle email. We built an AI agent to automate onboarding email systems.",
          "url": "https://www.digistorms.ai/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "DigiStorms",
            "url": "https://www.digistorms.ai",
            "founder": {
              "@type": "Person",
              "name": "Jonathan Bernard",
              "url": "https://www.linkedin.com/in/jonathan-digistorms/",
              "jobTitle": "Founder"
            },
            "description": "AI agent that builds lifecycle email systems for SaaS companies"
          }
        })}</script>
      </Helmet>
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">

          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-3xl lg:text-5xl font-serif font-semibold text-black mb-6 leading-tight">
              The story behind DigiStorms
            </h1>
            <p className="text-xl lg:text-2xl font-medium text-slate-600">
              How a consulting pattern became an AI agent
            </p>
          </div>

          {/* Section 1 */}
          <section className="mb-20">
            <h2 className="text-2xl lg:text-3xl font-serif font-semibold text-slate-900 mb-8">It started with a pattern</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              After working with dozens of SaaS companies on their lifecycle email strategy, one thing kept coming up: every team was solving the same problem from scratch. They'd analyze their user journey, map out the onboarding milestones, figure out what emails to send and when — then spend weeks building it all manually. The process was the same every time. The emails were different, but the system behind them wasn't.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-20">
            <h2 className="text-2xl lg:text-3xl font-serif font-semibold text-slate-900 mb-8">From consulting to product</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              DigiStorms started as that consulting process — helping SaaS teams build onboarding email systems by hand. But the more companies we worked with, the clearer it became: this should be automated. An AI that understands your product, maps the user journey, and generates the right emails at the right time — that's what every team actually needs. So we built it.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-20">
            <h2 className="text-2xl lg:text-3xl font-serif font-semibold text-slate-900 mb-8">Trained on 1,000+ real emails</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We studied lifecycle emails from 38+ SaaS companies — Notion, Slack, Stripe, HubSpot, Intercom, and many more. We analyzed what the best onboarding sequences have in common: timing, triggers, tone, structure. That research is the foundation DigiStorms is built on. It's also available to everyone in our email library — the largest collection of B2B SaaS lifecycle emails on the web.
            </p>
          </section>

          {/* Section 4 — Founder */}
          <section className="mb-20">
            <h2 className="text-2xl lg:text-3xl font-serif font-semibold text-slate-900 mb-8">Built by Jonathan Bernard</h2>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <img
                src={jonProfile}
                alt="Jonathan Bernard, Founder of DigiStorms"
                className="w-28 h-28 rounded-full object-cover flex-shrink-0"
                loading="lazy"
                decoding="async"
              />
              <div>
                <p className="text-xl font-semibold text-slate-900">Jonathan Bernard</p>
                <p className="text-base text-slate-500 mb-4">Founder, DigiStorms</p>
                <p className="text-lg text-slate-600 leading-relaxed mb-4">
                  Lifecycle email specialist for SaaS companies. Previously consulted with growth teams on onboarding, retention, and expansion strategy. Now building the AI that does it automatically.
                </p>
                <a
                  href="https://www.linkedin.com/in/jonathan-digistorms/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#1D4ED8] font-medium hover:underline"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </section>

        </div>

        {/* CTA */}
        <section className="pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl border border-slate-100 px-8 py-14">
            <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-3">Ready to automate your onboarding?</h2>
            <p className="text-lg text-slate-600 mb-8">Enter your website and get a complete email sequence in minutes.</p>
            <Link
              to="/"
              className="inline-block bg-[#1D4ED8] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#6340c4] transition-colors"
            >
              Generate my onboarding emails →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default About;
