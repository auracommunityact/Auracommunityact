import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Navigate, Link } from 'react-router-dom';
import { User as UserIcon, Calendar, MapPin, Briefcase, Mail, AppWindow } from 'lucide-react';

export default function Profile() {
  const { user, profile, loading } = useAuth();
  const [appAccess, setAppAccess] = useState<any[]>([]);

  useEffect(() => {
    if (user && profile?.status === 'member') {
      supabase
        .from('member_app_access')
        .select('*, aura_apps(*)')
        .eq('member_id', user.id)
        .eq('status', 'active')
        .then(({ data }) => {
          if (data) setAppAccess(data);
        });
    }
  }, [user, profile]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'member': return <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Member</span>;
      case 'under_review': return <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Under Review</span>;
      default: return <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">User</span>;
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        <div 
          className="h-48 bg-gradient-to-r from-amber-500/20 to-purple-600/20 relative"
          style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        ></div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-16 mb-6">
            <div className="w-32 h-32 rounded-2xl bg-black border-4 border-[#050505] flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name || ''} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-white/30" />
              )}
            </div>
            <Link to="/settings" className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-semibold transition-colors text-white">
              Edit Profile
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              {profile.full_name}
              {getStatusBadge(profile.status)}
            </h1>
            <p className="text-white/50 text-lg">@{profile.username}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">About</h3>
                {profile.about ? (
                  <p className="text-white/70 whitespace-pre-wrap">{profile.about}</p>
                ) : (
                  <p className="text-white/30 italic">No bio provided yet.</p>
                )}
              </div>

              {profile.skills_interests && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Skills & Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills_interests.split(',').map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/80">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Details</h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-500" />
                  {profile.email || user.email}
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  {profile.country || 'Country not set'}
                </li>
                <li className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  {profile.role || 'Role not set'}
                </li>
                <li className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-amber-500" />
                  Joined {new Date(user.created_at || profile.created_at).toLocaleDateString()}
                </li>
              </ul>
            </div>
          </div>

          {profile.status === 'member' && (
            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AppWindow className="w-5 h-5 text-amber-500" />
                Assigned Working Apps
              </h3>
              <div className="flex flex-wrap gap-3">
                {appAccess.length > 0 ? (
                  appAccess.map(a => (
                    <div key={a.id} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-white font-medium">{a.aura_apps?.name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-white/40 italic text-sm">No working apps have been assigned yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
