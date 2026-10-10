import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight, Sparkles, User } from "lucide-react";
import { siteConfig } from "../config";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsOpen(false);
  };

  const getNavLinks = () => {
    const baseLinks = [
      { title: "Home", href: "/" },
      { title: "Explore", href: "/projects" },
      { title: "Aura Music Studio", href: "/music" },
      { title: "Community", href: "/community" },
      { title: "About", href: "/about" },
    ];

    if (user) {
      const loggedInLinks = [
        { title: "Home", href: "/" },
        { title: "Explore", href: "/projects" },
        { title: "Aura Music Studio", href: "/music" },
        { title: "Community", href: "/community" },
      ];
      
      if (profile?.status === 'member') {
        loggedInLinks.push({ title: "Members Area", href: "/members" });
      } else {
        loggedInLinks.push({ title: "My Application", href: "/my-application" });
      }

      if (isAdmin) {
        loggedInLinks.push({ title: "Admin Panel", href: "/admin" });
      }
      return loggedInLinks;
    }
    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <header 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-[#050505]/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80" 
          : "bg-[#050505]/60 backdrop-blur-md border-b border-white/5"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with restrained Cyan-to-Magenta gradient accent */}
          <Link 
            to="/" 
            className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F3FF] rounded-lg p-1"
          >
            <div className="relative w-9 h-9 rounded-xl bg-black border border-white/15 flex items-center justify-center p-1.5 transition-all duration-300 group-hover:border-[#00F3FF]/60 group-hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]">
              <img 
                src={siteConfig.logo} 
                alt="Aura Community Act Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,243,255,0.4)]" 
              />
            </div>
            
            <div className="flex flex-col">
              <span className="font-syncopate font-bold tracking-tight text-base sm:text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-[#00F3FF] group-hover:to-[#FF00C1] transition-all duration-300">
                Aura Community <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00F3FF] to-[#FF00C1]">ACT</span>
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-mono -mt-1 hidden sm:block">
                Interactive 3D Core
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation Links with animated cyan underline & active state */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href || (link.href !== '/' && location.pathname.startsWith(link.href));
              return (
                <Link
                  key={link.title}
                  to={link.href}
                  className={cn(
                    "relative py-1.5 transition-colors duration-200 group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00F3FF] rounded text-sm",
                    isActive ? "text-white font-semibold" : "text-white/70 hover:text-white"
                  )}
                >
                  <span>{link.title}</span>
                  {/* Neon underline on hover / active */}
                  <span 
                    className={cn(
                      "absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#00F3FF] to-[#FF00C1] transition-all duration-300 rounded-full",
                      isActive ? "w-full shadow-[0_0_8px_#00F3FF]" : "w-0 group-hover:w-full group-hover:shadow-[0_0_8px_#00F3FF]"
                    )} 
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs and User Area */}
          <div className="hidden lg:flex items-center gap-4">
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-xs font-semibold text-white/80 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                  Log In
                </Link>

                {/* Prominent "Explore Aura" CTA */}
                <Link 
                  to="/projects" 
                  className="relative group overflow-hidden px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F3FF] via-[#00F3FF] to-[#00c8d4] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.7)] flex items-center gap-2"
                >
                  <span>Explore Aura</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to={profile?.status === 'member' ? '/members' : '/my-application'}
                  className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:border-[#00F3FF]/40"
                >
                  <User className="w-3.5 h-3.5 text-[#00F3FF]" />
                  <span>{profile?.full_name || user.email?.split('@')[0]}</span>
                </Link>

                <Link 
                  to="/projects" 
                  className="relative group px-4 py-2 rounded-xl bg-[#00F3FF] text-black font-extrabold text-xs tracking-wider transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,243,255,0.3)] flex items-center gap-1.5"
                >
                  <span>Explore Aura</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-xs text-white/50 hover:text-red-400 px-3 py-2 transition-colors rounded-lg hover:bg-white/5"
                  title="Sign Out"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <Link 
              to="/projects" 
              className="px-3 py-1.5 rounded-lg bg-[#00F3FF] text-black font-bold text-xs uppercase tracking-wider"
            >
              Explore
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:text-[#00F3FF] hover:border-[#00F3FF]/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00F3FF]"
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <div className="lg:hidden fixed inset-x-0 top-20 bg-[#050505]/95 backdrop-blur-2xl border-b border-white/10 px-6 py-8 shadow-2xl transition-all animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#00F3FF] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Navigation Directory
            </div>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.title}
                  to={link.href}
                  className={cn(
                    "text-lg font-medium transition-colors py-2 px-3 rounded-xl flex items-center justify-between",
                    isActive 
                      ? "text-[#00F3FF] bg-[#00F3FF]/10 font-bold border border-[#00F3FF]/30" 
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>{link.title}</span>
                  <ArrowRight className="w-4 h-4 opacity-50" />
                </Link>
              );
            })}

            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
              {!user ? (
                <>
                  <Link
                    to="/signup"
                    className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-[#00F3FF] to-[#FF00C1] text-black font-extrabold text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                  >
                    Join Aura Community
                  </Link>
                  <Link
                    to="/login"
                    className="w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    Member Log In
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to={profile?.status === 'member' ? '/members' : '/my-application'}
                    className="w-full text-center py-3 rounded-xl bg-[#00F3FF] text-black font-bold text-sm"
                  >
                    Go to {profile?.status === 'member' ? 'Members Area' : 'Application Status'}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2.5 rounded-xl bg-white/5 text-red-400 font-semibold text-sm hover:bg-white/10"
                  >
                    Log Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
