import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    ageGroup: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username
          }
        }
      });

      if (error) throw error;
      
      // Auto-create profile
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: formData.fullName,
          username: formData.username,
          email: formData.email,
          country: formData.country,
          age_group: formData.ageGroup,
          status: 'not_applied'
        });
      }

      toast.success('Account created successfully! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-white/70 mb-8">Join the Aura Community ACT platform.</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Full Name *</label>
              <input
                type="text" name="fullName" required
                value={formData.fullName} onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Username *</label>
              <input
                type="text" name="username" required
                value={formData.username} onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email *</label>
            <input
              type="email" name="email" required
              value={formData.email} onChange={handleChange}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Password *</label>
              <input
                type="password" name="password" required minLength={6}
                value={formData.password} onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Confirm Password *</label>
              <input
                type="password" name="confirmPassword" required minLength={6}
                value={formData.confirmPassword} onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Country *</label>
              <input
                type="text" name="country" required
                value={formData.country} onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
                placeholder="e.g. India"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Age Group *</label>
              <select
                name="ageGroup" required
                value={formData.ageGroup} onChange={handleChange}
                className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:border-amber-500 text-white"
              >
                <option value="">Select Age Group</option>
                <option value="Under 13">Under 13</option>
                <option value="13-15">13–15</option>
                <option value="16-17">16–17</option>
                <option value="18+">18+</option>
              </select>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-colors disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white/70">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-500 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
