import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase, Event } from '../../lib/supabase';
import { BookOpen, Calendar as CalendarIcon, MessageSquare, Download, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function MembersDashboard() {
  const { user, profile, loading } = useAuth();
  const [rsvpedEvents, setRsvpedEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    async function fetchRSVPs() {
      if (user && profile?.status === 'member') {
        try {
          // Fetch events the user has RSVPed to
          const { data, error } = await supabase
            .from('event_rsvps')
            .select('event_id, events(*)')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          if (data) {
            // Map the joined data to just the events array
            const events = data.map((item: any) => item.events).filter(Boolean);
            // Sort by date manually as we can't easily order nested selections
            events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setRsvpedEvents(events);
          }
        } catch (err) {
          console.error("Error fetching RSVPs:", err);
        } finally {
          setLoadingEvents(false);
        }
      }
    }
    fetchRSVPs();
  }, [user, profile]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-white/50">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;
  
  if (profile?.status !== 'member') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Members Only Area</h2>
        <p className="text-white/70 max-w-md text-center mb-8">
          This section is exclusive to approved Aura Community ACT members. 
          Please submit an application to join our community and access these resources.
        </p>
        <Link 
          to="/my-application" 
          className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-colors"
        >
          View My Application Status
        </Link>
      </div>
    );
  }

  const resources = [
    {
      title: "Private Discord Server",
      description: "Join our exclusive members-only channels to connect, collaborate, and chat.",
      icon: <MessageSquare className="w-6 h-6 text-amber-500" />,
      action: "Join Server",
      link: "#"
    },
    {
      title: "ACT Design System",
      description: "Download our official Figma UI kit and branding guidelines.",
      icon: <Download className="w-6 h-6 text-amber-500" />,
      action: "Download (.fig)",
      link: "#"
    },
    {
      title: "Community Guidelines",
      description: "Review our updated policies, code of conduct, and member expectations.",
      icon: <BookOpen className="w-6 h-6 text-amber-500" />,
      action: "Read Docs",
      link: "#/guidelines"
    }
  ];

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Welcome back, {profile.full_name || profile.username}!
        </h1>
        <p className="text-lg text-white/60">
          Access your exclusive community resources, upcoming event RSVPs, and member benefits.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        
        {/* Left Column: Resources & Content */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Community Resources</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {resources.map((resource, idx) => (
                <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col hover:bg-white/[0.05] transition-colors">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                    {resource.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{resource.title}</h3>
                  <p className="text-white/60 text-sm mb-6 flex-1">{resource.description}</p>
                  <a href={resource.link} className="inline-flex items-center gap-2 text-sm font-bold text-amber-500 hover:text-amber-400 mt-auto">
                    {resource.action} <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: RSVPs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-amber-500" />
            My Upcoming RSVPs
          </h2>
          
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            {loadingEvents ? (
              <div className="text-center py-8 text-white/50">Loading RSVPs...</div>
            ) : rsvpedEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/50 mb-4">You haven't RSVPed to any upcoming events yet.</p>
                <Link to="/community" className="text-amber-500 hover:underline font-medium text-sm">
                  Browse Community Events
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {rsvpedEvents.map(event => (
                  <div key={event.id} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white/5 shrink-0 overflow-hidden flex items-center justify-center">
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                      ) : (
                        <CalendarIcon className="w-6 h-6 text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate text-sm mb-1">{event.title}</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{event.date} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
