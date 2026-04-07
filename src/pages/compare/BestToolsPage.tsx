import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { appUrl } from "@/config/appUrl";

interface Tool {
  name: string;
  url: string;
  description: string;
  bestFor: string;
  pricing: string;
  pros: string[];
  cons: string[];
  isDigistorms?: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

export interface BestToolsPageProps {
  slug: string;
  title: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  intro: string;
  tools: Tool[];
  faqs: FAQ[];
}

export const BestToolsPage: React.FC<BestToolsPageProps> = (props) => {
  const canonical = `https://www.digistorms.ai/compare/${props.slug}`;
  const ogImage = "https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png";

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: props.h1,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: props.tools.length,
    itemListElement: props.tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.name,
      url: tool.url,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: props.faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

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
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <Navbar />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">

          <nav className="text-sm text-slate-400 mb-12">
            <Link to="/" className="hover:text-slate-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-600">Compare</span>
            <span className="mx-2">/</span>
            <span className="text-slate-900">{props.h1}</span>
          </nav>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-serif font-semibold text-slate-900 mb-4">{props.h1}</h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{props.subtitle}</p>
          </div>

          <p className="text-slate-600 leading-relaxed mb-12 text-lg">{props.intro}</p>

          {/* Tool Cards */}
          <div className="space-y-8 mb-16">
            {props.tools.map((tool, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${tool.isDigistorms ? "bg-blue-50 border-2 border-blue-200" : "bg-slate-50 border border-slate-200"}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-bold text-slate-400 mb-1 block">#{i + 1}</span>
                    <h2 className="text-xl font-semibold text-slate-900">{tool.name}</h2>
                    {tool.isDigistorms && (
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: "#1D4ED8", color: "white" }}>Our pick</span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-500 bg-white px-3 py-1 rounded-lg border border-slate-200">{tool.pricing}</span>
                </div>
                <p className="text-slate-600 mb-4">{tool.description}</p>
                <p className="text-sm text-slate-500 mb-4"><strong>Best for:</strong> {tool.bestFor}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-600 mb-2">Pros</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {tool.pros.map((p, j) => <li key={j}>+ {p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-500 mb-2">Cons</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {tool.cons.map((c, j) => <li key={j}>- {c}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
            <h2 className="text-2xl font-serif font-semibold text-slate-900 mb-3">Ready to automate your onboarding emails?</h2>
            <p className="text-slate-500 mb-6">DigiStorms generates your full email sequence in minutes — for free.</p>
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
