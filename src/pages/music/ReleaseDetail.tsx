import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Play, Pause, ArrowLeft, Disc, Volume2, VolumeX, Repeat, 
  ExternalLink, Calendar, Music, Shield, Info, Share2, Check
} from 'lucide-react';
import { musicService } from '../../lib/musicService';
import { MusicRelease } from '../../types/music';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { formatTime } from '../../components/music/StickyAudioPlayer';
import { toast } from 'react-hot-toast';

export default function ReleaseDetail() {
  const { id } = useParams<{ id: string }>();
  const [release, setRelease] = useState<MusicRelease | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    playTrack,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleLoop,
  } = useAudioPlayer();

  useEffect(() => {
    if (id) {
      loadRelease(id);
    }
  }, [id]);

  const loadRelease = async (releaseId: string) => {
    setLoading(true);
    try {
      const data = await musicService.getReleaseById(releaseId);
      setRelease(data);
    } catch (err) {
      console.error('Error loading release:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCurrentTrack = release && currentTrack?.id === release.id;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const handlePlayToggle = () => {
    if (!release) return;
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(release);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Release link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const progressPercent = isCurrentTrack && duration > 0 ? (currentTime / duration) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white pt-32 pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading release details...</p>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="min-h-screen bg-[#070709] text-white pt-32 pb-24 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/40">
            <Music className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Release Not Found</h1>
          <p className="text-white/60 text-sm mb-6">
            The music release you are looking for does not exist or has not been published yet.
          </p>
          <Link
            to="/music"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Official platform links helper
  const platformLinks = [
    { name: 'Spotify', url: release.spotify_url, bg: 'hover:bg-[#1DB954]/20 hover:text-[#1DB954] hover:border-[#1DB954]/40' },
    { name: 'Apple Music', url: release.apple_music_url, bg: 'hover:bg-[#FA2D48]/20 hover:text-[#FA2D48] hover:border-[#FA2D48]/40' },
    { name: 'YouTube', url: release.youtube_url, bg: 'hover:bg-[#FF0000]/20 hover:text-[#FF0000] hover:border-[#FF0000]/40' },
    { name: 'YouTube Music', url: release.youtube_music_url, bg: 'hover:bg-[#FF0000]/20 hover:text-[#FF0000] hover:border-[#FF0000]/40' },
    { name: 'Amazon Music', url: release.amazon_music_url, bg: 'hover:bg-[#00A8E1]/20 hover:text-[#00A8E1] hover:border-[#00A8E1]/40' },
    { name: 'SoundCloud', url: release.soundcloud_url, bg: 'hover:bg-[#FF5500]/20 hover:text-[#FF5500] hover:border-[#FF5500]/40' },
    { name: 'Deezer', url: release.deezer_url, bg: 'hover:bg-[#A238FF]/20 hover:text-[#A238FF] hover:border-[#A238FF]/40' },
    { name: 'TIDAL', url: release.tidal_url, bg: 'hover:bg-[#000]/40 hover:text-white hover:border-white/40' },
    { name: 'Other Platform', url: release.other_url, bg: 'hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/40' },
  ].filter((p) => Boolean(p.url));

  return (
    <div className="min-h-screen bg-[#070709] text-white pt-24 pb-36">
      {/* Dynamic Background Blur from Artwork */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-25">
        <img
          src={release.artwork_url}
          alt=""
          className="w-full h-full object-cover blur-[140px] scale-125"
        />
        <div className="absolute inset-0 bg-[#070709]/85 backdrop-blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/music"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Music Catalog
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied' : 'Share'}
          </button>
        </div>

        {/* Hero Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl mb-10">
          {/* Cover Artwork */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-black/60 group">
              <img
                src={release.artwork_url}
                alt={release.release_title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40" />

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md border border-white/20 text-amber-400">
                  {release.release_type}
                </span>
              </div>
            </div>

            {/* Quick Badges below artwork */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center text-[11px] text-white/60">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                Genre: <span className="text-white font-medium">{release.genre}</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                Language: <span className="text-white font-medium">{release.language}</span>
              </span>
            </div>
          </div>

          {/* Release Info & Interactive Player */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                <Disc className="w-4 h-4 animate-spin-slow" />
                <span>Official Release</span>
                <span className="text-white/30">•</span>
                <span className="text-white/50">{release.release_type}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
                {release.track_title || release.release_title}
              </h1>

              {release.version && (
                <p className="text-sm sm:text-base font-medium text-amber-400/90 mb-3">
                  Version: {release.version}
                </p>
              )}

              <p className="text-lg sm:text-xl text-white/80 font-semibold mb-4">
                {release.artist}
                {release.featuring_artist && (
                  <span className="text-white/50 font-normal"> feat. {release.featuring_artist}</span>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 mb-8 pb-6 border-b border-white/10">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-400/70" />
                  Released: {new Date(release.release_date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {release.catalog_number && (
                  <span>Catalog: <strong className="text-white/80 font-mono">{release.catalog_number}</strong></span>
                )}
                {release.isrc && (
                  <span>ISRC: <strong className="text-white/80 font-mono">{release.isrc}</strong></span>
                )}
              </div>
            </div>

            {/* Interactive Audio Player Component */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-5 mb-6 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePlayToggle}
                    className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                    title={isThisPlaying ? 'Pause Track' : 'Play Track'}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-6 h-6 fill-black" />
                    ) : (
                      <Play className="w-6 h-6 fill-black ml-1" />
                    )}
                  </button>

                  <div>
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                      {isThisPlaying ? 'Now Playing' : 'Official Audio Preview'}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {release.track_title || release.release_title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleLoop}
                    className={`p-2 rounded-lg text-xs transition-colors ${
                      isLooping ? 'text-amber-400 bg-amber-500/10' : 'text-white/40 hover:text-white'
                    }`}
                    title={isLooping ? 'Disable Loop' : 'Enable Loop'}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-lg text-white/50 hover:text-white transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-16 accent-amber-500 cursor-pointer h-1 rounded-lg bg-white/20 hidden sm:block"
                    title="Volume"
                  />
                </div>
              </div>

              {/* Seekbar and Timeline */}
              <div className="space-y-1.5">
                <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max={isCurrentTrack ? duration || 100 : 100}
                    step="0.1"
                    value={isCurrentTrack ? currentTime : 0}
                    onChange={(e) => isCurrentTrack && seek(parseFloat(e.target.value))}
                    disabled={!isCurrentTrack}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex justify-between text-[11px] font-mono text-white/50">
                  <span>{isCurrentTrack ? formatTime(currentTime) : '0:00'}</span>
                  <span>{isCurrentTrack ? formatTime(duration) : 'Play Track'}</span>
                </div>
              </div>
            </div>

            {/* Official Streaming Links Section */}
            {platformLinks.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                  Official Streaming & Purchase Platforms
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {platformLinks.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/90 flex items-center gap-2 transition-all ${platform.bg}`}
                    >
                      <span>{platform.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-60" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description & Legal Metadata Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Description & Liner Notes */}
          <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              Release Notes & Credits
            </h2>
            {release.description ? (
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                {release.description}
              </p>
            ) : (
              <p className="text-white/40 text-sm italic">
                Official release distributed by Aura Music Studio. No additional liner notes provided for this release.
              </p>
            )}

            {release.publishing_info && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                  Publishing Information
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-mono">
                  {release.publishing_info}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Complete Rights & Copyright Details */}
          <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Catalog & Copyright Info
              </h2>

              <dl className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <dt className="text-white/50">℗ P Line</dt>
                  <dd className="font-semibold text-white text-right">{release.p_line || 'Aura Music Studio'}</dd>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <dt className="text-white/50">© C Line</dt>
                  <dd className="font-semibold text-white text-right">{release.c_line || 'Aura Music Studio'}</dd>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <dt className="text-white/50">Record Label</dt>
                  <dd className="font-semibold text-white text-right">{release.label || 'Aura Music Studio'}</dd>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <dt className="text-white/50">Copyright Owner</dt>
                  <dd className="font-semibold text-white text-right">{release.copyright_owner || 'Aura Music Studio'}</dd>
                </div>

                {release.catalog_number && (
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <dt className="text-white/50">Catalog Number</dt>
                    <dd className="font-mono text-white text-right">{release.catalog_number}</dd>
                  </div>
                )}

                {release.isrc && (
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <dt className="text-white/50">ISRC Code</dt>
                    <dd className="font-mono text-white text-right">{release.isrc}</dd>
                  </div>
                )}

                {release.upc_ean && (
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <dt className="text-white/50">UPC / EAN</dt>
                    <dd className="font-mono text-white text-right">{release.upc_ean}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center text-[11px] text-white/40">
              Official catalog entry for Aura Community Act ecosystem. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
