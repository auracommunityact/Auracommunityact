import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { Star, MapPin, Briefcase, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function MemberSpotlightSection() {
  const [member, setMember] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpotlight() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Deterministic daily/weekly selection based on epoch time
          // Using 7 days for weekly change
          const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
          const featuredIndex = weekNumber % data.length;
          setMember(data[featuredIndex]);
        }
      } catch (err) {
        console.error("Error fetching spotlight member:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSpotlight();
  }, []);

  if (loading) {
    return (
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-pulse flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="w-48 h-6 bg-white/10 rounded"></div>
            <div className="w-64 h-4 bg-white/10 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!member) return null; // Hide section entirely if no approved members exist

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-white/10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-sm font-bold uppercase tracking-widest mb-6">
          <Star className="w-4 h-4" />
          Member Spotlight
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Featured This Week</h2>
        <p className="text-lg text-white/60 leading-relaxed">
          Celebrating the brilliant minds and dedicated innovators that make up our community ecosystem.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        
        {member.banner_url && (
          <div className="h-32 sm:h-48 w-full bg-white/5 relative z-0">
            <img 
              src={member.banner_url} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`relative z-10 px-8 pb-12 sm:px-12 ${member.banner_url ? 'pt-0' : 'pt-12'}`}>
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-end">
            <div className={`w-32 h-32 rounded-3xl bg-black border-4 border-[#111] overflow-hidden shrink-0 ${member.banner_url ? '-mt-16' : ''}`}>
              {member.avatar_url ? (
                <img 
                  src={member.avatar_url} 
                  alt={member.full_name || 'Member'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-4xl text-white/20 font-bold uppercase">
                  {(member.full_name || member.username || 'A')[0]}
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <h3 className="text-3xl font-bold text-white flex items-center gap-2">
                {member.full_name || member.username}
                <Award className="w-6 h-6 text-amber-500" />
              </h3>
              {member.username && <p className="text-white/50 text-lg">@{member.username}</p>}
            </div>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">About</h4>
                <p className="text-white/80 leading-relaxed bg-white/5 p-4 rounded-2xl">
                  {member.about || "This member hasn't added an about section yet, but they are a valued part of our community!"}
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Quick Facts</h4>
                <div className="space-y-3 bg-white/5 p-4 rounded-2xl">
                  {member.role && (
                    <div className="flex items-center gap-3 text-white/80">
                      <Briefcase className="w-5 h-5 text-amber-500 shrink-0" />
                      {member.role}
                    </div>
                  )}
                  {member.country && (
                    <div className="flex items-center gap-3 text-white/80">
                      <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                      {member.country}
                    </div>
                  )}
                </div>
              </div>

              {member.skills_interests && (
                <div>
                  <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-3">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {member.skills_interests.split(',').slice(0, 5).map((skill, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white/10 border border-white/10 text-white text-sm rounded-full">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
