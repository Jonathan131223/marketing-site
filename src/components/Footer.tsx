import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-gray-900 border-t border-gray-200">
      <div className="container mx-auto px-4 py-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <a href="https://digistorms.ai">
                <img
                  src="/images/b264ff90-d48c-4ee1-8397-adaeb0142ce4.png"
                  alt="DigiStorms"
                  className="h-8 mb-4"
                />
              </a>
            </div>
            <p className="text-gray-600 mb-4">
              AI-generated lifecycle emails
              <br />
              for SaaS, built on what top
              <br />
              brands actually send.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com/digistorms_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/digi-storms/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/manifesto"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Manifesto
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/blog"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/lifecycle-score"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Your Lifecycle Score
                </Link>
              </li>
              <li>
                <Link
                  to="/roi-calculator"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ROI Calculator
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-gray-900">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Terms of service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8">
          <p className="text-gray-600 text-sm">
            © 2026 DigiStorms. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
