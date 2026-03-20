import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { appUrl } from "@/config/appUrl";
import { Menu, X, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const signUpUrl = appUrl("/portal");
  const loginUrl = appUrl("/portal");

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <img
              src="/lovable-uploads/b264ff90-d48c-4ee1-8397-adaeb0142ce4.png"
              alt="DigiStorms"
              className="h-8"
            />
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="https://library.digistorms.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center gap-1"
            >
              Library <Sparkles className="w-3 h-3 text-purple-400 opacity-70" />
            </a>
            <a
              href="https://library.digistorms.ai/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors flex items-center gap-1"
            >
              Blog <Sparkles className="w-3 h-3 text-purple-400 opacity-70" />
            </a>
            <Link
              to="/pricing"
              className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Pricing
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" className="text-sm text-gray-700 hover:text-gray-900" asChild>
            <a href="https://calendly.com/jonathan-digistorms/30-min-call" target="_blank" rel="noopener noreferrer">
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
          <Button className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-6" asChild>
            <a href={signUpUrl}>Sign up free</a>
          </Button>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <Button className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 h-9" asChild>
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
          <a
            href="https://library.digistorms.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center gap-1"
            onClick={() => setMobileOpen(false)}
          >
            Library <Sparkles className="w-3 h-3 text-purple-400 opacity-70" />
          </a>
          <a
            href="https://library.digistorms.ai/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg flex items-center gap-1"
            onClick={() => setMobileOpen(false)}
          >
            Blog <Sparkles className="w-3 h-3 text-purple-400 opacity-70" />
          </a>
          <Link
            to="/pricing"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            onClick={() => setMobileOpen(false)}
          >
            Pricing
          </Link>
          <a
            href="https://calendly.com/jonathan-digistorms/30-min-call"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            onClick={() => setMobileOpen(false)}
          >
            Book a demo
          </a>
          <a
            href={loginUrl}
            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
            onClick={() => setMobileOpen(false)}
          >
            Login
          </a>
        </div>
      )}
    </nav>
  );
};
