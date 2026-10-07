import React from 'react';
import { useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { Music, X, Play, Trash2, ListMusic } from 'lucide-react';
import { Link } from 'react-router-dom';

interface QueuePanelProps {
  onClose: () => void;
  isMobileModal?: boolean;
}

export default function QueuePanel({ onClose, isMobileModal = false }: QueuePanelProps) {
  const {
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = useAudioPlayer();

  return (
    <div
      className={`flex flex-col bg-[#0f1015] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl text-white ${
        isMobileModal
          ? 'w-full h-full'
          : 'w-80 sm:w-96 max-h-[460px] absolute bottom-20 right-4 z-50'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Play Queue</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
            {queue.length} {queue.length === 1 ? 'track' : 'tracks'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {queue.length > 1 && (
            <button
              onClick={clearQueue}
              className="text-xs text-white/50 hover:text-red-400 px-2 py-1 rounded transition-colors"
              title="Clear queue (keeps currently playing)"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Close queue"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 space-y-1">
        {queue.length === 0 ? (
          <div className="py-12 text-center text-white/40">
            <Music className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Queue is empty</p>
            <p className="text-xs mt-1">Play an official song from the catalog to start</p>
          </div>
        ) : (
          queue.map((track, idx) => {
            const isCurrent = currentTrack?.id === track.id || idx === queueIndex;

            return (
              <div
                key={`${track.id}-${idx}`}
                className={`group flex items-center justify-between gap-3 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-amber-500/15 border border-amber-500/30 text-white'
                    : 'hover:bg-white/[0.04] text-white/80'
                }`}
              >
                {/* Track Item & Artwork */}
                <button
                  onClick={() => playTrack(track, queue)}
                  className="flex items-center gap-3 min-w-0 flex-1 text-left"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-800 border border-white/10">
                    {track.artwork_url ? (
                      <img
                        src={track.artwork_url}
                        alt={track.release_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Music className="w-4 h-4 text-white/40" />
                      </div>
                    )}
                    {isCurrent && isPlaying ? (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                          <span className="w-0.5 h-2 bg-amber-400 animate-pulse delay-75" />
                          <span className="w-0.5 h-3.5 bg-amber-400 animate-pulse delay-150" />
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCurrent ? 'text-amber-300' : 'text-white'
                      }`}
                    >
                      {track.track_title || track.release_title}
                    </p>
                    <p className="text-[11px] text-white/50 truncate">
                      {track.artist}
                      {track.featuring_artist && (
                        <span> feat. {track.featuring_artist}</span>
                      )}
                    </p>
                  </div>
                </button>

                {/* Remove button */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/music/${track.id}`}
                    onClick={onClose}
                    className="p-1.5 text-white/40 hover:text-white rounded-lg transition-colors text-[10px]"
                    title="View details"
                  >
                    Info
                  </Link>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1.5 text-white/40 hover:text-red-400 rounded-lg transition-colors"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
