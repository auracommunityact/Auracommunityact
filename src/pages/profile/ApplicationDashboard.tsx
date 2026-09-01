import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, CommunityApplication } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';

export default function ApplicationDashboard() {
  const { user, profile, loading } = useAuth();
  const [application, setApplication] = useState<CommunityApplication | null>(null);
  const [loadingApp, setLoadingApp] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from('community_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setApplication(data);
          }
          setLoadingApp(false);
        });
    }
  }, [user]);

  if (loading || loadingApp) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!user || !profile) return <Navigate to="/login" replace />;

  if (!application) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-white mb-2">No Application Found</h2>
        <p className="text-white/70">You haven't submitted a community application yet.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'under_review': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getStatusMessage = (status: string) => {
    switch(status) {
      case 'approved': return 'Congratulations! You are now an Aura Community ACT member.';
      case 'rejected': return 'Your application was not approved.';
      case 'under_review': return 'An administrator is currently reviewing your application.';
      default: return 'Your application is currently being reviewed.';
    }
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">My Application</h1>
      
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <div className={`p-6 rounded-2xl border mb-8 flex flex-col items-center text-center ${getStatusColor(application.status)}`}>
          <h2 className="text-2xl font-bold capitalize mb-2">{application.status.replace('_', ' ')}</h2>
          <p className="opacity-90">{getStatusMessage(application.status)}</p>
          {application.status === 'rejected' && application.rejection_reason && (
            <div className="mt-4 p-4 bg-black/40 rounded-xl text-left w-full">
              <span className="font-bold block mb-1">Reason:</span>
              <span>{application.rejection_reason}</span>
            </div>
          )}
        </div>

        <div className="space-y-4 text-white/70">
          <div className="flex justify-between py-3 border-b border-white/10">
            <span className="font-medium text-white">Application ID</span>
            <span className="text-sm font-mono">{application.id.slice(0,8)}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/10">
            <span className="font-medium text-white">Submitted Date</span>
            <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-white/10">
            <span className="font-medium text-white">Role applied as</span>
            <span>{application.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
