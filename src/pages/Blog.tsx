import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { blogPosts } from "@/content/blog";

const EmailMockup = () => (
  <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    <rect width="320" height="200" fill="#EDE9FE" />
    <rect x="60" y="24" width="200" height="152" rx="10" fill="white" />
    <rect x="60" y="24" width="200" height="32" rx="10" fill="#7C3AED" />
    <rect x="80" y="36" width="80" height="8" rx="4" fill="white" opacity="0.9" />
    <rect x="80" y="68" width="160" height="6" rx="3" fill="#E5E7EB" />
    <rect x="80" y="82" width="140" height="6" rx="3" fill="#E5E7EB" />
    <rect x="80" y="96" width="150" height="6" rx="3" fill="#E5E7EB" />
    <rect x="80" y="110" width="120" height="6" rx="3" fill="#E5E7EB" />
    <rect x="100" y="134" width="120" height="28" rx="6" fill="#7C3AED" />
    <rect x="120" y="144" width="80" height="8" rx="4" fill="white" opacity="0.9" />
  </svg>
);

const Blog: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Blog - SaaS Email Examples, Retention &amp; Growth | DigiStorms</title>
        <meta name="description" content="Guides and real email examples for SaaS lifecycle marketing—plus retention, PLG, and onboarding strategy. Activate users, reduce churn, and grow revenue." />
        <link rel="canonical" href="https://www.digistorms.ai/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Blog - SaaS Email Examples, Retention &amp; Growth | DigiStorms" />
        <meta property="og:description" content="Guides and real email examples for SaaS lifecycle marketing—plus retention, PLG, and onboarding strategy. Activate users, reduce churn, and grow revenue." />
        <meta property="og:url" content="https://www.digistorms.ai/blog" />
        <meta property="og:image" content="https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog - SaaS Emails, Retention &amp; Growth | DigiStorms" />
        <meta name="twitter:description" content="Email examples, lifecycle guides, and retention and PLG strategy for SaaS teams." />
        <meta name="twitter:image" content="https://www.digistorms.ai/images/7e09a043-6588-42c9-bb0d-6d8f4d6da036.png" />
        <meta property="og:site_name" content="DigiStorms" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:site" content="@digistorms_ai" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "DigiStorms Blog",
          "url": "https://www.digistorms.ai/blog",
          "description": "Guides, real email examples, and best practices for SaaS lifecycle marketing, retention, and product-led growth.",
          "publisher": {
            "@type": "Organization",
            "name": "DigiStorms",
            "url": "https://www.digistorms.ai"
          }
        })}</script>
      </Helmet>
      <Navbar />
      <main className="pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">

          <div className="text-center mb-12 pb-10 border-b-2" style={{ borderColor: '#1D4ED8' }}>
            <h1 className="font-serif font-bold" style={{ color: '#1D4ED8', fontSize: '42px', margin: '10px 0px' }}>
              DigiStorms Blog
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Real email examples, lifecycle marketing guides, and ideas for retention, onboarding, and growth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...blogPosts]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((post) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="rounded-2xl overflow-hidden aspect-[4/3] mb-4 bg-[#EDE9FE]">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <EmailMockup />
                  )}
                </div>
                <h3 className="font-semibold leading-snug" style={{ color: '#1D4ED8', fontSize: '25px', margin: '20px 0px 10px' }}>
                  {post.title}
                </h3>
                <p style={{ color: '#333333', fontSize: '16px', margin: '0px 0px 20px' }}>
                  {post.shortDescription}
                </p>
              </Link>
            ))}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
