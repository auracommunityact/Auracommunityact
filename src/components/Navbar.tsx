import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { siteConfig } from "../config";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsOpen(false);
  };

  const getNavLinks = () => {
    const baseLinks = [
      { title: "Home", href: "/" },
      { title: "Community", href: "/community" },
      { title: "About", href: "/about" },
      { title: "Contact", href: "/contact" },
    ];

    if (user) {
      const loggedInLinks = [
        { title: "Home", href: "/" },
        { title: "Community", href: "/community" },
        { title: "My Application", href: "/my-application" },
      ];
      if (isAdmin) {
        loggedInLinks.push({ title: "Admin Panel", href: "/admin" });
      }
      return loggedInLinks;
    }
    return baseLinks;
  };

  const navLinks = getNavLinks();

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
            {navLinks.map((link) => (
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
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-xs font-semibold border border-white/10 transition-all text-white"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-full text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="text-white/70 hover:text-white transition-colors" title="Profile">
                  <User className="w-5 h-5" />
                </Link>
                <Link to="/settings" className="text-white/70 hover:text-white transition-colors text-xs font-medium border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/5">
                  Settings
                </Link>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors" title="Logout">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
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
        <div className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10 absolute w-full left-0 max-h-[80vh] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
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
            
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
              {!user ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-3 py-3 rounded-md text-base font-semibold border border-white/10 text-white"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-3 py-3 rounded-md text-base font-bold bg-amber-500 text-black"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/70 hover:text-white hover:bg-white/5"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-white/5"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
