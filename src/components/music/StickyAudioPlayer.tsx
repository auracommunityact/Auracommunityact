import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, 
  VolumeX, Maximize2, X, Music, ListMusic, ChevronUp 
} from 'lucide-react';
import { useAudioPlayer, RepeatMode } from '../../contexts/AudioPlayerContext';
import QueuePanel from './QueuePanel';
import MobileFullPlayer, { formatTime } from './MobileFullPlayer';

export { formatTime };

export default function StickyAudioPlayer() {
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
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    playNext,
    playPrevious,
    closePlayer,
    setIsExpandedMobile,
  } = useAudioPlayer();

  const [showQueueDesktop, setShowQueueDesktop] = useState(false);

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const getRepeatIcon = (mode: RepeatMode) => {
    if (mode === 'one') {
      return (
        <span className="relative inline-flex items-center justify-center text-amber-400">
          <Repeat className="w-4 h-4" />
          <span className="absolute text-[7px] font-bold top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">1</span>
        </span>
      );
    }
    return (
      <Repeat
        className={`w-4 h-4 ${
          mode === 'all' ? 'text-amber-400' : 'text-white/40'
        }`}
      />
    );
  };

  return (
    <>
      {/* Mobile Full Player Drawer */}
      <MobileFullPlayer />

      {/* Persistent Audio Player Bar */}
      <aside
        aria-label="Audio Player"
        className="fixed bottom-0 inset-x-0 z-50 bg-[#0a0a0d]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.85)] text-white select-none transition-transform"
      >
        {/* Top Edge Progress Scrubber (Desktop & Mobile) */}
        <div className="relative w-full h-1 group cursor-pointer bg-white/10">
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeekChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Seek playback"
          />
        </div>

        {/* ========================================================================= */}
        {/* MOBILE MINI-PLAYER (Visible on mobile screens < 640px) */}
        {/* ========================================================================= */}
        <div className="sm:hidden px-3 py-2 flex items-center justify-between gap-3">
          {/* Tapping anywhere on the left section opens the Full Player */}
          <div
            onClick={() => setIsExpandedMobile(true)}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer active:opacity-80 transition-opacity"
          >
            <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-white/10 shadow-md">
              {currentTrack.artwork_url ? (
                <img
                  src={currentTrack.artwork_url}
                  alt={currentTrack.release_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white/40">
                  <Music className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {currentTrack.track_title || currentTrack.release_title}
              </p>
              <p className="text-[11px] text-white/60 truncate">
                {currentTrack.artist}
                {currentTrack.featuring_artist && (
                  <span> feat. {currentTrack.featuring_artist}</span>
                )}
              </p>
            </div>

            <ChevronUp className="w-4 h-4 text-white/40 shrink-0" />
          </div>

          {/* Quick Mobile Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={playPrevious}
              className="p-2 text-white/60 hover:text-white active:scale-95 transition-all"
              title="Previous"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="p-2 text-white/60 hover:text-white active:scale-95 transition-all"
              title="Next"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={closePlayer}
              className="p-1.5 text-white/40 hover:text-white transition-colors"
              title="Close player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP PLAYER (Visible on screens >= 640px) */}
        {/* ========================================================================= */}
        <div className="hidden sm:flex max-w-7xl mx-auto px-4 py-2.5 items-center justify-between gap-6">
          {/* Left: Track Info & Artwork */}
          <div className="flex items-center gap-3 min-w-0 max-w-[280px] lg:max-w-xs">
            <div className="relative group shrink-0">
              <Link
                to={`/music/${currentTrack.id}`}
                className="relative block w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 border border-white/10 shadow-md group"
                title="View release page"
              >
                {currentTrack.artwork_url ? (
                  <img
                    src={currentTrack.artwork_url}
                    alt={currentTrack.release_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white/40">
                    <Music className="w-5 h-5" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </Link>
            </div>

            <div className="min-w-0">
              <Link
                to={`/music/${currentTrack.id}`}
                className="text-sm font-bold text-white hover:text-amber-400 transition-colors truncate block"
              >
                {currentTrack.track_title || currentTrack.release_title}
                {currentTrack.version && (
                  <span className="text-xs text-white/40 font-normal ml-1.5">
                    ({currentTrack.version})
                  </span>
                )}
              </Link>
              <p className="text-xs text-white/60 truncate mt-0.5">
                {currentTrack.artist}
                {currentTrack.featuring_artist && (
                  <span className="text-white/40"> feat. {currentTrack.featuring_artist}</span>
                )}
              </p>
            </div>
          </div>

          {/* Center: Controls & Timeline */}
          <div className="flex-1 max-w-2xl flex flex-col items-center gap-1.5">
            {/* Buttons Row */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleShuffle}
                title={isShuffle ? 'Disable Shuffle' : 'Enable Shuffle'}
                className={`p-1.5 rounded-full transition-colors ${
                  isShuffle ? 'text-amber-400 bg-amber-500/10' : 'text-white/40 hover:text-white'
                }`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={playPrevious}
                title="Previous track"
                className="p-1.5 text-white/70 hover:text-white active:scale-95 transition-all"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-black" />
                ) : (
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                )}
              </button>

              <button
                onClick={playNext}
                title="Next track"
                className="p-1.5 text-white/70 hover:text-white active:scale-95 transition-all"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                title={`Repeat: ${repeatMode}`}
                className={`p-1.5 rounded-full transition-colors ${
                  repeatMode !== 'off' ? 'bg-amber-500/10' : 'hover:text-white'
                }`}
              >
                {getRepeatIcon(repeatMode)}
              </button>
            </div>

            {/* Timeline */}
            <div className="w-full flex items-center gap-3 text-xs text-white/50 font-mono">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="w-10">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: Queue, Volume, Fullscreen & Close */}
          <div className="flex items-center gap-3">
            {/* Queue Toggle Button */}
            <div className="relative">
              <button
                onClick={() => setShowQueueDesktop(!showQueueDesktop)}
                className={`relative p-2 rounded-lg border transition-colors ${
                  showQueueDesktop
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                }`}
                title="Play Queue"
              >
                <ListMusic className="w-4 h-4" />
                {queue.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-bold flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </button>

              {/* Floating Queue Panel */}
              {showQueueDesktop && (
                <QueuePanel onClose={() => setShowQueueDesktop(false)} isMobileModal={false} />
              )}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-white/60 hover:text-white transition-colors"
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
                className="w-20 accent-amber-500 cursor-pointer h-1 rounded-lg bg-white/20"
                title="Volume"
              />
            </div>

            {/* Expand / Release Link */}
            <button
              onClick={() => setIsExpandedMobile(true)}
              className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Expand full player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={closePlayer}
              className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              title="Close Player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
