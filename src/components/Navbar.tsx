import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { siteConfig } from "../config";
import { cn } from "../lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black border border-amber-500/50 rounded flex items-center justify-center">
                <img src={siteConfig.logo} alt="Aura Community ACT" className="w-6 h-6 object-contain" />
              </div>
              <span className="font-bold tracking-tight text-lg text-white hidden sm:block">
                Aura Community <span className="text-amber-500 italic">ACT</span>
              </span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.title}
                to={link.href}
                className={cn(
                  "transition-colors hover:text-white",
                  location.pathname === link.href ? "text-white border-b-2 border-amber-500 pb-1" : "text-white/70"
                )}
              >
                {link.title}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              to="/contact" 
              className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-xs font-semibold border border-white/10 transition-all text-white"
            >
              Contact Us
            </Link>
            <Link 
              to="/community" 
              className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-full text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all"
            >
              Join Community
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/70 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10 absolute w-full left-0">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {siteConfig.navLinks.map((link) => (
              <Link
                key={link.title}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  location.pathname === link.href 
                    ? "bg-white/10 text-white border-l-2 border-amber-500" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                {link.title}
              </Link>
            ))}
            <Link
              to="/community"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-4 px-3 py-3 rounded-md text-base font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20"
            >
              Join Community
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
