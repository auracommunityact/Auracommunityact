import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowRight, Check } from 'lucide-react';
import { supabase, Event } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvps, setRsvps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });
        
        if (eventsError) throw eventsError;
        if (eventsData) setEvents(eventsData);

        if (user) {
          const { data: rsvpsData, error: rsvpsError } = await supabase
            .from('event_rsvps')
            .select('event_id')
            .eq('user_id', user.id);
          
          if (rsvpsError) throw rsvpsError;
          if (rsvpsData) {
            setRsvps(new Set(rsvpsData.map(r => r.event_id)));
          }
        }
      } catch (err: any) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleRSVP = async (eventId: string) => {
    if (!user) {
      toast.error('Please login to RSVP for events');
      navigate('/login');
      return;
    }

    const isRSVPed = rsvps.has(eventId);
    setRsvpLoading(eventId);

    try {
      if (isRSVPed) {
        // Cancel RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setRsvps(prev => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        toast.success('RSVP cancelled');
      } else {
        // Add RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .insert([{ event_id: eventId, user_id: user.id }]);
        
        if (error) throw error;
        
        setRsvps(prev => {
          const newSet = new Set(prev);
          newSet.add(eventId);
          return newSet;
        });
        toast.success('RSVP successful! See you there.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating RSVP');
    } finally {
      setRsvpLoading(null);
    }
  };

  return (
    <div className="mt-24 mb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-4">Upcoming Events</h2>
          <p className="text-white/60 max-w-2xl">
            Join our digital workshops, innovation meetups, and masterclasses to level up your skills and connect with the community.
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-medium transition-colors border border-white/10 shrink-0">
          <CalendarIcon className="w-5 h-5" />
          View Full Calendar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-white/50">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-white/50 bg-white/[0.02] border border-white/10 rounded-3xl">
          No upcoming events at the moment. Check back soon!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => {
            const isRSVPed = rsvps.has(event.id);
            const isProcessing = rsvpLoading === event.id;

            return (
              <div key={event.id} className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-colors group flex flex-col">
                <div className="h-48 relative overflow-hidden bg-white/5 flex items-center justify-center">
                  {event.image ? (
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <CalendarIcon className="w-12 h-12 text-white/20" />
                  )}
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {event.category}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-amber-500 font-semibold mb-3">
                    <CalendarIcon className="w-4 h-4" />
                    {event.date}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                  <p className="text-white/60 mb-6 flex-1 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <Clock className="w-4 h-4 text-white/40" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/70">
                      <MapPin className="w-4 h-4 text-white/40" />
                      {event.location}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRSVP(event.id)}
                    disabled={isProcessing}
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold transition-all ${
                      isRSVPed 
                        ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400' 
                        : 'bg-white/5 hover:bg-amber-500 hover:text-black text-white group-hover:bg-amber-500 group-hover:text-black'
                    }`}
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : isRSVPed ? (
                      <>
                        <Check className="w-4 h-4 group-hover:hidden" /> 
                        <span className="group-hover:hidden">RSVPed</span>
                        <span className="hidden group-hover:inline">Cancel RSVP</span>
                      </>
                    ) : (
                      <>
                        RSVP Now
                        <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
