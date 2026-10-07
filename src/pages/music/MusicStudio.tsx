import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Disc, Search, Music, Shield, ExternalLink, Calendar, Radio, ListPlus } from 'lucide-react';
import { musicService } from '../../lib/musicService';
import { MusicRelease } from '../../types/music';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { toast } from 'react-hot-toast';

export default function MusicStudio() {
  const [releases, setReleases] = useState<MusicRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = useAudioPlayer();

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    setLoading(true);
    try {
      const data = await musicService.getPublishedReleases();
      setReleases(data || []);
    } catch (err) {
      console.error('Error fetching published releases:', err);
    } finally {
      setLoading(false);
    }
  };

  // Unique genres for filter
  const genres = useMemo(() => {
    const list = releases.map((r) => r.genre).filter(Boolean);
    return Array.from(new Set(list));
  }, [releases]);

  // Filtered releases
  const filteredReleases = useMemo(() => {
    return releases.filter((r) => {
      // Must be published and scheduled time reached
      if (r.status !== 'published') return false;
      if (r.scheduled_for && new Date(r.scheduled_for) > new Date()) return false;

      // Filter by type
      if (selectedType !== 'all' && r.release_type !== selectedType) return false;

      // Filter by genre
      if (selectedGenre !== 'all' && r.genre?.toLowerCase() !== selectedGenre.toLowerCase()) return false;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = (r.release_title || '').toLowerCase().includes(query);
        const matchTrack = (r.track_title || '').toLowerCase().includes(query);
        const matchArtist = (r.artist || '').toLowerCase().includes(query);
        const matchFeat = (r.featuring_artist || '').toLowerCase().includes(query);
        const matchGenre = (r.genre || '').toLowerCase().includes(query);
        if (!matchTitle && !matchTrack && !matchArtist && !matchFeat && !matchGenre) {
          return false;
        }
      }

      return true;
    });
  }, [releases, selectedType, selectedGenre, searchQuery]);

  const handleTrackPlay = (release: MusicRelease) => {
    if (currentTrack?.id === release.id) {
      togglePlay();
    } else {
      playTrack(release, filteredReleases);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white pt-24 pb-32">
      {/* Background ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase mb-6">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            Official Music Catalog
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Official Music by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">Aura Music Studio</span>
          </h1>

          <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-6">
            Explore the official music releases, original tracks, and official discography produced and distributed under Aura Music Studio and Aura Community Act.
          </p>

          {/* Brand Legal & Copyright Badges */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs text-white/50 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-2.5 backdrop-blur-md">
            <span className="flex items-center gap-1.5 font-medium text-white/70">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              ℗ P Line: Aura Music Studio
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="font-medium text-white/70">
              © C Line: Aura Music Studio
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="text-amber-400/90 font-semibold">
              Aura Community Act
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 sm:p-5 mb-10 backdrop-blur-xl flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search tracks, artists, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/70 transition-colors"
            />
          </div>

          {/* Filter Pills & Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Release Type filter */}
            <div className="flex rounded-xl bg-black/40 border border-white/10 p-1">
              {['all', 'single', 'ep', 'album'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    selectedType === type
                      ? 'bg-amber-500 text-black font-bold'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'All Releases' : type}
                </button>
              ))}
            </div>

            {/* Genre filter */}
            {genres.length > 0 && (
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Genres</option>
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="hidden sm:flex rounded-xl bg-black/40 border border-white/10 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                }`}
                title="Grid View"
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'
                }`}
                title="List View"
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Catalog Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm">Loading official music catalog...</p>
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="py-20 px-6 rounded-3xl bg-white/[0.02] border border-white/10 text-center max-w-xl mx-auto backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {releases.length === 0 ? 'No Published Songs Yet' : 'No Releases Found'}
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {releases.length === 0
                ? 'Official music tracks are being prepared in Aura Music Studio. Check back soon for brand new releases!'
                : 'No songs matched your current search filters. Try clearing the search or filters above.'}
            </p>
            {releases.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedGenre('all');
                }}
                className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReleases.map((release) => {
              const isCurrentPlaying = currentTrack?.id === release.id && isPlaying;
              return (
                <div
                  key={release.id}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/40 rounded-3xl p-4 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-amber-500/5 backdrop-blur-xl"
                >
                  {/* Artwork & Play Overlay */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/60 mb-4 border border-white/10">
                    <img
                      src={release.artwork_url}
                      alt={release.release_title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Type Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-amber-400">
                      {release.release_type}
                    </span>

                    {/* Genre Badge */}
                    {release.genre && (
                      <span className="absolute top-3 right-3 px-2 py-1 text-[10px] font-medium rounded-md bg-black/60 backdrop-blur-md text-white/80">
                        {release.genre}
                      </span>
                    )}

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => handleTrackPlay(release)}
                      className={`absolute inset-0 m-auto w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrentPlaying
                          ? 'bg-amber-400 text-black scale-100 opacity-100 shadow-xl shadow-amber-500/30'
                          : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90'
                      }`}
                      title={isCurrentPlaying ? 'Pause' : 'Play'}
                    >
                      {isCurrentPlaying ? (
                        <Pause className="w-6 h-6 fill-black" />
                      ) : (
                        <Play className="w-6 h-6 fill-black ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/music/${release.id}`}
                        className="text-base font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 block mb-1"
                        title={release.track_title || release.release_title}
                      >
                        {release.track_title || release.release_title}
                      </Link>

                      <p className="text-xs text-white/70 font-medium truncate mb-2">
                        {release.artist}
                        {release.featuring_artist && (
                          <span className="text-white/40"> feat. {release.featuring_artist}</span>
                        )}
                        {release.version && (
                          <span className="text-amber-400/80 text-[11px] ml-1.5">
                            ({release.version})
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-white/50">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-white/40" />
                        {new Date(release.release_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToQueue(release);
                            toast.success(`Added to Queue`);
                          }}
                          className="p-1.5 rounded-lg text-white/50 hover:text-amber-400 hover:bg-white/5 transition-colors"
                          title="Add to Play Queue"
                        >
                          <ListPlus className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/music/${release.id}`}
                          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-all text-xs ml-1"
                        >
                          Details <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="divide-y divide-white/5">
              {filteredReleases.map((release) => {
                const isCurrentPlaying = currentTrack?.id === release.id && isPlaying;
                return (
                  <div
                    key={release.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <button
                        onClick={() => handleTrackPlay(release)}
                        className={`w-12 h-12 rounded-xl relative shrink-0 overflow-hidden border border-white/10 group-hover:border-amber-500/40 transition-colors`}
                      >
                        <img
                          src={release.artwork_url}
                          alt={release.release_title}
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${
                            isCurrentPlaying ? 'opacity-100 bg-amber-500/80' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isCurrentPlaying ? (
                            <Pause className="w-5 h-5 text-black fill-black" />
                          ) : (
                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                          )}
                        </div>
                      </button>

                      <div className="min-w-0">
                        <Link
                          to={`/music/${release.id}`}
                          className="text-sm sm:text-base font-bold text-white hover:text-amber-400 transition-colors truncate block"
                        >
                          {release.track_title || release.release_title}
                          {release.version && (
                            <span className="text-xs text-white/50 font-normal ml-2">
                              ({release.version})
                            </span>
                          )}
                        </Link>
                        <p className="text-xs text-white/60 truncate">
                          {release.artist}
                          {release.featuring_artist && (
                            <span className="text-white/40"> feat. {release.featuring_artist}</span>
                          )}
                          <span className="text-white/30 mx-2">•</span>
                          <span className="uppercase text-[10px] tracking-wide text-amber-400 font-bold">
                            {release.release_type}
                          </span>
                          <span className="text-white/30 mx-2">•</span>
                          <span>{release.genre}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden md:inline text-xs text-white/40 font-mono">
                        {new Date(release.release_date).toLocaleDateString()}
                      </span>

                      <button
                        onClick={() => {
                          addToQueue(release);
                          toast.success(`Added to Queue`);
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-amber-400 transition-colors"
                        title="Add to Play Queue"
                      >
                        <ListPlus className="w-4 h-4" />
                      </button>

                      <Link
                        to={`/music/${release.id}`}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
