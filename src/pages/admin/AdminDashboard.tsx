import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, CommunityApplication } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Download, X } from 'lucide-react';
import AdminEvents from './AdminEvents';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('applications');
  const [data, setData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [viewingApp, setViewingApp] = useState<CommunityApplication | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData(activeTab);
      setSelectedApps(new Set());
    }
  }, [activeTab, isAdmin]);

  const fetchData = async (tab: string) => {
    setLoadingData(true);
    try {
      let result;
      if (tab === 'applications') {
        result = await supabase.from('community_applications').select('*').order('submitted_at', { ascending: false });
      } else if (tab === 'users') {
        result = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      } else if (tab === 'messages') {
        result = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      }
      if (result?.error) throw result.error;
      setData(result?.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Error fetching data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateAppStatus = async (appId: string, userId: string, status: string, reason?: string) => {
    try {
      const updates: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id };
      if (reason !== undefined) updates.rejection_reason = reason;

      const { error } = await supabase.from('community_applications').update(updates).eq('id', appId);
      if (error) throw error;
      
      // Sync profile status
      await supabase.from('profiles').update({ status }).eq('id', userId);
      
      toast.success(`Application marked as ${status}`);
      fetchData('applications');
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const handleBulkUpdate = async (status: string) => {
    if (!window.confirm(`Are you sure you want to mark ${selectedApps.size} applications as ${status}?`)) return;
    
    let reason: string | undefined = undefined;
    if (status === 'rejected') {
      const input = window.prompt('Rejection Reason (optional, applies to all selected):');
      if (input === null) return;
      reason = input;
    }

    setLoadingData(true);
    try {
      const updates = Array.from(selectedApps).map(async (appId) => {
        const app = data.find(d => d.id === appId);
        if (!app) return;
        
        const appUpdates: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id };
        if (reason !== undefined) appUpdates.rejection_reason = reason;

        await supabase.from('community_applications').update(appUpdates).eq('id', appId);
        await supabase.from('profiles').update({ status }).eq('id', app.user_id);
      });

      await Promise.all(updates);
      
      toast.success(`Successfully updated ${selectedApps.size} applications`);
      setSelectedApps(new Set());
      fetchData('applications');
    } catch (err: any) {
      toast.error(err.message || 'Error performing bulk update');
      setLoadingData(false);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedApps(new Set(data.map(item => item.id)));
    } else {
      setSelectedApps(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedApps);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedApps(newSelected);
  };

  const exportToCSV = () => {
    if (!data || data.length === 0) return toast.error('No data to export');

    const headers = ['ID', 'Applicant Name', 'Username', 'Email', 'Role', 'Status', 'Submitted At', 'Country', 'City/State'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        return [
          item.id,
          `"${(item.full_name || '').replace(/"/g, '""')}"`,
          `"${(item.username || '').replace(/"/g, '""')}"`,
          `"${(item.email || '').replace(/"/g, '""')}"`,
          `"${(item.role || '').replace(/"/g, '""')}"`,
          item.status,
          item.submitted_at,
          `"${(item.country || '').replace(/"/g, '""')}"`,
          `"${(item.city_state || '').replace(/"/g, '""')}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        {activeTab === 'applications' && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-semibold transition-colors text-white"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>
      
      <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        {['applications', 'users', 'messages', 'events'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/70 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'applications' && selectedApps.size > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-medium">{selectedApps.size} applications selected</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleBulkUpdate('under_review')} className="text-sm bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 font-semibold transition-colors">
              Move to Review
            </button>
            <button onClick={() => handleBulkUpdate('approved')} className="text-sm bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 font-semibold transition-colors">
              Approve Selected
            </button>
            <button onClick={() => handleBulkUpdate('rejected')} className="text-sm bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 font-semibold transition-colors">
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {activeTab === 'events' ? (
        <AdminEvents />
      ) : (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-x-auto">
          {loadingData ? (
            <div className="py-8 text-center text-white/50">Loading data...</div>
          ) : (
          <table className="w-full text-left text-sm text-white/80">
            <thead>
              <tr className="border-b border-white/10 text-white font-semibold">
                {activeTab === 'applications' && (
                  <>
                    <th className="pb-3 pr-4 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 bg-black/50"
                        checked={data.length > 0 && selectedApps.size === data.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="pb-3 pr-4">Applicant</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Actions</th>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Joined</th>
                  </>
                )}
                {activeTab === 'messages' && (
                  <>
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Subject</th>
                    <th className="pb-3 pr-4">Message</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                  {activeTab === 'applications' && (
                    <>
                      <td className="py-4 pr-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 bg-black/50"
                          checked={selectedApps.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </td>
                      <td className="py-4 pr-4">{item.full_name}</td>
                      <td className="py-4 pr-4">{item.email}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${item.status === 'approved' ? 'bg-green-500/20 text-green-400' : item.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 flex flex-wrap gap-2">
                        <button onClick={() => setViewingApp(item)} className="text-xs bg-white/10 text-white px-3 py-1 rounded hover:bg-white/20">View</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'users' && (
                    <>
                      <td className="py-4 pr-4">{item.full_name}</td>
                      <td className="py-4 pr-4">{item.email}</td>
                      <td className="py-4 pr-4">{item.status}</td>
                      <td className="py-4 pr-4">{new Date(item.created_at).toLocaleDateString()}</td>
                    </>
                  )}
                  {activeTab === 'messages' && (
                    <>
                      <td className="py-4 pr-4">{item.name}</td>
                      <td className="py-4 pr-4">{item.email}</td>
                      <td className="py-4 pr-4">{item.subject}</td>
                      <td className="py-4 pr-4 max-w-xs truncate">{item.message}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {viewingApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-4xl p-8 relative my-8">
            <button 
              onClick={() => setViewingApp(null)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6">Application Details</h2>
            
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div>
                <span className="text-white/50 text-sm block mb-1">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${viewingApp.status === 'approved' ? 'bg-green-500/20 text-green-400' : viewingApp.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {viewingApp.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <span className="text-white/50 text-sm block mb-1">Change Status</span>
                <select 
                  className="bg-black/50 border border-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-amber-500"
                  value={viewingApp.status}
                  onChange={(e) => {
                    if (e.target.value === 'rejected') {
                      const reason = window.prompt('Rejection Reason (optional):');
                      if (reason !== null) {
                        handleUpdateAppStatus(viewingApp.id, viewingApp.user_id, e.target.value, reason);
                        setViewingApp({ ...viewingApp, status: e.target.value as any, rejection_reason: reason });
                      }
                    } else {
                      handleUpdateAppStatus(viewingApp.id, viewingApp.user_id, e.target.value);
                      setViewingApp({ ...viewingApp, status: e.target.value as any });
                    }
                  }}
                >
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/80">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Basic Info</h3>
                <div><span className="text-white/50 text-sm block">Full Name</span> {viewingApp.full_name}</div>
                <div><span className="text-white/50 text-sm block">Username</span> @{viewingApp.username}</div>
                <div><span className="text-white/50 text-sm block">Email</span> {viewingApp.email}</div>
                <div><span className="text-white/50 text-sm block">Location</span> {viewingApp.city_state ? `${viewingApp.city_state}, ` : ''}{viewingApp.country}</div>
                <div><span className="text-white/50 text-sm block">Age Group</span> {viewingApp.age_group}</div>
                <div><span className="text-white/50 text-sm block">Application ID</span> <span className="font-mono text-sm">{viewingApp.id}</span></div>
                <div><span className="text-white/50 text-sm block">Submitted</span> {new Date(viewingApp.submitted_at).toLocaleString()}</div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Professional Info</h3>
                <div><span className="text-white/50 text-sm block">Role Applied As</span> {viewingApp.role}</div>
                <div><span className="text-white/50 text-sm block">Skills & Interests</span> {viewingApp.skills_interests}</div>
                <div><span className="text-white/50 text-sm block">Community Interests</span> {viewingApp.community_interests}</div>
                
                {(viewingApp.github || viewingApp.website || viewingApp.youtube || viewingApp.discord) && (
                  <div className="pt-2">
                    <span className="text-white/50 text-sm block mb-1">Links</span>
                    <div className="flex flex-col gap-1">
                      {viewingApp.github && <a href={viewingApp.github} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline break-all">GitHub: {viewingApp.github}</a>}
                      {viewingApp.website && <a href={viewingApp.website} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline break-all">Website: {viewingApp.website}</a>}
                      {viewingApp.youtube && <a href={viewingApp.youtube} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline break-all">YouTube: {viewingApp.youtube}</a>}
                      {viewingApp.discord && <span>Discord: {viewingApp.discord}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-6 text-white/80">
              <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Detailed Responses</h3>
              <div>
                <span className="text-white/50 text-sm block mb-1">Introduction</span>
                <p className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap">{viewingApp.introduction}</p>
              </div>
              <div>
                <span className="text-white/50 text-sm block mb-1">Reason to Join</span>
                <p className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap">{viewingApp.reason_to_join}</p>
              </div>
              <div>
                <span className="text-white/50 text-sm block mb-1">Contribution</span>
                <p className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap">{viewingApp.contribution}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
