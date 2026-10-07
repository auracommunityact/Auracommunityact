import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, Repeat, Maximize2, X, Music } from 'lucide-react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function StickyAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleLoop,
    pauseTrack,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  return (
    <aside 
      aria-label="Audio Player"
      className="fixed bottom-0 inset-x-0 z-50 bg-[#0a0a0c]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] text-white"
    >
      {/* Progress Bar Top Edge */}
      <div className="relative w-full h-1 bg-white/10 group cursor-pointer">
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
          title="Seek track"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Track Info & Artwork */}
        <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-xs">
          <Link
            to={`/music/${currentTrack.id}`}
            className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-white/10 group"
          >
            {currentTrack.artwork_url ? (
              <img
                src={currentTrack.artwork_url}
                alt={currentTrack.release_title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-white/40">
                <Music className="w-5 h-5" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </Link>

          <div className="min-w-0">
            <Link
              to={`/music/${currentTrack.id}`}
              className="text-sm font-bold text-white hover:text-amber-400 transition-colors truncate block"
            >
              {currentTrack.track_title || currentTrack.release_title}
              {currentTrack.version && (
                <span className="text-xs text-white/50 font-normal ml-1.5">
                  ({currentTrack.version})
                </span>
              )}
            </Link>
            <p className="text-xs text-white/60 truncate">
              {currentTrack.artist}
              {currentTrack.featuring_artist && (
                <span className="text-white/40"> feat. {currentTrack.featuring_artist}</span>
              )}
            </p>
          </div>
        </div>

        {/* Center: Controls & Timeline */}
        <div className="flex-1 max-w-xl hidden sm:flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLoop}
              title={isLooping ? 'Disable Loop' : 'Enable Loop'}
              className={`p-1.5 rounded-full text-xs transition-colors ${
                isLooping ? 'text-amber-400 bg-amber-500/10' : 'text-white/40 hover:text-white'
              }`}
            >
              <Repeat className="w-4 h-4" />
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
          </div>

          <div className="w-full flex items-center gap-3 text-xs text-white/50 font-mono">
            <span>{formatTime(currentTime)}</span>
            <div className="relative flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mobile quick play button */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
          </button>
        </div>

        {/* Right: Volume & Details */}
        <div className="hidden md:flex items-center gap-4">
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

          <Link
            to={`/music/${currentTrack.id}`}
            className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>View Release</span>
          </Link>

          <button
            onClick={pauseTrack}
            className="text-white/40 hover:text-white transition-colors p-1"
            title="Close Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
