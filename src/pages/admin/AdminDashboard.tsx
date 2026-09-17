import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, CommunityApplication } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Download, X, Mail, CheckCircle2, Archive, Trash2, Reply } from 'lucide-react';
import AdminEvents from './AdminEvents';
import AdminMissionGTA from './AdminMissionGTA';
import AdminProjects from './AdminProjects';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('applications');
  const [data, setData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [viewingApp, setViewingApp] = useState<CommunityApplication | null>(null);

  // Custom Confirm/Prompt Modal State (Replacing window.alert/prompt)
  const [confirmAction, setConfirmAction] = useState<{
    type: 'bulk' | 'single';
    status: string;
    appId?: string;
    userId?: string;
  } | null>(null);
  const [actionReason, setActionReason] = useState('');

  // New states for Members/Apps tab
  const [auraApps, setAuraApps] = useState<any[]>([]);
  const [appAccess, setAppAccess] = useState<any[]>([]);
  const [managingMember, setManagingMember] = useState<any | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<Record<string, string>>({});

  
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [viewingMessage, setViewingMessage] = useState<any | null>(null);
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  
    const [realtimeTrigger, setRealtimeTrigger] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'unread');
      setUnreadMessageCount(count || 0);
    };
    fetchUnreadCount();

    const channel = supabase.channel('contact_messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, payload => {
        fetchUnreadCount();
        setRealtimeTrigger(prev => prev + 1);
        toast('New message received', { icon: '📬' });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);
  
  useEffect(() => {
    if (activeTab === 'messages' && realtimeTrigger > 0) {
      fetchData('messages');
    }
  }, [realtimeTrigger]);


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
      } else if (tab === 'members') {
        result = await supabase.from('profiles').select('*').eq('status', 'member').order('created_at', { ascending: false });
        // Also fetch app access and aura apps
        const appsRes = await supabase.from('aura_apps').select('*');
        if (appsRes.data) setAuraApps(appsRes.data);
        const accessRes = await supabase.from('member_app_access').select('*, aura_apps(*)');
        if (accessRes.data) setAppAccess(accessRes.data);
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

  
  const updateMessageStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
        
      if (error) throw error;
      
      setData(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
      
      if (viewingMessage && viewingMessage.id === id) {
        setViewingMessage({ ...viewingMessage, status: newStatus });
      }
      
      // refetch unread count will be handled by realtime subscription if active, but let's do it manually just in case
      const { count } = await supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread');
      setUnreadMessageCount(count || 0);
      
      toast.success(`Message marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating message status');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this message?")) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
      setData(prev => prev.filter(m => m.id !== id));
      if (viewingMessage && viewingMessage.id === id) setViewingMessage(null);
      toast.success('Message deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Error deleting message');
    }
  };
  
  const openMessage = async (msg: any) => {
    setViewingMessage(msg);
    if (msg.status === 'unread') {
      await updateMessageStatus(msg.id, 'read');
    }
  };

  const executeSingleUpdate = async (appId: string, userId: string, status: string, reason?: string) => {
    try {
      const { data, error } = await supabase.rpc('admin_update_application_status', {
        app_id: appId,
        new_status: status,
        rej_reason: reason || null
      });

      if (error) throw error;
      
      const updates: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id };
      if (reason !== undefined) updates.rejection_reason = reason;

      // Sync local state immediately for instant UI feedback without reload
      setData(prev => prev.map(app => 
        app.id === appId ? { ...app, ...updates } : app
      ));
      
      if (viewingApp && viewingApp.id === appId) {
        setViewingApp(prev => prev ? { ...prev, ...updates } : null);
      }
      
      toast.success(`Application marked as ${status}`);
    } catch (err: any) {
      toast.error(err.message || 'Error updating status');
    }
  };

  const executeBulkUpdate = async (status: string, reason?: string) => {
    setLoadingData(true);
    try {
      const updates = Array.from(selectedApps).map(async (appId) => {
        const app = data.find(d => d.id === appId);
        if (!app) return;
        
        const { error } = await supabase.rpc('admin_update_application_status', {
          app_id: appId,
          new_status: status,
          rej_reason: reason || null
        });

        if (error) throw error;
        
        const appUpdates: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id };
        if (reason !== undefined) appUpdates.rejection_reason = reason;
        
        return { id: appId, ...appUpdates };
      });

      const results = await Promise.all(updates);
      
      // Sync local state immediately
      setData(prev => {
        const newArray = [...prev];
        for (const res of results) {
           const idx = newArray.findIndex(a => a.id === res?.id);
           if (idx > -1) newArray[idx] = { ...newArray[idx], ...res };
        }
        return newArray;
      });
      
      toast.success(`Successfully updated ${selectedApps.size} applications`);
      setSelectedApps(new Set());
    } catch (err: any) {
      toast.error(err.message || 'Error performing bulk update');
    } finally {
      setLoadingData(false);
    }
  };

  const triggerSingleUpdate = (appId: string, userId: string, status: string) => {
    if (status === 'rejected') {
      setConfirmAction({ type: 'single', status, appId, userId });
      setActionReason('');
    } else {
      executeSingleUpdate(appId, userId, status);
    }
  };

  const triggerBulkUpdate = (status: string) => {
    setConfirmAction({ type: 'bulk', status });
    setActionReason('');
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

  const openManageAccess = (member: any) => {
    setManagingMember(member);
    const memberAccess = appAccess.filter(a => a.member_id === member.id);
    const currentAccessMap: Record<string, string> = {};
    memberAccess.forEach(a => {
      currentAccessMap[a.app_id] = a.status;
    });
    setSelectedAccess(currentAccessMap);
  };

  const handleSaveAccess = async () => {
    if (!managingMember) return;
    try {
      setLoadingData(true);
      const promises = Object.entries(selectedAccess).map(async ([appId, status]) => {
        const { error } = await supabase.rpc('admin_manage_app_access', {
          p_member_id: managingMember.id,
          p_app_id: appId,
          p_status: status
        });
        if (error) throw error;
      });
      await Promise.all(promises);
      toast.success('App access saved successfully');
      setManagingMember(null);
      fetchData('members');
    } catch (err: any) {
      toast.error(err.message || 'Error saving access');
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" replace />;

    const filteredData = data.filter(item => {
    if (activeTab === 'messages') {
      if (messageFilter !== 'all' && item.status !== messageFilter) return false;
      if (messageSearch) {
        const search = messageSearch.toLowerCase();
        return (item.name?.toLowerCase().includes(search) || 
                item.email?.toLowerCase().includes(search) || 
                item.subject?.toLowerCase().includes(search) || 
                item.message?.toLowerCase().includes(search));
      }
    }
    return true;
  });

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
        {['applications', 'members', 'users', 'messages', 'events', 'projects', 'mission_gta'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-4 py-2 rounded-full font-semibold capitalize whitespace-nowrap ${activeTab === tab ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/70 hover:text-white'}`}
          >
            {tab.replace('_', ' ')}
            {tab === 'messages' && unreadMessageCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border border-[#111]">
                {unreadMessageCount}
              </span>
            )}
          </button>
        ))}
      </div>

            {activeTab === 'messages' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={messageSearch}
            onChange={e => setMessageSearch(e.target.value)}
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          />
          <select 
            value={messageFilter}
            onChange={e => setMessageFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      )}

      {activeTab === 'applications' && selectedApps.size > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-medium">{selectedApps.size} applications selected</span>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => triggerBulkUpdate('under_review')} className="text-sm bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 font-semibold transition-colors">
              Move to Review
            </button>
            <button onClick={() => triggerBulkUpdate('accepted')} className="text-sm bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 font-semibold transition-colors">
              Accept Selected
            </button>
            <button onClick={() => triggerBulkUpdate('rejected')} className="text-sm bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 font-semibold transition-colors">
              Reject Selected
            </button>
          </div>
        </div>
      )}

      


      {activeTab === 'events' ? (
        <AdminEvents />
      ) : activeTab === 'projects' ? (
        <AdminProjects />
      ) : activeTab === 'mission_gta' ? (
        <AdminMissionGTA />
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
                {activeTab === 'members' && (
                  <>
                    <th className="pb-3 pr-4">Member</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Working Apps</th>
                    <th className="pb-3 pr-4 text-right">Action</th>
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
                    <th className="pb-3 pr-4">Sender</th>
                    <th className="pb-3 pr-4">Subject</th>
                    <th className="pb-3 pr-4">Preview</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Date</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item: any) => (
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
                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${item.status === 'accepted' ? 'bg-green-500/20 text-green-400' : item.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 flex flex-wrap gap-2">
                        <button onClick={() => setViewingApp(item)} className="text-xs bg-white/10 text-white px-3 py-1 rounded hover:bg-white/20">View</button>
                      </td>
                    </>
                  )}
                  {activeTab === 'members' && (
                    <>
                      <td className="py-4 pr-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt={item.full_name || ''} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-white/30 font-bold">{item.full_name?.charAt(0) || item.username?.charAt(0) || '?'}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.full_name}</div>
                          <div className="text-white/50 text-xs">@{item.username}</div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">{item.email}</td>
                      <td className="py-4 pr-4">
                        <span className="px-2 py-1 rounded text-xs uppercase font-bold bg-green-500/20 text-green-400">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {appAccess.filter(a => a.member_id === item.id && a.status === 'active').map(a => (
                            <span key={a.id} className="bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs">
                              {a.aura_apps?.name}
                            </span>
                          ))}
                          {appAccess.filter(a => a.member_id === item.id && a.status === 'active').length === 0 && (
                            <span className="text-white/30 text-xs italic">No active apps</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <button
                          onClick={() => openManageAccess(item)}
                          className="bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Manage Access
                        </button>
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
                      <td className="py-4 pr-4 cursor-pointer" onClick={() => openMessage(item)}>
                        <div className="flex items-center gap-2">
                           {item.status === 'unread' && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                           <div>
                             <div className={`font-medium ${item.status === 'unread' ? 'text-white' : 'text-white/70'}`}>{item.name}</div>
                             <div className="text-white/40 text-xs">{item.email}</div>
                           </div>
                        </div>
                      </td>
                      <td className={`py-4 pr-4 cursor-pointer max-w-[150px] truncate ${item.status === 'unread' ? 'text-white font-medium' : 'text-white/70'}`} onClick={() => openMessage(item)}>
                        {item.subject}
                      </td>
                      <td className="py-4 pr-4 cursor-pointer text-white/50 max-w-[200px] truncate" onClick={() => openMessage(item)}>
                        {item.message}
                      </td>
                      <td className="py-4 pr-4 cursor-pointer" onClick={() => openMessage(item)}>
                        <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${
                          item.status === 'unread' ? 'bg-amber-500/20 text-amber-400' :
                          item.status === 'replied' ? 'bg-green-500/20 text-green-400' :
                          item.status === 'archived' ? 'bg-white/10 text-white/40' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 cursor-pointer text-white/50 whitespace-nowrap text-sm" onClick={() => openMessage(item)}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
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
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${viewingApp.status === 'accepted' ? 'bg-green-500/20 text-green-400' : viewingApp.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {viewingApp.status.replace('_', ' ')}
                </span>
              </div>
              
              <div>
                <span className="text-white/50 text-sm block mb-1">Change Status</span>
                <select 
                  className="bg-black/50 border border-white/10 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-amber-500"
                  value={viewingApp.status}
                  onChange={(e) => triggerSingleUpdate(viewingApp.id, viewingApp.user_id, e.target.value)}
                >
                  <option value="under_review">Under Review</option>
                  <option value="accepted">Accepted</option>
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


      {viewingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">{viewingMessage.subject}</h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    viewingMessage.status === 'unread' ? 'bg-amber-500/20 text-amber-400' :
                    viewingMessage.status === 'replied' ? 'bg-green-500/20 text-green-400' :
                    viewingMessage.status === 'archived' ? 'bg-white/10 text-white/40' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {viewingMessage.status}
                  </span>
                  <span className="text-white/40">{new Date(viewingMessage.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingMessage(null)}
                className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 bg-white/[0.02] border-b border-white/5 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                   <Mail className="w-5 h-5 text-white/50" />
                 </div>
                 <div>
                   <div className="text-white font-medium">{viewingMessage.name}</div>
                   <div className="text-white/50 text-sm">{viewingMessage.email}</div>
                 </div>
               </div>
               <a 
                 href={`mailto:${viewingMessage.email}?subject=Re: ${viewingMessage.subject}`}
                 onClick={() => {
                   if (viewingMessage.status !== 'replied') {
                     updateMessageStatus(viewingMessage.id, 'replied');
                   }
                 }}
                 className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
               >
                 <Reply className="w-4 h-4" /> Reply
               </a>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <p className="text-white/80 whitespace-pre-wrap leading-relaxed">
                {viewingMessage.message}
              </p>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-black/50 flex flex-wrap gap-2 justify-between items-center">
               <div className="flex gap-2">
                 {viewingMessage.status !== 'unread' && (
                   <button onClick={() => updateMessageStatus(viewingMessage.id, 'unread')} className="px-3 py-1.5 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-white transition-colors">
                     Mark Unread
                   </button>
                 )}
                 {viewingMessage.status !== 'read' && viewingMessage.status !== 'unread' && (
                   <button onClick={() => updateMessageStatus(viewingMessage.id, 'read')} className="px-3 py-1.5 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-white transition-colors">
                     Mark Read
                   </button>
                 )}
                 {viewingMessage.status !== 'archived' ? (
                   <button onClick={() => updateMessageStatus(viewingMessage.id, 'archived')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-white transition-colors">
                     <Archive className="w-3 h-3" /> Archive
                   </button>
                 ) : (
                   <button onClick={() => updateMessageStatus(viewingMessage.id, 'read')} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-white/5 hover:bg-white/10 text-white transition-colors">
                     Restore
                   </button>
                 )}
               </div>
               
               <button onClick={() => deleteMessage(viewingMessage.id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors">
                 <Trash2 className="w-3 h-3" /> Delete
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal (Replaces window.confirm/prompt) */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Confirm Action</h2>
              <p className="text-white/50 text-sm mt-1">
                {confirmAction.type === 'bulk' 
                  ? `Are you sure you want to mark ${selectedApps.size} application(s) as ${confirmAction.status.replace('_', ' ')}?`
                  : `Are you sure you want to mark this application as ${confirmAction.status.replace('_', ' ')}?`}
              </p>
            </div>
            
            {confirmAction.status === 'rejected' && (
              <div className="p-6">
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Rejection Reason (Optional)
                </label>
                <textarea 
                  className="w-full bg-black/50 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-amber-500 min-h-[100px]"
                  placeholder="Explain why the application was rejected..."
                  value={actionReason}
                  onChange={e => setActionReason(e.target.value)}
                />
              </div>
            )}
            
            <div className="p-6 border-t border-white/10 flex gap-4">
              <button 
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmAction.type === 'bulk') {
                    executeBulkUpdate(confirmAction.status, actionReason);
                  } else if (confirmAction.appId && confirmAction.userId) {
                    executeSingleUpdate(confirmAction.appId, confirmAction.userId, confirmAction.status, actionReason);
                  }
                  setConfirmAction(null);
                }}
                className={`flex-1 px-4 py-3 font-bold rounded-xl transition-colors text-black ${
                  confirmAction.status === 'rejected' ? 'bg-red-500 hover:bg-red-600' :
                  confirmAction.status === 'accepted' ? 'bg-green-500 hover:bg-green-600' :
                  'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Access Modal */}
      {managingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">Manage App Access</h2>
                <p className="text-white/50 text-sm mt-1">Assign working apps for {managingMember.full_name}</p>
              </div>
              <button 
                onClick={() => setManagingMember(null)}
                className="text-white/50 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {auraApps.map(app => {
                const isSelected = selectedAccess[app.id] === 'active';
                return (
                  <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">{app.name}</span>
                      <span className="text-white/40 text-xs">Working App Status: {isSelected ? 'Active' : 'No Access'}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox"
                        className="sr-only peer"
                        checked={isSelected}
                        onChange={(e) => {
                          setSelectedAccess(prev => ({
                            ...prev,
                            [app.id]: e.target.checked ? 'active' : 'revoked'
                          }));
                        }}
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                );
              })}
              
              {auraApps.length === 0 && (
                <div className="text-white/50 text-center py-4">No working apps configured in the system.</div>
              )}
            </div>
            
            <div className="p-6 border-t border-white/10 shrink-0 flex gap-4">
              <button 
                onClick={() => setManagingMember(null)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAccess}
                disabled={loadingData}
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold rounded-xl transition-colors"
              >
                {loadingData ? 'Saving...' : 'Save Working Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
