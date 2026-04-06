import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import mascotHome from "@/assets/mascots/home.png";

interface ArrowBulletProps {
  title: string;
  description?: string;
}

const ArrowBullet: React.FC<ArrowBulletProps> = ({ title, description }) => (
  <div className="flex items-start gap-3">
    <svg className="mt-1 w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12h14M13 5l7 7-7 7" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div>
      <p className="text-lg text-slate-800 font-semibold">{title}</p>
      {description && <p className="text-base text-slate-600 mt-1">{description}</p>}
    </div>
  </div>
);

const ManifestoSection: React.FC<{ title: string; items: ArrowBulletProps[] }> = ({ title, items }) => (
  <section className="mb-20">
    <h2 className="text-2xl lg:text-3xl font-serif font-serif font-semibold text-slate-900 mb-8">{title}</h2>
    <div className="space-y-6">
      {items.map((item, i) => (
        <ArrowBullet key={i} title={item.title} description={item.description} />
      ))}
    </div>
  </section>
);

const Manifesto: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>The DigiStorms Manifesto — Turn Onboarding Into Revenue</title>
        <meta name="description" content="The DigiStorms manifesto. We believe onboarding is your growth engine. Discover how we map, build, and run lifecycle email systems that move users from signup to upgrade." />
        <link rel="canonical" href="https://digistorms.ai/manifesto" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="The DigiStorms Manifesto — Turn Onboarding Into Revenue" />
        <meta property="og:description" content="We believe onboarding is your growth engine. Discover how we map, build, and run lifecycle email systems that move users from signup to upgrade." />
        <meta property="og:url" content="https://digistorms.ai/manifesto" />
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
              The DigiStorms Manifesto
            </h1>
            <p className="text-xl lg:text-2xl font-medium text-slate-600">
              Turn onboarding into revenue. Automatically.
            </p>
          </div>

          {/* What we refuse to accept */}
          <ManifestoSection
            title="What we refuse to accept"
            items={[
              {
                title: "Users signing up… and disappearing.",
                description: "Half of your users never come back — not because your product is bad, but because no one guides them.",
              },
              {
                title: "Onboarding built on guesswork.",
                description: "Random sequences, generic emails, no clear path to value.",
              },
              {
                title: "One-size-fits-all messaging.",
                description: "Every user gets the same emails, regardless of what they do.",
              },
              {
                title: "Manual lifecycle work.",
                description: "Teams stitching flows together with tools, docs, and assumptions.",
              },
              {
                title: "Missed moments.",
                description: "Users stall, reach milestones, or churn — and nothing happens.",
              },
            ]}
          />

          {/* What we believe */}
          <ManifestoSection
            title="What we believe"
            items={[
              {
                title: "Onboarding is your growth engine.",
                description: "Activation drives everything: retention, expansion, revenue.",
              },
              {
                title: "Timing beats volume.",
                description: "The right message at the right moment matters more than more emails.",
              },
              {
                title: "Behavior is the signal.",
                description: "What users do should dictate what happens next.",
              },
              {
                title: "Systems beat sequences.",
                description: "Onboarding isn't a list of emails — it's a journey.",
              },
              {
                title: "AI should remove the work, not the thinking.",
                description: "It handles the heavy lifting. You stay in control.",
              },
              {
                title: "Clarity wins.",
                description: "Users don't need more features — they need direction.",
              },
            ]}
          />

          {/* Our promise to teams */}
          <ManifestoSection
            title="Our promise to teams"
            items={[
              {
                title: "From signup to upgrade, handled.",
                description: "DigiStorms maps your onboarding journey and builds the system that moves users forward.",
              },
              {
                title: "Emails that follow behavior.",
                description: "Messages trigger based on what users actually do — not arbitrary schedules.",
              },
              {
                title: "No more guessing.",
                description: "Your lifecycle is generated from your product, not assumptions.",
              },
              {
                title: "Launch in minutes.",
                description: "Enter your website → get a complete onboarding flow → go live.",
              },
              {
                title: "Control everything.",
                description: "Edit, adjust, and shape the experience — the system adapts with you.",
              },
            ]}
          />

          {/* How we build */}
          <ManifestoSection
            title="How we build (so you don't have to)"
            items={[
              {
                title: "Product-first thinking.",
                description: "We start from how users reach value — not from templates.",
              },
              {
                title: "Behavior-driven by default.",
                description: "Every flow is tied to real user actions.",
              },
              {
                title: "Simple on the surface.",
                description: "Powerful underneath — no complexity exposed.",
              },
              {
                title: "Ship fast. Improve continuously.",
                description: "Your onboarding evolves as your product grows.",
              },
            ]}
          />

          {/* Who we're for */}
          <section className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl lg:text-3xl font-serif font-serif font-semibold text-slate-900 mb-8">Who we're for</h2>
                <div className="space-y-5">
                  <ArrowBullet title="Founders who want activation, not just signups." />
                  <ArrowBullet title="Teams tired of building onboarding flows manually." />
                  <ArrowBullet title="SaaS companies that know lifecycle = revenue." />
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <img
                  src={mascotHome}
                  alt="DigiStorms mascot"
                  className="w-full max-w-xs h-auto"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </section>

        </div>

        {/* CTA */}
        <section className="pb-20 px-6">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-3xl border border-slate-100 px-8 py-14">
            <h2 className="text-3xl font-serif font-semibold text-slate-900 mb-3">No onboarding system? No problem.</h2>
            <p className="text-lg text-slate-600 mb-8">We map it, build it, and run it for you.</p>
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

export default Manifesto;
