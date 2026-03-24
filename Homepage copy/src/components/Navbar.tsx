import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignupModal } from "./lifecycle/SignupModal";
import { setAuthIntent } from "@/utils/authIntent";
import mixpanel from "mixpanel-browser";
import { Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupMode, setSignupMode] = useState<"login" | "signup">("login");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignupSuccess = () => {
    setShowSignupModal(false);
  };

  const handleGoogleAuthInitiated = () => {
    console.log("🔄 Navbar: Google OAuth initiated, closing modal");
    setShowSignupModal(false);
  };

  const handleLoginClick = () => {
    setMobileOpen(false);
    if (user) {
      navigate("/portal");
    } else {
      try {
        const raw = localStorage.getItem("emailGenerationState");
        const step = raw ? JSON.parse(raw).currentStep : null;
        if (step === "gallery" || step === "editor") {
          setAuthIntent({
            action: "resumeOnly",
            targetRoute: "/portal/generate",
            source: step,
            timestamp: Date.now(),
          });
        }
      } catch {}
      setSignupMode("login");
      setShowSignupModal(true);
    }
  };

  const handleSignupClick = () => {
    setMobileOpen(false);
    if (user) {
      navigate("/portal");
    } else {
      try {
        const raw = localStorage.getItem("emailGenerationState");
        const step = raw ? JSON.parse(raw).currentStep : null;
        if (step === "gallery" || step === "editor") {
          setAuthIntent({
            action: "resumeOnly",
            targetRoute: "/portal/generate",
            source: step,
            timestamp: Date.now(),
          });
        }
      } catch {}
      setSignupMode("signup");
      setShowSignupModal(true);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + desktop nav links */}
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
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Library
              </a>
              <a
                href="https://library.digistorms.ai/blog"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Blog
              </a>
              <Link
                to="/pricing"
                className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Desktop right-side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!user && (
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
            )}
            {!user && (
              <Button
                variant="outline"
                className="text-sm text-gray-700 hover:text-gray-900 border-gray-300 bg-white"
                onClick={handleLoginClick}
              >
                Login
              </Button>
            )}
            <Button
              className="text-sm bg-primary hover:bg-primary/90 text-white px-6"
              onClick={handleSignupClick}
            >
              {user ? "Dashboard" : "Sign up free"}
            </Button>
          </div>

          {/* Mobile: sign up + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              className="text-sm bg-primary hover:bg-primary/90 text-white px-4 py-2 h-9"
              onClick={handleSignupClick}
            >
              {user ? "Dashboard" : "Sign up free"}
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

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
            <a
              href="https://library.digistorms.ai/"
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Library
            </a>
            <a
              href="https://library.digistorms.ai/blog"
              className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </a>
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
            {!user && (
              <button
                onClick={handleLoginClick}
                className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Login
              </button>
            )}
          </div>
        )}
      </nav>

      {showSignupModal && (
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSignup={handleSignupSuccess}
          initialMode={signupMode}
          onGoogleAuthInitiated={handleGoogleAuthInitiated}
        />
      )}
    </>
  );
};
