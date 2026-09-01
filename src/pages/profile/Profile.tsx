import { useAuth } from '../../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { User as UserIcon, Calendar, MapPin, Briefcase, Mail } from 'lucide-react';

export default function Profile() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Approved Member</span>;
      case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Application Pending</span>;
      case 'under_review': return <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Under Review</span>;
      case 'rejected': return <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default: return <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Not Applied</span>;
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-amber-500/20 to-purple-600/20 relative"></div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-black border-4 border-[#050505] flex items-center justify-center overflow-hidden">
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">About</h3>
              {profile.about ? (
                <p className="text-white/70">{profile.about}</p>
              ) : (
                <p className="text-white/30 italic">No bio provided yet.</p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Details</h3>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-500" />
                  {profile.email}
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
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
