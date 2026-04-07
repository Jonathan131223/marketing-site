import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-slate-900 border-t border-slate-200">
      <div className="container mx-auto px-4 py-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <a href="https://digistorms.ai">
                <img
                  src="/images/logo.webp"
                  alt="DigiStorms"
                  className="h-8 w-auto mb-4"
                  width={120}
                  height={32}
                />
              </a>
            </div>
            <p className="text-slate-600 mb-4">
              The AI agent that moves your users from signup to paid.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com/digistorms_ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DigiStorms on X (Twitter)"
                className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/digi-storms/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="DigiStorms on LinkedIn"
                className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center justify-center min-h-[44px] min-w-[44px]"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-slate-900">
              Library
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/library"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Email Library
                </Link>
              </li>
              <li>
                <Link
                  to="/library/brands"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Browse by Brand
                </Link>
              </li>
              <li>
                <Link
                  to="/library/usecases"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Browse by Use Case
                </Link>
              </li>
              <li>
                <Link
                  to="/library/tags"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Browse by Tag
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-slate-900">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/manifesto"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Manifesto
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-slate-900">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/blog"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/lifecycle-score"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Your Onboarding Score
                </Link>
              </li>
              <li>
                <Link
                  to="/roi-calculator"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  ROI Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/email-generator"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Lifecycle Email Generator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-slate-900">
              Compare
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/compare/digistorms-vs-customer-io"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  vs Customer.io
                </Link>
              </li>
              <li>
                <Link
                  to="/compare/digistorms-vs-encharge"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  vs Encharge
                </Link>
              </li>
              <li>
                <Link
                  to="/compare/digistorms-vs-loops"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  vs Loops
                </Link>
              </li>
              <li>
                <Link
                  to="/compare/digistorms-vs-resend"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  vs Resend
                </Link>
              </li>
              <li>
                <Link
                  to="/compare/best-onboarding-email-tools"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Best Email Tools
                </Link>
              </li>
              <li>
                <Link
                  to="/compare/customer-io-alternatives"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Customer.io Alternatives
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 text-slate-900">
              Company
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center min-h-[44px]"
                >
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-8">
          <p className="text-slate-600 text-sm">
            © 2026 DigiStorms. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
