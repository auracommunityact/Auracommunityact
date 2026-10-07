import React, { useState } from 'react';
import { useAudioPlayer, RepeatMode } from '../../contexts/AudioPlayerContext';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, 
  VolumeX, ChevronDown, ListMusic, Music, ExternalLink, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import QueuePanel from './QueuePanel';

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function MobileFullPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    queue,
    isExpandedMobile,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
    setIsExpandedMobile,
  } = useAudioPlayer();

  const [showQueueInModal, setShowQueueInModal] = useState(false);

  if (!isExpandedMobile || !currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const getRepeatIcon = (mode: RepeatMode) => {
    if (mode === 'one') {
      return (
        <span className="relative inline-flex items-center justify-center text-amber-400">
          <Repeat className="w-5 h-5" />
          <span className="absolute text-[8px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">1</span>
        </span>
      );
    }
    return (
      <Repeat
        className={`w-5 h-5 ${
          mode === 'all' ? 'text-amber-400' : 'text-white/40'
        }`}
      />
    );
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-b from-[#14151f] via-[#0b0c10] to-[#050507] text-white flex flex-col justify-between overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-purple-600/20 blur-[100px] rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-10 px-4 pt-4 pb-2 flex items-center justify-between border-b border-white/5">
        <button
          onClick={() => setIsExpandedMobile(false)}
          className="p-2 -ml-2 text-white/70 hover:text-white rounded-full active:bg-white/10 transition-colors"
          title="Minimize player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center min-w-0 px-2">
          <p className="text-[11px] uppercase tracking-wider text-amber-400/90 font-semibold flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aura Music Studio
          </p>
          <p className="text-xs text-white/50 truncate max-w-[200px]">
            {currentTrack.release_title}
          </p>
        </div>

        <button
          onClick={() => setShowQueueInModal(!showQueueInModal)}
          className={`p-2 -mr-2 rounded-full relative transition-colors ${
            showQueueInModal
              ? 'text-amber-400 bg-amber-500/10'
              : 'text-white/70 hover:text-white active:bg-white/10'
          }`}
          title="Toggle queue"
        >
          <ListMusic className="w-5 h-5" />
          {queue.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
              {queue.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Body Area: Content or Queue */}
      <div className="relative z-10 flex-1 px-6 py-4 flex flex-col justify-center min-h-0 overflow-y-auto">
        {showQueueInModal ? (
          <div className="w-full h-full max-h-[500px]">
            <QueuePanel onClose={() => setShowQueueInModal(false)} isMobileModal={true} />
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-sm mx-auto w-full">
            {/* Artwork Container */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-auto aspect-square rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/10 group">
              {currentTrack.artwork_url ? (
                <img
                  src={currentTrack.artwork_url}
                  alt={currentTrack.release_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <Music className="w-16 h-16 text-white/30" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="w-full mt-6 text-left">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
                    {currentTrack.track_title || currentTrack.release_title}
                  </h2>
                  <p className="text-sm sm:text-base text-amber-400/90 font-medium truncate mt-0.5">
                    {currentTrack.artist}
                    {currentTrack.featuring_artist && (
                      <span className="text-white/50"> feat. {currentTrack.featuring_artist}</span>
                    )}
                  </p>
                </div>
                {currentTrack.version && (
                  <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-white/10 text-white/70 text-[11px] font-medium border border-white/10">
                    {currentTrack.version}
                  </span>
                )}
              </div>

              {/* Badges / Legal */}
              <div className="flex items-center gap-3 mt-2 text-[11px] text-white/40">
                <span>{currentTrack.genre}</span>
                <span>•</span>
                <span>{currentTrack.release_type.toUpperCase()}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-white/50">
                  <Shield className="w-3 h-3 text-amber-400" />
                  {currentTrack.c_line || 'Aura Music Studio'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls & Scrubber Footer */}
      <div className="relative z-10 px-6 pb-8 pt-2 border-t border-white/5 bg-black/30 backdrop-blur-md">
        {/* Scrubber & Timers */}
        <div className="mb-4">
          <div className="relative w-full h-3 flex items-center group cursor-pointer">
            <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeekChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-white/50 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="flex items-center justify-between max-w-xs mx-auto mb-6">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              isShuffle ? 'text-amber-400 bg-amber-500/10' : 'text-white/40 hover:text-white'
            }`}
            title={isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={playPrevious}
            className="p-3 text-white/80 hover:text-white active:scale-95 transition-all"
            title="Previous track"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-xl shadow-amber-500/25 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-black" />
            ) : (
              <Play className="w-7 h-7 fill-black ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-3 text-white/80 hover:text-white active:scale-95 transition-all"
            title="Next track"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'bg-amber-500/10' : 'hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {getRepeatIcon(repeatMode)}
          </button>
        </div>

        {/* Volume & Bottom links */}
        <div className="flex items-center justify-between gap-4 max-w-sm mx-auto pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={toggleMute}
              className="text-white/50 hover:text-white"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-amber-500 h-1 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          <Link
            to={`/music/${currentTrack.id}`}
            onClick={() => setIsExpandedMobile(false)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <span>Release Details</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
