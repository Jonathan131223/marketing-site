import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, NavLink } from "react-router-dom";
import { appUrl } from "@/config/appUrl";
import { Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const loginUrl = appUrl("/portal");
  const signUpUrl = appUrl("/portal");

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <img
              src="/images/logo.webp"
              alt="DigiStorms"
              className="h-8"
              width="400"
              height="113"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/library"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-[#754BDD]" : "text-gray-700 hover:text-gray-900"}`
              }
            >
              Library
            </NavLink>
            <Link
              to="/blog"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/pricing"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button
            variant="ghost"
            className="text-sm text-gray-700 hover:text-gray-900"
            asChild
          >
            <a
              href="https://calendly.com/jonathan-digistorms/30-min-call"
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a demo
            </a>
          </Button>
          <Button
            variant="outline"
            className="text-sm text-gray-700 hover:text-gray-900 border-gray-300 bg-white"
            asChild
          >
            <a href={loginUrl}>Login</a>
          </Button>
          <Button
            className="text-sm bg-primary hover:bg-primary/90 text-white px-6"
            asChild
          >
            <a href={signUpUrl}>Sign up free</a>
          </Button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Button
            className="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-2 h-9"
            asChild
          >
            <a href={signUpUrl}>Sign up free</a>
          </Button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <NavLink
            to="/library"
            className={({ isActive }) =>
              `block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-gray-50 ${isActive ? "text-[#754BDD]" : "text-gray-700 hover:text-gray-900"}`
            }
            onClick={() => setMobileOpen(false)}
          >
            Library
          </NavLink>
          <Link
            to="/blog"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Blog
          </Link>
          <Link
            to="/pricing"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <a
            href="https://calendly.com/jonathan-digistorms/30-min-call"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Book a demo
          </a>
          <a
            href={loginUrl}
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Login
          </a>
        </div>
      )}
    </nav>
  );
};
