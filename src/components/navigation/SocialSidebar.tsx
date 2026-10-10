import React from 'react';
import { siteConfig } from '../../config';
import { Github, Twitter, Linkedin, MessageSquare, Send } from 'lucide-react';

export default function SocialSidebar() {
  // Use verified project social links from config
  const links = [
    { name: 'GitHub', href: 'https://github.com/auracommunityact/Auracommunityact', icon: Github, color: 'hover:text-[#00F3FF]' },
    { name: 'Discord', href: 'https://discord.gg/djMEkqa2m5', icon: MessageSquare, color: 'hover:text-[#FF00C1]' },
    { name: 'Community', href: 'mailto:auracommunityact@googlegroups.com', icon: Send, color: 'hover:text-[#94FF00]' },
  ];

  return (
    <aside 
      className="hidden xl:flex fixed left-6 bottom-12 z-40 flex-col items-center gap-6"
      aria-label="Official Social Links"
    >
      <div className="flex flex-col items-center gap-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-white/50 transition-all duration-300 p-2 rounded-lg hover:scale-115 hover:bg-white/5 ${link.color}`}
              aria-label={`Official ${link.name}`}
              title={link.name}
            >
              <Icon className="w-4 h-4" />
            </a>
          );
        })}
      </div>

      {/* Decorative vertical neon rule */}
      <div className="w-[1px] h-20 bg-gradient-to-b from-white/20 via-[#00F3FF]/40 to-transparent" />

      <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-white/30 [writing-mode:vertical-lr] rotate-180">
        Aura Connect
      </span>
    </aside>
  );
}
