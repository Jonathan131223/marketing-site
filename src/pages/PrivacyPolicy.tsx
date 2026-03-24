import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy | DigiStorms</title>
        <meta name="description" content="Read the DigiStorms privacy policy. Learn how we collect, use, and protect your data." />
        <link rel="canonical" href="https://digistorms.ai/privacy" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-8">
            DigiStorms — Privacy Policy
          </h1>

          <p className="text-muted-foreground mb-8">
            Last updated: Oct 15th, 2025
          </p>

          <div className="space-y-8 text-foreground">
            <p>
              We respect your privacy. This policy explains what data we collect
              and how we use it.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Who We Are</h2>
              <p>
                Digi Storms LTD is the data controller. Registered in the UK.
                Contact: jonathan@digistorms.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                2. Data We Collect
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Account info:</strong> Name, email, password (hashed),
                  company name
                </li>
                <li>
                  <strong>Usage data:</strong> IP address, pages visited,
                  features used
                </li>
                <li>
                  <strong>Payment info:</strong> Processed securely via Stripe
                  (we don't store card numbers)
                </li>
                <li>
                  <strong>Email content:</strong> Only stored if saved/exported
                  by user
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                3. Why We Collect It
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and improve the Service</li>
                <li>To support your account and usage</li>
                <li>To contact you about your account or product updates</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
              <p className="mb-2">We use cookies for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Authentication and session management</li>
                <li>Analytics via Mixpanel</li>
                <li>Site performance</li>
              </ul>
              <p className="mt-4">
                You can manage cookie settings via your browser or the banner on
                our site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Sharing Data</h2>
              <p className="mb-4">
                We never sell your data. We share it only with trusted vendors:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Supabase (authentication + data storage)</li>
                <li>Stripe (billing)</li>
                <li>Mixpanel (product analytics)</li>
              </ul>
              <p className="mt-4">All vendors are GDPR-compliant.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                6. Your Rights (GDPR)
              </h2>
              <p className="mb-2">
                If you are in the UK or EU, you have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your data</li>
                <li>Correct or delete your data</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at jonathan@digistorms.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p>
                We keep data as long as needed to provide the service or comply
                with laws. You may request deletion at any time.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Updates</h2>
              <p>
                We may update this policy from time to time. We'll notify users
                when we do.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contact</h2>
              <p>For questions, contact: jonathan@digistorms.com</p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
