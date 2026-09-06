import { useState, useEffect } from 'react';
import { supabase, Event } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (error) throw error;
      setEvents(data || []);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentEvent.id) {
        const { error } = await supabase.from('events').update(currentEvent).eq('id', currentEvent.id);
        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        const { error } = await supabase.from('events').insert([currentEvent]);
        if (error) throw error;
        toast.success('Event added successfully');
      }
      setIsEditing(false);
      setCurrentEvent({});
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Error saving event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message || 'Error deleting event');
    }
  };

  if (loading) return <div className="py-8 text-center text-white/50">Loading events...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Manage Events</h2>
        <button
          onClick={() => { setCurrentEvent({}); setIsEditing(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-full transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => (
          <div key={event.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white">{event.title}</h3>
              <p className="text-sm text-white/60 mb-2">{event.date} • {event.time}</p>
              <span className="text-xs px-2 py-1 bg-white/10 text-white rounded uppercase">{event.category}</span>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
              <button
                onClick={() => { setCurrentEvent(event); setIsEditing(true); }}
                className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors flex-1 justify-center"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => handleDelete(event.id)}
                className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded transition-colors flex-1 justify-center"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="col-span-full py-8 text-center text-white/50 border border-dashed border-white/10 rounded-xl">
            No events found. Create your first one!
          </div>
        )}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl p-8 relative my-8">
            <button 
              onClick={() => setIsEditing(false)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">{currentEvent.id ? 'Edit Event' : 'Add Event'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Title</label>
                <input 
                  type="text" required
                  value={currentEvent.title || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Date (e.g., Sep 15, 2026)</label>
                  <input 
                    type="text" required
                    value={currentEvent.date || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, date: e.target.value})}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Time (e.g., 10:00 AM)</label>
                  <input 
                    type="text" required
                    value={currentEvent.time || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, time: e.target.value})}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                  <input 
                    type="text" required
                    value={currentEvent.location || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Category</label>
                  <input 
                    type="text" required
                    value={currentEvent.category || ''}
                    onChange={(e) => setCurrentEvent({...currentEvent, category: e.target.value})}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={currentEvent.image || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, image: e.target.value})}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
                <textarea 
                  required rows={3}
                  value={currentEvent.description || ''}
                  onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                  className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-xl font-bold transition-colors"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
