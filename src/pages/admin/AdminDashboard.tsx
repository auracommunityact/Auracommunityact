import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Download } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('applications');
  const [data, setData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());

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
        {['applications', 'users', 'messages'].map(tab => (
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
                        {item.status === 'pending' && (
                          <button onClick={() => handleUpdateAppStatus(item.id, item.user_id, 'under_review')} className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded hover:bg-blue-500/30">Review</button>
                        )}
                        {(item.status === 'pending' || item.status === 'under_review') && (
                          <>
                            <button onClick={() => { if(window.confirm('Approve?')) handleUpdateAppStatus(item.id, item.user_id, 'approved') }} className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded hover:bg-green-500/30">Approve</button>
                            <button onClick={() => { 
                              const reason = window.prompt('Rejection Reason (optional):');
                              if(reason !== null) handleUpdateAppStatus(item.id, item.user_id, 'rejected', reason);
                            }} className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded hover:bg-red-500/30">Reject</button>
                          </>
                        )}
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
    </div>
  );
}
