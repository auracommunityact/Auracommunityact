import { Calendar as CalendarIcon, Clock, MapPin, ArrowRight } from 'lucide-react';

const events = [
  {
    id: 1,
    title: "Web3 Innovation Meetup",
    date: "Sep 15, 2026",
    time: "10:00 AM - 2:00 PM EST",
    location: "Online / Discord Stage",
    category: "Meetup",
    description: "Join fellow builders to discuss the future of decentralized applications and community ownership.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 2,
    title: "AI Developer Workshop",
    date: "Sep 22, 2026",
    time: "1:00 PM - 4:00 PM EST",
    location: "Online / Zoom",
    category: "Workshop",
    description: "Hands-on workshop covering the integration of large language models into everyday applications.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    title: "Design System Masterclass",
    date: "Oct 05, 2026",
    time: "11:00 AM - 1:00 PM EST",
    location: "Online / Discord Stage",
    category: "Masterclass",
    description: "Learn how to build scalable and accessible design systems from industry experts.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800"
  }
];

export function EventCalendar() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <div key={event.id} className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden hover:bg-white/[0.04] transition-colors group flex flex-col">
            <div className="h-48 relative overflow-hidden">
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
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

              <button className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 group-hover:bg-amber-500 group-hover:text-black text-white rounded-xl font-semibold transition-all">
                RSVP Now
                <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
