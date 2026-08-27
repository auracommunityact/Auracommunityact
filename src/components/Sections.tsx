import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { siteConfig } from "../config";
import { ArrowRight, Code, Laptop, Lightbulb, Users, Send, MapPin, Rocket, Shield, Globe } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-24 lg:py-36 overflow-hidden max-w-7xl mx-auto w-full flex items-center min-h-[90vh]">
      <div className="absolute inset-0 grid grid-cols-[1fr_1fr] pointer-events-none opacity-20">
        <div className="bg-gradient-to-br from-purple-500/30 to-transparent blur-3xl"></div>
        <div className="bg-gradient-to-bl from-pink-500/30 to-transparent blur-3xl translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 w-full flex flex-col items-center text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full scale-150"></div>
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-black border border-amber-500/50 rounded-2xl relative z-10 shadow-2xl shadow-amber-900/50 flex items-center justify-center p-2">
            <img 
              src={siteConfig.logo} 
              alt="Aura Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-widest"
        >
          {siteConfig.badges.map((badge, idx) => (
            <span key={badge} className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
              {badge}
            </span>
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/60 max-w-4xl"
        >
          Building Ideas. <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-amber-400">
            Creating Technology.
          </span> <br className="hidden sm:block" />
          Growing Community.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-lg sm:text-xl text-white/60 max-w-2xl leading-relaxed"
        >
          Aura Community ACT is a technology and community initiative focused on creating useful digital experiences, innovative projects, educational opportunities and a connected digital community.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            to="/community"
            className="group flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform"
          >
            Explore Aura Community <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/about"
            className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
          >
            Learn About Us
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function AboutSection() {
  const areas = [
    { name: "Technology", icon: Laptop },
    { name: "Digital Products", icon: Rocket },
    { name: "Education", icon: Lightbulb },
    { name: "Creative Projects", icon: Code },
    { name: "Community Initiatives", icon: Users },
    { name: "Software Apps", icon: Shield },
    { name: "Digital Innovation", icon: Globe },
    { name: "Collaboration", icon: Users },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">About Aura Community ACT</h2>
          <p className="text-lg text-white/60 leading-relaxed mb-6">
            Aura Community ACT is a community-focused technology initiative created to bring together ideas, creativity, technology and people. The goal is to build meaningful digital projects and create a space where technology and community can grow together.
          </p>
          <p className="text-white/60 mb-8">
            Aura Community ACT works across various domains to drive positive change and innovation:
          </p>
          <div className="grid grid-cols-2 gap-4">
            {areas.map((area, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group">
                <area.icon className="w-5 h-5 text-purple-400 group-hover:text-amber-500 transition-colors" />
                <span className="text-sm font-medium text-white/70">{area.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden aspect-square lg:aspect-[4/3] bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-500/20 mix-blend-overlay z-20 pointer-events-none"></div>
          <img src="https://qxoqflrqpwlythgqmjtq.supabase.co/storage/v1/object/public/app-icons/IMG_20260827_111033.jpg" alt="Aura Community ACT" className="w-full h-full object-cover relative z-10" />
        </motion.div>
      </div>
    </section>
  );
}

export function MissionSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Our Mission</h2>
        <p className="text-lg text-white/60 leading-relaxed">
          Our mission is to transform ideas into useful digital experiences while building a positive and creative community around technology.
        </p>
      </div>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {siteConfig.mission.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-amber-500/30 hover:bg-white/5 transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600/30 to-orange-600/30 flex items-center justify-center mb-6 shadow-lg border border-white/5 group-hover:border-amber-500/30 transition-colors">
              <span className="text-xl font-bold text-white">0{idx + 1}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function VisionSection() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-[#050505]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-[#050505]"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="p-12 sm:p-16 rounded-3xl bg-gradient-to-br from-purple-600/20 to-magenta-600/20 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4">Our Vision</h2>
          <p className="text-xl sm:text-3xl text-white/80 leading-relaxed font-medium italic">
            "To build a future where technology, creativity and community come together to create meaningful opportunities and digital experiences."
          </p>
          <div className="flex gap-1 mt-8">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
            <span className="w-2 h-2 rounded-full bg-white/20"></span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function ProjectsSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-16">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Projects</h2>
          <p className="text-white/60">Discover what we are building at Aura Community ACT.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {siteConfig.projects.map((project, idx) => (
          <motion.div
            key={project.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex flex-col h-full p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-amber-500/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden ${(project as any).logo ? 'bg-black border border-white/10' : 'bg-gradient-to-br from-purple-600 to-blue-600 p-2'}`}>
                <img src={(project as any).logo || siteConfig.logo} alt={`${project.name} Logo`} className={`w-full h-full ${(project as any).logo ? 'object-cover' : 'object-contain'}`} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                project.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                project.status === 'Coming Soon' ? 'bg-purple-500/20 text-purple-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {project.status === 'In Development' ? 'Dev' : project.status}
              </span>
            </div>
            
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">{project.category}</span>
            <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
            <p className="text-sm text-white/50 leading-relaxed flex-1 mb-6">{project.description}</p>
            
            {(project as any).link ? (
              <a href={(project as any).link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold text-white/70 group-hover:text-amber-500 transition-colors mt-auto w-fit">
                Visit Project <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            ) : (
              <button className="flex items-center gap-2 text-xs font-semibold text-white/70 group-hover:text-amber-500 transition-colors mt-auto w-fit">
                Visit Project <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">What We Do</h2>
        <p className="text-lg text-white/60 leading-relaxed">
          Exploring the intersections of technology, creativity, and education to deliver meaningful value.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {siteConfig.services.map((service, idx) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-8 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10"
          >
            <h3 className="text-lg font-bold text-white mb-3">{service.title}</h3>
            <p className="text-sm text-white/60 leading-relaxed">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function FounderSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="p-8 sm:p-12 lg:p-16 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10 grid lg:grid-cols-[1fr_2fr] gap-12 items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-amber-500 p-2 mb-6">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img 
                  src={siteConfig.founderPhoto} 
                  alt="Shaan Mohammad" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white">Shaan Mohammad</h3>
            <p className="text-[10px] text-amber-500 uppercase font-bold mt-1 tracking-widest mb-1">Founder — Aura Community ACT</p>
            <p className="text-white/40 text-xs">Age: 15 years</p>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Meet the Founder</h2>
            <div className="space-y-6 text-lg text-white/70 leading-relaxed">
              <p>
                Shaan Mohammad is the founder of Aura Community ACT, a technology and community initiative focused on building digital projects and exploring new ideas across technology, education, creativity and online communities.
              </p>
              <p>
                Driven by a passion for creating useful digital experiences, Shaan established this community to bring people together, foster learning, and transform innovative concepts into practical digital realities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CommunitySection() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-purple-950/20 to-[#050505] border-y border-white/10"></div>
      
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="w-20 h-20 mx-auto bg-black border border-amber-500/50 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-amber-900/20">
            <Users className="w-10 h-10 text-amber-500" />
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">Join the Aura Community</h2>
          <p className="text-lg sm:text-xl text-white/60 leading-relaxed mb-10">
            Be part of a growing community built around technology, creativity, learning and new ideas. Together we can build the future.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/community" className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-full font-bold shadow-lg shadow-amber-500/20 transition-all">
              Join Community
            </Link>
            <Link to="/contact" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function LocationSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Our Location</h2>
        <p className="text-lg text-white/60 leading-relaxed">
          Based in India, reaching the world through digital connectivity.
        </p>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
          <MapPin className="w-8 h-8 text-amber-500" />
        </div>
        <p className="text-lg sm:text-xl text-white/80 max-w-2xl font-medium mb-8">
          {siteConfig.address}
        </p>
        <a 
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.googleMapsQuery)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          <MapPin className="w-4 h-4" /> View on Google Maps
        </a>
      </div>
    </section>
  );
}
