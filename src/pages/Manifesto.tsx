import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { appUrl } from "@/config/appUrl";
import manifestoImage from "@/assets/manifesto_image.png";

const ArrowBullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-3">
    <svg className="mt-1 w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="#754bdd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="text-lg text-gray-700">{children}</div>
  </div>
);

const Manifesto: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Navbar />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-100/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
          <div className="text-center mb-20">
            <h1 className="text-3xl lg:text-5xl font-semibold text-black mb-6 leading-tight">
              The <span className="text-black">DigiStorms</span> Manifesto
            </h1>
            <h2 className="text-xl lg:text-2xl font-medium text-gray-700 mb-8">
              High-performing emails, made effortless.
            </h2>
          </div>

          <section className="mb-20">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">What we refuse to accept</h2>
            <div className="space-y-4">
              <ArrowBullet><strong>Weeks to ship:</strong> Great onboarding shouldn't take a sprint and a stand-up to send.</ArrowBullet>
              <ArrowBullet><strong>Tool soup:</strong> One place for copy, another for design, a third for sends—context lost, momentum gone.</ArrowBullet>
              <ArrowBullet><strong>Pretty-but-broken:</strong> Emails that look perfect in Figma and fall apart in inboxes.</ArrowBullet>
              <ArrowBullet><strong>Brand drift:</strong> Inconsistent colors, tone, and structure that dilute trust.</ArrowBullet>
              <ArrowBullet><strong>Guesswork:</strong> "Let's try this layout" instead of using patterns that actually convert.</ArrowBullet>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">What we believe</h2>
            <div className="space-y-4">
              <ArrowBullet><strong>Speed is strategy.</strong> Momentum beats meetings. Minutes to draft, not weeks to debate.</ArrowBullet>
              <ArrowBullet><strong>Patterns win.</strong> Proven, conversion-backed layouts &gt; reinventing the wheel each send.</ArrowBullet>
              <ArrowBullet><strong>Precision matters.</strong> Rendering right across clients is table stakes, not a nice-to-have.</ArrowBullet>
              <ArrowBullet><strong>Brand first.</strong> Every touchpoint should feel unmistakably "you."</ArrowBullet>
              <ArrowBullet><strong>AI is a partner.</strong> It accelerates the work; you own the judgment and voice.</ArrowBullet>
              <ArrowBullet><strong>Start simple, scale smart.</strong> Clarity beats complexity—especially in onboarding.</ArrowBullet>
              <ArrowBullet><strong>Learning compounding.</strong> Every send should teach the next one something.</ArrowBullet>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">Our promise to teams</h2>
            <div className="space-y-4">
              <ArrowBullet><strong>From idea to email in minutes.</strong> Answer a few practical prompts → get nine on-brand, conversion-ready drafts.</ArrowBullet>
              <ArrowBullet><strong>Designs that deliver.</strong> Code that's built for real inboxes, not just Dribbble shots.</ArrowBullet>
              <ArrowBullet><strong>Copy that carries weight.</strong> Inspired by 1,000+ B2B SaaS emails from companies who've done the work.</ArrowBullet>
              <ArrowBullet><strong>Your brand, everywhere.</strong> Colors, logos, tone—stitched into every variant, automatically.</ArrowBullet>
              <ArrowBullet><strong>Own your stack.</strong> Export clean HTML, take it to any ESP, keep full control.</ArrowBullet>
            </div>
          </section>

          <section className="mb-20">
            <h2 className="text-3xl font-semibold text-gray-900 mb-8">How we build (so you can move faster)</h2>
            <div className="space-y-4">
              <ArrowBullet><strong>Research over vibes.</strong> We study what top SaaS teams actually send—and why it works.</ArrowBullet>
              <ArrowBullet><strong>Guardrails, not cages.</strong> You choose the use case; we shape options that win.</ArrowBullet>
              <ArrowBullet><strong>Delivery obsessed.</strong> Rendering, accessibility, image weight, dark mode—we sweat the invisible details.</ArrowBullet>
              <ArrowBullet><strong>Transparent roadmap.</strong> We build in public and ship relentlessly.</ArrowBullet>
            </div>
          </section>

          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-semibold text-gray-900 mb-8">Who we're for</h2>
                <div className="space-y-4 text-lg text-gray-700">
                  <p>Founders and marketers who'd rather <strong>ship</strong> than storyboard.</p>
                  <p>Teams who want <strong>onboarding emails that convert now</strong>, not after a rebrand.</p>
                  <p>Anyone who believes lifecycle emails are a growth lever—not busywork.</p>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <img src={manifestoImage} alt="Stormy Character" className="w-90 h-auto max-h-[350px]" />
              </div>
            </div>
          </section>
        </div>

        <section className="pb-12 rounded-3xl">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-semibold text-gray-900 mb-4">No strategy? No problem.</h2>
            <p className="text-xl text-gray-600 mb-8">We've done the hard part — just pick a use case and go.</p>
            <a
              href={appUrl("/email-sequence-generator")}
              className="inline-block bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-all"
            >
              Start in the app →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Manifesto;
