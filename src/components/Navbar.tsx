import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { appUrl } from "@/config/appUrl";
import { Menu, X, Search } from "lucide-react";
import { SearchOverlay } from "@/components/library/SearchOverlay";

interface NavLinkProps {
  href: string;
  pathname: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const NavLinkItem: React.FC<NavLinkProps> = ({ href, pathname, children, className, onClick }) => {
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <a
      href={href}
      className={className || `text-sm font-medium transition-colors min-h-[44px] px-3 flex items-center rounded-lg hover:bg-slate-50 ${isActive ? "text-[#1D4ED8]" : "text-slate-700 hover:text-slate-900"}`}
      onClick={onClick}
    >
      {children}
    </a>
  );
};

interface NavbarProps {
  pathname?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ pathname: initialPathname }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [currentPathname, setCurrentPathname] = useState(initialPathname || "/");

  useEffect(() => {
    setCurrentPathname(window.location.pathname);
  }, []);

  // Show the search bar only on library pages.
  // On the library homepage specifically, hide it until the user has scrolled
  // past the hero section (which already has its own search bar).
  useEffect(() => {
    const isLibraryPage = currentPathname.startsWith("/library");
    const isLibraryHome = currentPathname === "/library";

    if (!isLibraryPage) {
      setShowSearch(false);
      return;
    }

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
  }, [currentPathname]);

  const loginUrl = appUrl("/portal");
  const signUpUrl = appUrl("/portal");

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">

          {/* Left: logo + nav links */}
          <div className="flex items-center gap-6 flex-shrink-0">
            <a href="/" className="flex items-center">
              <img
                src="/images/logo.webp"
                alt="DigiStorms"
                className="h-8 w-auto"
                width={120}
                height={32}
              />
            </a>

            <div className="hidden md:flex items-center gap-1">
              <NavLinkItem href="/library" pathname={currentPathname}>Library</NavLinkItem>
              <NavLinkItem href="/blog" pathname={currentPathname}>Blog</NavLinkItem>
              <NavLinkItem href="/pricing" pathname={currentPathname}>Pricing</NavLinkItem>
            </div>
          </div>

          {/* Center: search bar (library pages only) — spacer always present to push CTAs right */}
          <div className="hidden md:flex flex-1 justify-center">
            {currentPathname.startsWith("/library") && (
              <button
                onClick={() => setSearchOpen(true)}
                className={`flex items-center gap-2 w-full max-w-xs px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400 hover:border-[#1D4ED8] hover:bg-white transition-all text-left ${
                  showSearch ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
              >
                <Search className="h-4 w-4 flex-shrink-0" />
                <span>Search brands or keywords…</span>
              </button>
            )}
          </div>

          {/* Right: CTAs */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              className="text-sm text-slate-700 hover:text-slate-900"
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
              className="text-sm text-slate-700 hover:text-slate-900 border-slate-300 bg-white"
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
                className="p-2 rounded-md text-slate-600 hover:text-[#1D4ED8] hover:bg-slate-100 transition-colors"
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
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
            <NavLinkItem
              href="/library"
              pathname={currentPathname}
              className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-slate-50 ${currentPathname.startsWith("/library") ? "text-[#1D4ED8]" : "text-slate-700 hover:text-slate-900"}`}
              onClick={() => setMobileOpen(false)}
            >
              Library
            </NavLinkItem>
            <NavLinkItem
              href="/blog"
              pathname={currentPathname}
              className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-slate-50 ${currentPathname.startsWith("/blog") ? "text-[#1D4ED8]" : "text-slate-700 hover:text-slate-900"}`}
              onClick={() => setMobileOpen(false)}
            >
              Blog
            </NavLinkItem>
            <NavLinkItem
              href="/pricing"
              pathname={currentPathname}
              className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-slate-50 ${currentPathname === "/pricing" ? "text-[#1D4ED8]" : "text-slate-700 hover:text-slate-900"}`}
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </NavLinkItem>
            <a
              href="https://calendly.com/jonathan-digistorms/30-min-call"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Book a demo
            </a>
            <a
              href={loginUrl}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
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
            window.location.href = `/library?q=${encodeURIComponent(q)}`;
            setSearchOpen(false);
          }}
          onNavigate={() => setSearchOpen(false)}
        />
      )}
    </>
  );
};
