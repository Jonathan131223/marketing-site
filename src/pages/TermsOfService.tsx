import React from 'react';
import { Helmet } from "react-helmet-async";
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service | DigiStorms</title>
        <meta name="description" content="Read the DigiStorms terms of service. Understand your rights and responsibilities when using our AI lifecycle email generation platform." />
        <link rel="canonical" href="https://digistorms.ai/terms" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            DigiStorms — Terms of Service (ToS)
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Last updated: July 29th, 2025
          </p>

          <div className="space-y-8 text-foreground">
            <p>
              Welcome to DigiStorms! These Terms of Service ("Terms") govern your access and use of our platform and services, including our email generator, template editor, and lifecycle messaging tools (the "Service"). By accessing or using DigiStorms, you agree to be bound by these Terms.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Who We Are</h2>
              <p>
                DigiStorms is operated by Digi Storms LTD, a private limited company incorporated in the United Kingdom. Registered address: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ, UNITED KINGDOM. Contact: jonathan@digistorms.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Use of Service</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may use DigiStorms only for lawful purposes and in accordance with these Terms. You must be 18 years or older to use the Service.</li>
                <li>You are responsible for maintaining the confidentiality of your account.</li>
                <li>You agree not to misuse the platform, engage in scraping, reverse engineering, or distribute spam.</li>
                <li>We reserve the right to suspend or terminate your account for violations of these Terms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Plans and Billing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>DigiStorms offers a free plan with usage limits and paid plans with additional credits and features.</li>
                <li>Pricing, credit limits, and plan details are described on our website and may change with notice.</li>
                <li>Refunds are at our discretion.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. AI-Generated Content and Liability</h2>
              <p className="mb-4">
                Our platform generates email content using AI. We do not guarantee the accuracy, legality, or performance of generated emails. You are responsible for reviewing and validating content before use.
              </p>
              <p className="mb-2">We are not liable for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Losses from using exported content.</li>
                <li>Failures or delays in 3rd-party integrations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              <p>
                All content, code, and designs are the property of DigiStorms or its licensors. You may not copy, modify, or distribute our IP without permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Email Library Content</h2>
              <p className="mb-4">
                The DigiStorms Email Library curates publicly available marketing emails from B2B SaaS brands strictly for educational and analytical purposes. We do not claim ownership of these emails. All logos, trademarks, and branding remain the property of their respective owners.
              </p>
              <p>
                If you are the owner of content included in the Library and wish to request removal, please contact us at jonathan@digistorms.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Termination</h2>
              <p>
                We may suspend or terminate your account at any time for any reason, including violation of these Terms. You may stop using DigiStorms at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>These Terms are governed by the laws of England and Wales.</li>
                <li>Any dispute shall be resolved exclusively in the courts of London, UK.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
              <p>
                If you have questions about these Terms, email us at: jonathan@digistorms.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;