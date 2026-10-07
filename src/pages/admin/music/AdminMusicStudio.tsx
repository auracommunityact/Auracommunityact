import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Copy, Eye, Clock, CheckCircle2, 
  Archive, Disc, Radio, RefreshCw, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MusicRelease, ReleaseStatus } from '../../../types/music';
import { musicService } from '../../../lib/musicService';
import ReleaseFormModal from './ReleaseFormModal';
import { useAuth } from '../../../contexts/AuthContext';
import { useAudioPlayer } from '../../../contexts/AudioPlayerContext';

export default function AdminMusicStudio() {
  const { user } = useAuth();
  const { playTrack } = useAudioPlayer();

  const [releases, setReleases] = useState<MusicRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelease, setEditingRelease] = useState<MusicRelease | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'release_date' | 'title'>('updated');

  // Confirmation Modal for Destructive Actions
  const [confirmModal, setConfirmModal] = useState<{
    action: 'delete' | 'archive' | 'unpublish';
    release: MusicRelease;
  } | null>(null);

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const data = await musicService.getAllReleasesAdmin();
      setReleases(data || []);
    } catch (err: any) {
      toast.error('Failed to load music releases: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Real database stats
  const stats = useMemo(() => {
    const total = releases.length;
    const drafts = releases.filter(r => r.status === 'draft').length;
    const scheduled = releases.filter(r => r.status === 'scheduled').length;
    const published = releases.filter(r => r.status === 'published').length;
    const archived = releases.filter(r => r.status === 'archived').length;

    return { total, drafts, scheduled, published, archived };
  }, [releases]);

  // Filtered & Sorted releases
  const filteredReleases = useMemo(() => {
    let list = [...releases];

    if (statusFilter !== 'all') {
      list = list.filter(r => r.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      list = list.filter(r => r.release_type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r => 
        (r.release_title || '').toLowerCase().includes(q) ||
        (r.track_title || '').toLowerCase().includes(q) ||
        (r.artist || '').toLowerCase().includes(q) ||
        (r.catalog_number || '').toLowerCase().includes(q) ||
        (r.isrc || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'updated') {
        return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
      } else if (sortBy === 'release_date') {
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      } else {
        return (a.release_title || '').localeCompare(b.release_title || '');
      }
    });

    return list;
  }, [releases, statusFilter, typeFilter, searchQuery, sortBy]);

  // Status Action Handlers
  const handleQuickPublish = async (release: MusicRelease) => {
    try {
      await musicService.updateStatus(release.id, 'published', null);
      toast.success(`Published "${release.release_title}"!`);
      fetchReleases();
    } catch (err: any) {
      toast.error('Failed to publish: ' + err.message);
    }
  };

  const handleDuplicate = async (release: MusicRelease) => {
    try {
      const copy = await musicService.duplicateRelease(release, user?.id);
      toast.success(`Duplicated "${release.release_title}" as Draft!`);
      fetchReleases();
    } catch (err: any) {
      toast.error('Failed to duplicate: ' + err.message);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmModal) return;
    const { action, release } = confirmModal;

    try {
      if (action === 'delete') {
        await musicService.deleteRelease(release.id);
        toast.success(`Deleted "${release.release_title}"`);
      } else if (action === 'archive') {
        await musicService.updateStatus(release.id, 'archived');
        toast.success(`Archived "${release.release_title}"`);
      } else if (action === 'unpublish') {
        await musicService.updateStatus(release.id, 'draft');
        toast.success(`Unpublished "${release.release_title}" back to Draft`);
      }
      fetchReleases();
    } catch (err: any) {
      toast.error(`Action failed: ` + err.message);
    } finally {
      setConfirmModal(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & New Release Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white">Aura Music Studio Releases</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Admin Catalog System
            </span>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Unlimited catalog management with automated RouteNote-inspired workflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReleases}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/10"
            title="Refresh releases"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setEditingRelease(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> New Release
          </button>
        </div>
      </div>

      {/* Real Database Release Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <span className="text-xs text-white/50 font-medium block">Total Releases</span>
          <span className="text-2xl font-black text-white mt-1 block">{stats.total}</span>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <span className="text-xs text-amber-400/80 font-medium block">Drafts</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{stats.drafts}</span>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <span className="text-xs text-blue-400/80 font-medium block">Scheduled</span>
          <span className="text-2xl font-black text-blue-400 mt-1 block">{stats.scheduled}</span>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
          <span className="text-xs text-green-400/80 font-medium block">Published</span>
          <span className="text-2xl font-black text-green-400 mt-1 block">{stats.published}</span>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-xl col-span-2 sm:col-span-1">
          <span className="text-xs text-white/40 font-medium block">Archived</span>
          <span className="text-2xl font-black text-white/50 mt-1 block">{stats.archived}</span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search title, artist, catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white/80 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          {/* Release Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white/80 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Types</option>
            <option value="single">Single</option>
            <option value="ep">EP</option>
            <option value="album">Album</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white/80 focus:outline-none focus:border-amber-500"
          >
            <option value="updated">Recently Updated</option>
            <option value="release_date">Release Date</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="py-20 text-center text-white/50 text-sm">
            Loading Aura Music Studio catalog...
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="py-20 text-center px-4">
            <Disc className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Releases Found</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto mb-6">
              {releases.length === 0
                ? 'Your music catalog is currently empty. Click "New Release" to upload and publish your first official track!'
                : 'No releases matched your search query or filter.'}
            </p>
            {releases.length === 0 && (
              <button
                onClick={() => {
                  setEditingRelease(null);
                  setIsModalOpen(true);
                }}
                className="px-5 py-2.5 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors"
              >
                + Create First Release
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white font-semibold bg-white/[0.02]">
                  <th className="py-3.5 px-4">Release</th>
                  <th className="py-3.5 px-4">Artist</th>
                  <th className="py-3.5 px-4">Release Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredReleases.map((release) => {
                  return (
                    <tr key={release.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Release Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-900 relative">
                            {release.artwork_url ? (
                              <img src={release.artwork_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/30">
                                <Disc className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white truncate block text-sm group-hover:text-amber-400 transition-colors">
                              {release.release_title}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                              <span className="uppercase font-semibold text-amber-400/80">
                                {release.release_type}
                              </span>
                              <span>•</span>
                              <span>{release.genre}</span>
                              {release.version && (
                                <>
                                  <span>•</span>
                                  <span>{release.version}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Artist Column */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-white/90">{release.artist}</span>
                        {release.featuring_artist && (
                          <span className="text-white/40 block text-[10px]">feat. {release.featuring_artist}</span>
                        )}
                      </td>

                      {/* Release Date Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-white/80">{release.release_date}</span>
                        {release.release_time && (
                          <span className="text-white/40 block text-[10px]">{release.release_time}</span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            release.status === 'published'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : release.status === 'scheduled'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : release.status === 'archived'
                              ? 'bg-white/10 text-white/50 border border-white/10'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {release.status === 'published' && <CheckCircle2 className="w-3 h-3" />}
                          {release.status === 'scheduled' && <Clock className="w-3 h-3" />}
                          {release.status}
                        </span>
                        {release.status === 'scheduled' && release.scheduled_for && (
                          <span className="text-[10px] text-white/40 block mt-0.5">
                            {new Date(release.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>

                      {/* Updated Column */}
                      <td className="py-3.5 px-4 text-white/40 text-[11px] whitespace-nowrap">
                        {new Date(release.updated_at || release.created_at).toLocaleDateString()}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Audio Preview action */}
                          <button
                            onClick={() => playTrack(release)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500 hover:text-black text-white/70 transition-colors"
                            title="Test Audio"
                          >
                            <Radio className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Publish if draft or scheduled */}
                          {release.status !== 'published' && (
                            <button
                              onClick={() => handleQuickPublish(release)}
                              className="px-2 py-1 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 text-[10px] font-semibold transition-colors"
                              title="Publish Immediately"
                            >
                              Publish
                            </button>
                          )}

                          {/* Unpublish if published */}
                          {release.status === 'published' && (
                            <button
                              onClick={() => setConfirmModal({ action: 'unpublish', release })}
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-semibold transition-colors"
                              title="Unpublish to Draft"
                            >
                              Unpublish
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingRelease(release);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title="Edit Release"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(release)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            title="Duplicate Release"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive */}
                          {release.status !== 'archived' && (
                            <button
                              onClick={() => setConfirmModal({ action: 'archive', release })}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                              title="Archive Release"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setConfirmModal({ action: 'delete', release })}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Delete Release"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Release Form Modal (Create / Edit) */}
      {isModalOpen && (
        <ReleaseFormModal
          initialRelease={editingRelease}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRelease(null);
          }}
          onSuccess={fetchReleases}
        />
      )}

      {/* Confirmation Modal for Destructive Actions */}
      {confirmModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111116] border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                confirmModal.action === 'delete' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white capitalize">
                  Confirm {confirmModal.action}
                </h3>
                <p className="text-xs text-white/50">
                  {confirmModal.action === 'delete'
                    ? 'Permanently delete this music release? This action cannot be undone.'
                    : confirmModal.action === 'archive'
                    ? 'Archive this release from public view while preserving database records?'
                    : 'Unpublish this song and revert status back to Draft?'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-white/80 font-medium">
              "{confirmModal.release.release_title}" by {confirmModal.release.artist}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedAction}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  confirmModal.action === 'delete'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                }`}
              >
                Confirm {confirmModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
