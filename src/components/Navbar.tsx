import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { appUrl } from "@/config/appUrl";
import { Menu, X, Search } from "lucide-react";
import { SearchOverlay } from "@/components/library/SearchOverlay";

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // On the Library homepage, hide the navbar search bar until the user
  // has scrolled past the hero section (which already has its own search bar).
  useEffect(() => {
    const isLibraryHome = location.pathname === "/library";

    if (!isLibraryHome) {
      setShowSearch(true);
      return;
    }

    // Initially hide; reveal once scrolled ~70% past the viewport height
    const threshold = window.innerHeight * 0.7;
    setShowSearch(window.scrollY > threshold);

    const handleScroll = () => setShowSearch(window.scrollY > threshold);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const loginUrl = appUrl("/portal");
  const signUpUrl = appUrl("/portal");

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">

          {/* Left: logo + nav links */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src="/images/b264ff90-d48c-4ee1-8397-adaeb0142ce4.png"
                alt="DigiStorms"
                className="h-8 w-auto"
              />
            </Link>

            <div className="hidden md:flex items-center gap-5">
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

          {/* Center: search bar — hidden on Library hero, shown after scroll */}
          <div className="hidden md:flex flex-1 justify-center">
            <button
              onClick={() => setSearchOpen(true)}
              className={`flex items-center gap-2 w-full max-w-xs px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-400 hover:border-[#754BDD] hover:bg-white transition-all text-left ${
                showSearch ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
            >
              <Search className="h-4 w-4 flex-shrink-0" />
              <span>Search brands or keywords…</span>
            </button>
          </div>

          {/* Right: CTAs */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
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

          {/* Mobile: search icon + sign up + hamburger */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            {showSearch && (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-[#754BDD] hover:bg-gray-100 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
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

      {/* Global search overlay — rendered outside nav so z-index stacks properly */}
      {searchOpen && (
        <SearchOverlay
          onClose={() => setSearchOpen(false)}
          onSearch={(q) => {
            navigate(`/library?q=${encodeURIComponent(q)}`);
            setSearchOpen(false);
          }}
          onNavigate={() => setSearchOpen(false)}
        />
      )}
    </>
  );
};
