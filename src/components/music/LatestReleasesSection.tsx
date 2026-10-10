import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, Pause, Disc, Calendar, ArrowRight, ChevronLeft, ChevronRight, 
  Volume2, Music, ExternalLink, Sparkles, RefreshCw, Radio
} from 'lucide-react';
import { MusicRelease } from '../../types/music';
import { musicService } from '../../lib/musicService';
import { supabase } from '../../lib/supabase';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';

export default function LatestReleasesSection() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = useAudioPlayer();

  const [releases, setReleases] = useState<MusicRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch published releases
  const fetchPublishedReleases = useCallback(async () => {
    try {
      const data = await musicService.getPublishedReleases();
      // Ensure only strictly published releases are shown and sorted newest first
      const now = new Date();
      const validPublished = (data || []).filter(r => {
        if (r.status !== 'published') return false;
        if (r.scheduled_for && new Date(r.scheduled_for) > now) return false;
        return true;
      });

      // Sort newest first by release_date, then created_at
      validPublished.sort((a, b) => {
        const dateA = new Date(a.release_date).getTime();
        const dateB = new Date(b.release_date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      });

      setReleases(validPublished);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching published releases for homepage:', err);
      setError('Unable to load latest music releases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublishedReleases();

    // 1. Supabase Realtime Subscription
    let channel: any = null;
    try {
      channel = supabase
        .channel('public:music_releases_homepage')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'music_releases' },
          () => {
            fetchPublishedReleases();
          }
        )
        .subscribe();
    } catch (e) {
      // realtime setup notice
    }

    // 2. Custom local event listener for immediate same-session/admin tab updates
    const handleReleaseUpdated = () => {
      fetchPublishedReleases();
    };
    window.addEventListener('aura:music-release-updated', handleReleaseUpdated);

    // 3. Storage event listener for cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aura_music_release_updated_at') {
        fetchPublishedReleases();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 4. Window focus refetch
    const handleFocus = () => {
      fetchPublishedReleases();
    };
    window.addEventListener('focus', handleFocus);

    // 5. Periodic polling (every 30 seconds) for scheduled releases becoming published
    const pollInterval = setInterval(() => {
      fetchPublishedReleases();
    }, 30000);

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch (e) {}
      }
      window.removeEventListener('aura:music-release-updated', handleReleaseUpdated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(pollInterval);
    };
  }, [fetchPublishedReleases]);

  // Handle Play/Pause for a track
  const handlePlayToggle = (release: MusicRelease, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (currentTrack?.id === release.id) {
      togglePlay();
    } else {
      // Pass the entire list of published releases as the playlist queue
      playTrack(release, releases);
    }
  };

  // Carousel scroll helpers
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Format date helper
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Featured release is either the selected one or the very newest
  const featuredRelease = releases[activeFeaturedIndex] || releases[0] || null;
  const otherReleases = releases;

  const isFeaturedPlaying = featuredRelease && currentTrack?.id === featuredRelease.id && isPlaying;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" /> Aura Music Studio
            </span>
            <span className="text-white/40 text-xs">• Official Catalog</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-3">
            <span>🎵 Latest Releases</span>
          </h2>
          <p className="text-base sm:text-lg text-white/60 mt-2 max-w-2xl">
            Discover the latest music from Aura Music Studio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/music"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10"
          >
            Explore Music Studio 
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="relative rounded-3xl overflow-hidden bg-white/[0.02] border border-white/10 p-6 sm:p-10 animate-pulse">
          <div className="grid lg:grid-cols-[1.2fr_420px] gap-8 sm:gap-12 items-center">
            <div className="space-y-4">
              <div className="w-32 h-6 bg-white/10 rounded-full" />
              <div className="w-3/4 h-12 bg-white/10 rounded-2xl" />
              <div className="w-1/2 h-6 bg-white/5 rounded-xl" />
              <div className="w-full max-w-md h-16 bg-white/5 rounded-xl" />
              <div className="flex gap-4 pt-4">
                <div className="w-36 h-12 bg-white/10 rounded-xl" />
                <div className="w-36 h-12 bg-white/10 rounded-xl" />
              </div>
            </div>
            <div className="w-full aspect-square max-w-[380px] mx-auto bg-white/10 rounded-2xl" />
          </div>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchPublishedReleases()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* Empty State: No published releases in database yet */}
      {!loading && !error && releases.length === 0 && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0c0d12] via-[#09090c] to-[#120e18] border border-white/10 p-8 sm:p-12 text-center shadow-2xl">
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6 shadow-lg shadow-amber-500/10">
              <Disc className="w-8 h-8 animate-spin-slow" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Official Releases In Production
            </h3>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-8">
              Aura Music Studio is preparing upcoming original soundtracks, electronic music tracks, and collaborative releases. Once an authorized admin publishes a release, it will automatically appear here.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/music"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20 flex items-center gap-2"
              >
                <Music className="w-4 h-4" /> Visit Music Studio
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Populated State: Featured Banner + Releases Slider */}
      {!loading && !error && featuredRelease && (
        <div className="space-y-8">
          {/* Main Cinematic Promotional Banner */}
          <div 
            onClick={() => navigate(`/music/${featuredRelease.id}`)}
            className="group relative rounded-3xl overflow-hidden bg-[#09090d] border border-white/15 p-6 sm:p-10 lg:p-12 cursor-pointer shadow-2xl transition-all duration-300 hover:border-amber-500/30"
          >
            {/* Ambient Backdrop Blurred Artwork */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-3xl opacity-25 scale-125 pointer-events-none transition-transform duration-1000 group-hover:scale-130"
              style={{ backgroundImage: `url(${featuredRelease.artwork_url})` }}
            />
            {/* Dark gradient overlay for extreme contrast and readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#09090d]/90 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-transparent to-black/40 pointer-events-none" />

            {/* Glowing Accent Orbs */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 blur-[130px] rounded-full pointer-events-none" />

            {/* Banner Content Grid */}
            <div className="relative z-10 grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 lg:gap-12 items-center">
              {/* Left Column: Track Details and Actions */}
              <div className="flex flex-col justify-between h-full">
                <div>
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-black shadow-md shadow-amber-500/20 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 animate-pulse" /> Latest Release
                    </span>

                    <span className="text-white/60 text-xs font-semibold">
                      {featuredRelease.release_type.toUpperCase()}
                    </span>

                    <span className="text-white/30 text-xs">·</span>

                    <span className="text-white/60 text-xs font-semibold">
                      {featuredRelease.genre}
                    </span>

                    {featuredRelease.release_date && (
                      <>
                        <span className="text-white/30 text-xs">·</span>
                        <span className="text-white/50 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {formatDate(featuredRelease.release_date)}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Song Title */}
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                    {featuredRelease.track_title}
                  </h3>

                  {/* Track Version if present */}
                  {featuredRelease.version && (
                    <p className="text-sm font-semibold text-amber-400/90 tracking-wide uppercase mb-2">
                      ({featuredRelease.version})
                    </p>
                  )}

                  {/* Artist */}
                  <p className="text-lg sm:text-xl font-bold text-white/80 mb-4">
                    {featuredRelease.artist}
                    {featuredRelease.featuring_artist && (
                      <span className="text-white/50 font-normal text-base ml-2">
                        feat. {featuredRelease.featuring_artist}
                      </span>
                    )}
                  </p>

                  {/* Description Preview if present */}
                  {featuredRelease.description && (
                    <p className="text-white/65 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-2xl mb-6">
                      {featuredRelease.description}
                    </p>
                  )}

                  {/* Branding & Copyright */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mb-8 font-medium">
                    <span className="text-white/60">℗ {featuredRelease.p_line || 'Aura Music Studio'}</span>
                    <span>·</span>
                    <span className="text-white/60">© {featuredRelease.c_line || 'Aura Music Studio'}</span>
                    {featuredRelease.catalog_number && (
                      <>
                        <span>·</span>
                        <span>CAT: {featuredRelease.catalog_number}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {/* Play / Pause Button */}
                  <button
                    onClick={(e) => handlePlayToggle(featuredRelease, e)}
                    aria-label={isFeaturedPlaying ? 'Pause song' : 'Play song'}
                    className={`inline-flex items-center justify-center gap-3 px-7 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95 ${
                      isFeaturedPlaying
                        ? 'bg-amber-400 text-black shadow-amber-400/30'
                        : 'bg-white text-black hover:bg-amber-400 shadow-white/10'
                    }`}
                  >
                    {isFeaturedPlaying ? (
                      <>
                        <Pause className="w-5 h-5 fill-black" />
                        <span>Playing</span>
                        {/* Animated Equalizer bars */}
                        <span className="flex items-end gap-0.5 h-3.5 ml-1">
                          <span className="w-1 bg-black rounded-full animate-[bounce_1s_infinite_100ms] h-full" />
                          <span className="w-1 bg-black rounded-full animate-[bounce_1s_infinite_300ms] h-2/3" />
                          <span className="w-1 bg-black rounded-full animate-[bounce_1s_infinite_200ms] h-4/5" />
                        </span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-black ml-0.5" />
                        <span>Play Song</span>
                      </>
                    )}
                  </button>

                  {/* Listen Now Button */}
                  <Link
                    to={`/music/${featuredRelease.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-bold text-sm transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
                  >
                    <span>Listen Now</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>

                  {/* Streaming Platforms Preview Links */}
                  {(featuredRelease.spotify_url || featuredRelease.youtube_url || featuredRelease.apple_music_url) && (
                    <div className="flex items-center gap-2 pl-2">
                      {featuredRelease.spotify_url && (
                        <a
                          href={featuredRelease.spotify_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Listen on Spotify"
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#1DB954]/20 border border-white/10 hover:border-[#1DB954]/40 flex items-center justify-center text-white hover:text-[#1DB954] transition-colors"
                        >
                          <span className="text-xs font-black">SP</span>
                        </a>
                      )}
                      {featuredRelease.youtube_url && (
                        <a
                          href={featuredRelease.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Watch on YouTube"
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FF0000]/20 border border-white/10 hover:border-[#FF0000]/40 flex items-center justify-center text-white hover:text-[#FF0000] transition-colors"
                        >
                          <span className="text-xs font-black">YT</span>
                        </a>
                      )}
                      {featuredRelease.apple_music_url && (
                        <a
                          href={featuredRelease.apple_music_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Listen on Apple Music"
                          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-[#FC3C44]/20 border border-white/10 hover:border-[#FC3C44]/40 flex items-center justify-center text-white hover:text-[#FC3C44] transition-colors"
                        >
                          <span className="text-xs font-black">AM</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: High-Res Artwork Display */}
              <div className="relative group/art mx-auto w-full max-w-[340px] sm:max-w-[380px] lg:max-w-none">
                <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black/50">
                  <img
                    src={featuredRelease.artwork_url}
                    alt={featuredRelease.track_title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/art:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle vinyl groove shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 pointer-events-none" />

                  {/* Centered Play Button Overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] opacity-0 group-hover/art:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handlePlayToggle(featuredRelease, e)}
                      aria-label={isFeaturedPlaying ? 'Pause' : 'Play'}
                      className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
                    >
                      {isFeaturedPlaying ? (
                        <Pause className="w-8 h-8 fill-black" />
                      ) : (
                        <Play className="w-8 h-8 fill-black ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Brand watermarking in corner */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white/80 border border-white/10">
                    Aura Music Studio
                  </div>
                </div>

                {/* Ambient vinyl disc glow underneath artwork */}
                <div 
                  className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-3xl -z-10 opacity-60 group-hover/art:opacity-90 transition-opacity"
                  style={{
                    backgroundImage: `radial-gradient(circle, rgba(245,158,11,0.3) 0%, rgba(147,51,234,0.15) 100%)`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Multiple Releases Slider / Carousel: Only shown if 2 or more releases exist */}
          {otherReleases.length > 1 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Official Catalog Releases</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      {otherReleases.length} Tracks
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-white/50">
                    Swipe or use controls to browse all released songs
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollCarousel('left')}
                    aria-label="Scroll left"
                    className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    aria-label="Scroll right"
                    className="w-9 h-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Strip */}
              <div
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-1 no-scrollbar [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {otherReleases.map((release, index) => {
                  const isTrackPlaying = currentTrack?.id === release.id && isPlaying;
                  const isSelectedFeatured = featuredRelease.id === release.id;

                  return (
                    <div
                      key={release.id}
                      onClick={() => setActiveFeaturedIndex(index)}
                      className={`shrink-0 w-72 sm:w-80 snap-start rounded-2xl bg-white/[0.03] border transition-all duration-300 p-4 cursor-pointer hover:bg-white/[0.06] ${
                        isSelectedFeatured
                          ? 'border-amber-500/60 shadow-lg shadow-amber-500/10 bg-amber-500/[0.04]'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-black/40 group/card">
                        <img
                          src={release.artwork_url}
                          alt={release.track_title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handlePlayToggle(release, e)}
                            aria-label={isTrackPlaying ? 'Pause' : 'Play'}
                            className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-90"
                          >
                            {isTrackPlaying ? (
                              <Pause className="w-6 h-6 fill-black" />
                            ) : (
                              <Play className="w-6 h-6 fill-black ml-0.5" />
                            )}
                          </button>
                        </div>

                        {/* Playing Status Pill */}
                        {isTrackPlaying && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <Volume2 className="w-3 h-3 animate-pulse" /> Playing
                          </div>
                        )}

                        <div className="absolute bottom-2 left-2 text-[10px] font-semibold text-white/70">
                          {formatDate(release.release_date)}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-white text-base truncate group-hover:text-amber-400 transition-colors">
                            {release.track_title}
                          </h5>
                          <p className="text-xs text-white/60 truncate">
                            {release.artist}
                            {release.featuring_artist ? ` feat. ${release.featuring_artist}` : ''}
                          </p>
                        </div>

                        <Link
                          to={`/music/${release.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors shrink-0"
                          title="View release details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                        <span className="capitalize">{release.release_type} · {release.genre}</span>
                        <span className="text-amber-400 font-semibold hover:underline">
                          {isSelectedFeatured ? 'Viewing' : 'Feature'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
