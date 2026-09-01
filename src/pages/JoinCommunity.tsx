import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Navigate, useNavigate } from 'react-router-dom';

export default function JoinCommunity() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    city_state: '',
    role: '',
    skills_interests: '',
    introduction: '',
    reason_to_join: '',
    contribution: '',
    community_interests: '',
    discord: '',
    youtube: '',
    instagram: '',
    github: '',
    website: '',
  });

  const [agreements, setAgreements] = useState({
    guidelines: false,
    respect: false,
    nospam: false,
    review: false,
    privacy: false,
  });

  const [submitting, setSubmitting] = useState(false);

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!user || !profile) return <Navigate to="/login" replace />;
  if (['pending', 'under_review', 'approved'].includes(profile.status)) {
    return <Navigate to="/my-application" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAgreements(prev => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const isFormValid = 
    Object.values(agreements).every(v => v) &&
    formData.role && formData.skills_interests && formData.introduction &&
    formData.reason_to_join && formData.contribution && formData.community_interests;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return toast.error("Please fill all required fields and agreements");

    setSubmitting(true);
    try {
      const { error } = await supabase.from('community_applications').insert([{
        user_id: user.id,
        full_name: profile.full_name,
        username: profile.username,
        email: profile.email,
        country: profile.country,
        age_group: profile.age_group,
        city_state: formData.city_state,
        role: formData.role,
        skills_interests: formData.skills_interests,
        introduction: formData.introduction,
        reason_to_join: formData.reason_to_join,
        contribution: formData.contribution,
        community_interests: formData.community_interests,
        discord: formData.discord,
        youtube: formData.youtube,
        instagram: formData.instagram,
        github: formData.github,
        website: formData.website,
        status: 'pending'
      }]);

      if (error) throw error;

      await supabase.from('profiles').update({ status: 'pending' }).eq('id', user.id);
      
      toast.success("Application Submitted Successfully");
      await refreshProfile();
      navigate('/my-application');
    } catch (err: any) {
      toast.error(err.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white";

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Join Aura Community ACT</h1>
      
      <form onSubmit={handleSubmit} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-8">
        
        {/* About You */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">About You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">City/State (Optional)</label>
              <input type="text" name="city_state" value={formData.city_state} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Role *</label>
              <select name="role" required value={formData.role} onChange={handleChange} className={inputClass}>
                <option value="">Select Role</option>
                <option value="Student">Student</option>
                <option value="Developer">Developer</option>
                <option value="Gamer">Gamer</option>
                <option value="Creator">Creator</option>
                <option value="Designer">Designer</option>
                <option value="Entrepreneur">Entrepreneur</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Skills / Interests *</label>
            <input type="text" name="skills_interests" required value={formData.skills_interests} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Short Introduction *</label>
            <textarea name="introduction" required rows={3} value={formData.introduction} onChange={handleChange} className={inputClass} />
          </div>
        </div>

        {/* Community Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Community Information</h2>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Why do you want to join Aura Community ACT? *</label>
            <textarea name="reason_to_join" required rows={3} value={formData.reason_to_join} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">What can you contribute? *</label>
            <textarea name="contribution" required rows={3} value={formData.contribution} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Which areas interest you? *</label>
            <select name="community_interests" required value={formData.community_interests} onChange={handleChange} className={inputClass}>
              <option value="">Select Area</option>
              <option value="Technology">Technology</option>
              <option value="Gaming">Gaming</option>
              <option value="Education">Education</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Content Creation">Content Creation</option>
              <option value="Business">Business</option>
              <option value="Community Events">Community Events</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Optional Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Discord Username</label>
              <input type="text" name="discord" value={formData.discord} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">GitHub URL</label>
              <input type="url" name="github" value={formData.github} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">YouTube Channel</label>
              <input type="url" name="youtube" value={formData.youtube} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Website / Portfolio</label>
              <input type="url" name="website" value={formData.website} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Agreements */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2">Community Agreement</h2>
          <div className="space-y-3">
            {[
              { id: 'guidelines', label: 'I agree to follow Aura Community ACT Community Guidelines.' },
              { id: 'respect', label: 'I will respect other community members.' },
              { id: 'nospam', label: 'I will not spam, scam, harass or share harmful content.' },
              { id: 'review', label: 'I understand that my membership request will be reviewed by an administrator.' },
              { id: 'privacy', label: 'I agree to the Privacy Policy.' }
            ].map(item => (
              <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={item.id}
                  checked={agreements[item.id as keyof typeof agreements]}
                  onChange={handleCheckbox}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-white/80">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || submitting}
          className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>

      </form>
    </div>
  );
}
