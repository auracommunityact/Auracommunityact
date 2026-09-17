import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Cpu, Smartphone, LayoutDashboard, Monitor, ChevronRight, X, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, ProjectGallery, ProjectUpdate, ProjectPerformance } from "../lib/supabase";

export default function MissionGTAMobile() {
  const [gallery, setGallery] = useState<ProjectGallery[]>([]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [performance, setPerformance] = useState<ProjectPerformance | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Mission GTA Mobile | Aura Community Act";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: galleryData } = await supabase
        .from('project_galleries')
        .select('*')
        .eq('project_id', 'mission-gta-mobile')
        .order('created_at', { ascending: false });
        
      if (galleryData) setGallery(galleryData);

      const { data: updatesData } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', 'mission-gta-mobile')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
        
      if (updatesData) setUpdates(updatesData);

      const { data: perfData } = await supabase
        .from('project_performance')
        .select('*')
        .eq('project_id', 'mission-gta-mobile')
        .single();
        
      if (perfData) setPerformance(perfData);

    } catch (err) {
      console.error("Failed to fetch project data", err);
    }
  };

  return (
    <div className="flex-1 w-full bg-[#050505] text-gray-200 selection:bg-green-500/30 relative">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#111_0%,#000_100%)]"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.03)_0%,transparent_50%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.02)_0%,transparent_50%)]"></div>
      </div>

      {/* Back Navigation */}
      <div className="relative z-10 pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <Link 
          to="/projects" 
          className="inline-flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold tracking-widest uppercase mb-6">
            Experimental / Development
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter text-white mb-6 leading-[1.1] drop-shadow-2xl">
            Mission GTA <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Mobile</span>
          </h1>
          <p className="text-lg sm:text-2xl text-gray-400 font-medium leading-relaxed mb-10 max-w-3xl">
            Exploring the challenge of bringing a large-scale open-world gaming experience to Android hardware.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold uppercase tracking-wider rounded-md transition-colors"
            >
              View Project Details
            </button>
            <button 
              onClick={() => document.getElementById('updates')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider rounded-md border border-white/10 transition-colors"
            >
              Project Updates
            </button>
          </div>
        </motion.div>
      </section>

      {/* Main Details Section */}
      <section id="details" className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full border-t border-white/5">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Left Content */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="prose prose-invert prose-lg max-w-none"
            >
              <h2 className="text-2xl font-bold uppercase tracking-wide text-white border-l-4 border-green-500 pl-4 mb-6">About the Project</h2>
              <p className="text-gray-400 leading-relaxed">
                Mission GTA Mobile is an experimental mobile-porting project focused on exploring how a large PC/console game experience could be adapted for compatible Android hardware.
              </p>
              <p className="text-gray-400 leading-relaxed">
                The project currently focuses on Snapdragon-powered devices, with an initial working port/build developed for higher-performance compatible devices. The goal is to explore mobile optimization, performance, controls, graphics scaling, asset management, and device compatibility.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold uppercase tracking-wide text-white border-l-4 border-green-500 pl-4 mb-6">Project Goals</h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {[
                  "Mobile performance optimization",
                  "Snapdragon device compatibility",
                  "Touch and mobile control systems",
                  "Graphics and resolution scaling",
                  "Memory and storage optimization",
                  "Improved stability across supported hardware"
                ].map((goal, i) => (
                  <li key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/5">
                    <ChevronRight className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm font-medium">{goal}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Development Showcase Timeline */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold uppercase tracking-wide text-white border-l-4 border-green-500 pl-4 mb-8">Development Mission</h2>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {[
                  { phase: "01", title: "Research & Compatibility", active: true },
                  { phase: "02", title: "Initial Port / Build", active: true },
                  { phase: "03", title: "Performance Optimization", active: true },
                  { phase: "04", title: "Controls & UX", active: false },
                  { phase: "05", title: "Device Testing", active: false },
                  { phase: "06", title: "Future Improvements", active: false }
                ].map((step, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#050505] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg ${step.active ? 'bg-green-500' : 'bg-gray-800'}`}>
                      <span className="text-[10px] font-bold text-black">{step.phase}</span>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                      <h3 className={`font-bold uppercase tracking-wide text-sm ${step.active ? 'text-white' : 'text-gray-500'}`}>Phase {step.phase}</h3>
                      <p className={`text-sm mt-1 ${step.active ? 'text-gray-400' : 'text-gray-600'}`}>{step.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Status Card */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Current Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Project</div>
                  <div className="font-bold text-white">Mission GTA Mobile</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Platform</div>
                  <div className="font-bold text-white flex items-center gap-2"><Smartphone className="w-4 h-4 text-green-500"/> Android</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Target Hardware</div>
                  <div className="font-bold text-white">Compatible high-performance Snapdragon devices</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Primary Focus</div>
                  <div className="font-bold text-white text-sm">Performance optimization and mobile compatibility</div>
                </div>
              </div>
            </div>

            {/* Performance Dashboard */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Monitor className="w-4 h-4"/> Performance Dashboard
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 font-bold mb-2">FPS</div>
                  <div className="text-sm font-medium text-green-400 break-words">{performance?.fps || 'Testing'}</div>
                </div>
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 font-bold mb-2">GPU</div>
                  <div className="text-sm font-medium text-amber-400 break-words">{performance?.gpu || 'Testing'}</div>
                </div>
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 font-bold mb-2">RAM</div>
                  <div className="text-sm font-medium text-gray-400 break-words">{performance?.ram || 'Data N/A'}</div>
                </div>
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 font-bold mb-2">Stability</div>
                  <div className="text-sm font-medium text-blue-400 break-words">{performance?.stability || 'Testing'}</div>
                </div>
              </div>
            </div>

            {/* Compatibility Note */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4"/> Compatibility
              </h3>
              <p className="text-xs text-amber-200/70 leading-relaxed">
                Compatibility depends on Snapdragon chipset, GPU capability, RAM, Android version, available storage, and graphics driver support.
              </p>
              <div className="mt-4 inline-block bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded">
                Experimental: May vary between devices
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full border-t border-white/5">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-white border-l-4 border-green-500 pl-4 mb-8">Mission Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.length > 0 ? gallery.map((img) => (
            <div 
              key={img.id} 
              onClick={() => setSelectedImage(img.image_url)}
              className="aspect-video bg-[#111] border border-white/10 rounded-xl overflow-hidden relative group cursor-pointer"
            >
              <img src={img.image_url} alt={img.title || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          )) : (
            /* Placeholders for Gallery */
            [1, 2, 3].map((item) => (
              <div key={item} className="aspect-video bg-[#111] border border-white/10 rounded-xl overflow-hidden relative group flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Monitor className="w-8 h-8 text-white/10" />
                <span className="absolute bottom-4 left-4 text-xs font-bold text-white/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  Gallery Placeholder 0{item}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Updates Section */}
      <section id="updates" className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full border-t border-white/5">
        <h2 className="text-2xl font-bold uppercase tracking-wide text-white border-l-4 border-green-500 pl-4 mb-8">Mission Updates</h2>
        
        {updates.length > 0 ? (
          <div className="space-y-6">
            {updates.map(update => (
              <div key={update.id} className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                {update.image_url && (
                  <div className="md:w-1/3 aspect-video md:aspect-auto relative shrink-0">
                    <img src={update.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                  <div className="text-green-500 font-bold tracking-widest text-xs uppercase mb-2">
                    {new Date(update.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{update.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-6 whitespace-pre-line">{update.description}</p>
                  
                  {update.links && update.links.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-auto">
                      {update.links.map((link, i) => (
                        <a 
                          key={i} 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" /> {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
            <LayoutDashboard className="w-10 h-10 text-white/20 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No development updates have been published yet.</p>
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legal Note */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto w-full border-t border-white/5 mb-12">
        <div className="bg-black/50 border border-white/10 p-6 sm:p-8 rounded-2xl">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Important Note</h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed text-justify">
            This is an independent technical/community project. GTA V and related intellectual property belong to Rockstar Games/Take-Two Interactive. The project does not claim ownership of the original game or its copyrighted assets. Any distribution or use of original game files must comply with applicable licenses and rights. This project is not officially affiliated with Rockstar Games or Take-Two Interactive, nor does it provide or host unauthorized copyrighted game files.
          </p>
        </div>
      </section>

    </div>
  );
}
