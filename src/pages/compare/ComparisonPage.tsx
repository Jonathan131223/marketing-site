import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, X } from "lucide-react";
import { appUrl } from "@/config/appUrl";

interface Feature {
  name: string;
  digistorms: string | boolean;
  competitor: string | boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

export interface ComparisonPageProps {
  slug: string;
  competitorName: string;
  competitorUrl: string;
  competitorTagline: string;
  title: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  verdict: string;
  features: Feature[];
  pricingDigistorms: string;
  pricingCompetitor: string;
  pricingNote: string;
  faqs: FAQ[];
}

function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-5 h-5 text-slate-300 mx-auto" />;
  return <span className="text-sm text-slate-700">{value}</span>;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = (props) => {
  const canonical = `https://www.digistorms.ai/compare/${props.slug}`;
  const ogImage = "https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: props.faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const softwareSchema = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "DigiStorms",
      url: "https://www.digistorms.ai",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: props.competitorName,
      url: props.competitorUrl,
      applicationCategory: "BusinessApplication",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{props.title}</title>
        <meta name="description" content={props.metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={props.title} />
        <meta property="og:description" content={props.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="DigiStorms" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={props.title} />
        <meta name="twitter:description" content={props.metaDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:site" content="@digistorms_ai" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareSchema)}</script>
      </Helmet>
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Breadcrumb */}
          <nav className="text-sm text-slate-400 mb-12">
            <Link to="/" className="hover:text-slate-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600">Compare</span>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{props.h1}</span>
          </nav>

          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">{props.h1}</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{props.subtitle}</p>
          </div>

          {/* Quick Verdict */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#1D4ED8" }}>Quick verdict</p>
            <p className="text-slate-800 text-lg leading-relaxed">{props.verdict}</p>
          </div>

          {/* Feature Comparison Table */}
          <section className="mb-16">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-6">Feature comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-500">Feature</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold" style={{ color: "#1D4ED8" }}>DigiStorms</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">{props.competitorName}</th>
                  </tr>
                </thead>
                <tbody>
                  {props.features.map((f, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-slate-50" : ""}>
                      <td className="py-3 px-4 text-sm text-slate-700 font-medium">{f.name}</td>
                      <td className="py-3 px-4 text-center"><FeatureCell value={f.digistorms} /></td>
                      <td className="py-3 px-4 text-center"><FeatureCell value={f.competitor} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-400 mt-3">Data verified as of April 2026. Pricing and features may change.</p>
          </section>

          {/* Pricing Comparison */}
          <section className="mb-16">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-6">Pricing comparison</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <p className="text-sm font-semibold uppercase tracking-widest mb-1" style={{ color: "#1D4ED8" }}>DigiStorms</p>
                <p className="text-3xl font-bold text-slate-900 mb-2">{props.pricingDigistorms}</p>
                <p className="text-sm text-slate-500">Free tier included. No credit card required.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">{props.competitorName}</p>
                <p className="text-3xl font-bold text-slate-900 mb-2">{props.pricingCompetitor}</p>
                <p className="text-sm text-slate-500">{props.pricingNote}</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-6">Frequently asked questions</h2>
            <div className="space-y-6">
              {props.faqs.map((faq, i) => (
                <div key={i} className="border-b border-slate-100 pb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-blue-50 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-3">
              Ready to automate your onboarding emails?
            </h2>
            <p className="text-slate-500 mb-6">
              DigiStorms generates your full email sequence in minutes — for free.
            </p>
            <a
              href={appUrl("/portal")}
              className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
              style={{ backgroundColor: "#1D4ED8" }}
            >
              Try DigiStorms free
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};
