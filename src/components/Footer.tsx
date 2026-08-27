import { Link } from "react-router-dom";
import { siteConfig } from "../config";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 backdrop-blur-md bg-black/40 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-black border border-amber-500/50 rounded-lg flex items-center justify-center p-1">
                <img src={siteConfig.logo} alt="Aura Community ACT" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold tracking-tight text-lg text-white">
                Aura Community <span className="text-amber-500 italic">ACT</span>
              </span>
            </Link>
            <p className="text-white/60 text-sm mb-6">
              {siteConfig.badges.join(" • ")}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              {siteConfig.navLinks.slice(0, 4).map((link) => (
                <li key={link.title}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-amber-500 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Connect
            </h3>
            <ul className="space-y-3">
              {siteConfig.navLinks.slice(4).map((link) => (
                <li key={link.title}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-amber-500 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-white/60 hover:text-amber-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-white/60 hover:text-amber-500 transition-colors">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-semibold">
            © {siteConfig.year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
