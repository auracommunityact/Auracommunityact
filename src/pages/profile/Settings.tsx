import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { Camera, Image as ImageIcon } from 'lucide-react';

export default function Settings() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    country: '',
    about: '',
    role: '',
    skills_interests: '',
    avatar_url: '',
    banner_url: '',
  });
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        country: profile.country || '',
        about: profile.about || '',
        role: profile.role || '',
        skills_interests: profile.skills_interests || '',
        avatar_url: profile.avatar_url || '',
        banner_url: profile.banner_url || '',
      });
    }
  }, [profile]);

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!user || !profile) return <Navigate to="/login" replace />;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const processImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading(`Processing ${type}...`, { id: `process-${type}` });
      const base64 = await processImage(file, type === 'avatar' ? 400 : 1200, type === 'avatar' ? 400 : 400);
      setFormData(prev => ({ ...prev, [type === 'avatar' ? 'avatar_url' : 'banner_url']: base64 }));
      toast.success(`${type === 'avatar' ? 'Profile picture' : 'Banner'} processed!`, { id: `process-${type}` });
    } catch (err) {
      toast.error(`Failed to process ${type}`, { id: `process-${type}` });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...formData });
      
      if (error) {
        if (error.message.includes('banner_url')) {
          throw new Error("Database is missing 'banner_url' column. Please check instructions to add it.");
        }
        throw error;
      }
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
      
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">
        {/* Banner Upload */}
        <div 
          className="h-48 bg-gradient-to-r from-amber-500/20 to-purple-600/20 relative group cursor-pointer"
          style={formData.banner_url ? { backgroundImage: `url(${formData.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          onClick={() => bannerInputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              <ImageIcon className="w-5 h-5" />
              <span className="font-medium">Change Banner</span>
            </div>
          </div>
          <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
        </div>
        
        {/* Avatar Upload */}
        <div className="px-8 pb-8">
          <div className="-mt-12 mb-6 relative w-24 h-24 group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-2xl bg-black border-4 border-[#050505] flex items-center justify-center overflow-hidden relative">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-white/30" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
            <input
              type="text" name="full_name" value={formData.full_name} onChange={handleChange}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Username</label>
            <input
              type="text" name="username" value={formData.username} onChange={handleChange}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Country</label>
            <input
              type="text" name="country" value={formData.country} onChange={handleChange}
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
    </div>
  );
}
