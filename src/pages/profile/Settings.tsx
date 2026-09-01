import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';

export default function Settings() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    about: '',
    role: '',
    skills_interests: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        about: profile.about || '',
        role: profile.role || '',
        skills_interests: profile.skills_interests || '',
      });
    }
  }, [profile]);

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!user || !profile) return <Navigate to="/login" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success('Profile updated successfully');
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>
      
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
            <input
              type="text" name="full_name" value={formData.full_name} onChange={handleChange}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Role / Profession</label>
            <input
              type="text" name="role" value={formData.role} onChange={handleChange}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
              placeholder="e.g. Developer, Student, Designer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Skills / Interests</label>
            <input
              type="text" name="skills_interests" value={formData.skills_interests} onChange={handleChange}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
              placeholder="React, Design, Community Building..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">About / Bio</label>
            <textarea
              name="about" value={formData.about} onChange={handleChange} rows={4}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white resize-none"
              placeholder="Tell us a bit about yourself..."
            />
          </div>
          <button
            type="submit" disabled={saving}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
