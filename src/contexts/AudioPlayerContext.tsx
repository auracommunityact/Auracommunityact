import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { MusicRelease } from '../types/music';
import { musicService } from '../lib/musicService';

export type RepeatMode = 'off' | 'all' | 'one';

interface AudioPlayerContextType {
  currentTrack: MusicRelease | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isLooping: boolean;
  isShuffle: boolean;
  queue: MusicRelease[];
  queueIndex: number;
  isExpandedMobile: boolean;
  isQueueOpen: boolean;
  
  // Controls
  playTrack: (track: MusicRelease, customQueue?: MusicRelease[]) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: MusicRelease) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setIsExpandedMobile: (open: boolean) => void;
  setIsQueueOpen: (open: boolean) => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<MusicRelease | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const [queue, setQueue] = useState<MusicRelease[]>([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Persistent HTML5 Audio instance
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPositionUpdateRef = useRef<number>(0);

  // Keep state refs for Media Session handlers and event listeners to prevent stale closures
  const stateRef = useRef({
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    repeatMode,
    isShuffle,
    queue,
    queueIndex,
  });

  useEffect(() => {
    stateRef.current = {
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      repeatMode,
      isShuffle,
      queue,
      queueIndex,
    };
  }, [currentTrack, isPlaying, currentTime, duration, repeatMode, isShuffle, queue, queueIndex]);

  // Direct play audio helper
  const executePlay = useCallback((audio: HTMLAudioElement) => {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch((error) => {
          // If auto-play was blocked or aborted, wait for next user action
          console.warn('Playback request error/handled:', error);
          setIsPlaying(false);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
          }
        });
    }
  }, []);

  // Update Media Session Position State (with throttling)
  const syncPositionState = useCallback((pos: number, dur: number) => {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    if (dur <= 0 || isNaN(dur)) return;

    const now = Date.now();
    if (now - lastPositionUpdateRef.current < 800) return; // limit to once every 800ms
    lastPositionUpdateRef.current = now;

    try {
      navigator.mediaSession.setPositionState({
        duration: Math.max(0, dur),
        playbackRate: audioRef.current?.playbackRate || 1,
        position: Math.min(Math.max(0, pos), dur),
      });
    } catch {
      // Ignore errors when position or duration is changing dynamically
    }
  }, []);

  // Play a specific track helper by reference
  const loadAndPlayTrack = useCallback((track: MusicRelease) => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTrack(track);
    audio.src = track.audio_url;
    audio.currentTime = 0;
    setCurrentTime(0);

    // Update Media Session Metadata immediately
    if ('mediaSession' in navigator && window.MediaMetadata) {
      const title = track.track_title || track.release_title;
      const artist = track.featuring_artist
        ? `${track.artist} feat. ${track.featuring_artist}`
        : track.artist;
      const album = track.release_title || 'Aura Music Studio';
      const artworkUrl = track.artwork_url || '';

      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: artworkUrl
          ? [
              { src: artworkUrl, sizes: '96x96', type: 'image/jpeg' },
              { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' },
              { src: artworkUrl, sizes: '192x192', type: 'image/jpeg' },
              { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
              { src: artworkUrl, sizes: '384x384', type: 'image/jpeg' },
              { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
            ]
          : [],
      });
    }

    executePlay(audio);
  }, [executePlay]);

  // Play Next Track logic
  const playNext = useCallback(async () => {
    const { queue: currentQ, queueIndex: currIdx, repeatMode: repMode, isShuffle: shuffle } = stateRef.current;

    if (currentQ.length === 0) {
      // No active queue: try to fetch next published track from catalog
      try {
        const published = await musicService.getPublishedReleases();
        if (published.length > 0) {
          const currentId = stateRef.current.currentTrack?.id;
          const foundIdx = published.findIndex((p) => p.id === currentId);
          const nextIdx = foundIdx >= 0 && foundIdx < published.length - 1 ? foundIdx + 1 : 0;
          setQueue(published);
          setQueueIndex(nextIdx);
          loadAndPlayTrack(published[nextIdx]);
        }
      } catch (err) {
        console.error('Failed to load next track from catalog:', err);
      }
      return;
    }

    if (shuffle && currentQ.length > 1) {
      // Pick random different track
      let randomIdx = Math.floor(Math.random() * currentQ.length);
      if (randomIdx === currIdx) {
        randomIdx = (currIdx + 1) % currentQ.length;
      }
      setQueueIndex(randomIdx);
      loadAndPlayTrack(currentQ[randomIdx]);
      return;
    }

    const nextIndex = currIdx + 1;
    if (nextIndex < currentQ.length) {
      setQueueIndex(nextIndex);
      loadAndPlayTrack(currentQ[nextIndex]);
    } else if (repMode === 'all') {
      // Loop back to start
      setQueueIndex(0);
      loadAndPlayTrack(currentQ[0]);
    } else {
      // End of queue: stop playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    }
  }, [loadAndPlayTrack]);

  // Play Previous Track logic
  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // If more than 3 seconds in, restart current track
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      executePlay(audio);
      return;
    }

    const { queue: currentQ, queueIndex: currIdx } = stateRef.current;
    if (currIdx > 0 && currentQ.length > 0) {
      const prevIdx = currIdx - 1;
      setQueueIndex(prevIdx);
      loadAndPlayTrack(currentQ[prevIdx]);
    } else if (currentQ.length > 0 && stateRef.current.repeatMode === 'all') {
      const lastIdx = currentQ.length - 1;
      setQueueIndex(lastIdx);
      loadAndPlayTrack(currentQ[lastIdx]);
    } else {
      // Restart current track
      audio.currentTime = 0;
      setCurrentTime(0);
      executePlay(audio);
    }
  }, [executePlay, loadAndPlayTrack]);

  // Initialize Persistent Audio Element & Media Session Handlers
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';

    // Mobile background media playback attributes
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');

    const handleLoadedMetadata = () => {
      const dur = audio.duration || 0;
      setDuration(dur);
      syncPositionState(audio.currentTime, dur);
    };

    const handleTimeUpdate = () => {
      const cur = audio.currentTime || 0;
      setCurrentTime(cur);
      syncPositionState(cur, audio.duration || 0);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const handlePause = () => {
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    const handleEnded = () => {
      const { repeatMode: repMode } = stateRef.current;
      if (repMode === 'one') {
        audio.currentTime = 0;
        executePlay(audio);
      } else {
        playNext();
      }
    };

    const handleError = (e: Event) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Setup Media Session API Action Handlers
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          if (audioRef.current) {
            executePlay(audioRef.current);
          }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
          playPrevious();
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          playNext();
        });

        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skip = details.seekOffset || 10;
          if (audioRef.current) {
            const newPos = Math.max(0, audioRef.current.currentTime - skip);
            audioRef.current.currentTime = newPos;
            setCurrentTime(newPos);
          }
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skip = details.seekOffset || 10;
          if (audioRef.current) {
            const dur = audioRef.current.duration || 0;
            const newPos = Math.min(dur, audioRef.current.currentTime + skip);
            audioRef.current.currentTime = newPos;
            setCurrentTime(newPos);
          }
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && audioRef.current) {
            const dur = audioRef.current.duration || 0;
            const newPos = Math.min(dur, Math.max(0, details.seekTime));
            audioRef.current.currentTime = newPos;
            setCurrentTime(newPos);
          }
        });

        navigator.mediaSession.setActionHandler('stop', () => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          setIsPlaying(false);
          setCurrentTime(0);
        });
      } catch (err) {
        console.warn('Failed to register MediaSession action handlers:', err);
      }
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [executePlay, playNext, playPrevious, syncPositionState, volume]);

  // User Action: Play Track
  const playTrack = useCallback(
    (track: MusicRelease, customQueue?: MusicRelease[]) => {
      const audio = audioRef.current;
      if (!audio) return;

      if (customQueue && customQueue.length > 0) {
        setQueue(customQueue);
        const idx = customQueue.findIndex((item) => item.id === track.id);
        setQueueIndex(idx >= 0 ? idx : 0);
      } else {
        // If track is not in current queue, add it
        setQueue((prev) => {
          const exists = prev.findIndex((item) => item.id === track.id);
          if (exists >= 0) {
            setQueueIndex(exists);
            return prev;
          }
          const next = [...prev, track];
          setQueueIndex(next.length - 1);
          return next;
        });
      }

      // If already playing this track, toggle play
      if (currentTrack?.id === track.id) {
        if (!isPlaying) {
          executePlay(audio);
        }
        return;
      }

      loadAndPlayTrack(track);
    },
    [currentTrack?.id, executePlay, isPlaying, loadAndPlayTrack]
  );

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const resumeTrack = useCallback(() => {
    if (audioRef.current) {
      executePlay(audioRef.current);
    }
  }, [executePlay]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
    } else {
      executePlay(audio);
    }
  }, [currentTrack, executePlay, isPlaying]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) {
      const dur = audio.duration || 0;
      const clamped = Math.max(0, Math.min(dur, time));
      audio.currentTime = clamped;
      setCurrentTime(clamped);
      if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && dur > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: dur,
            playbackRate: audio.playbackRate || 1,
            position: clamped,
          });
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => !prev);
  }, []);

  const addToQueue = useCallback((track: MusicRelease) => {
    setQueue((prev) => {
      if (prev.some((t) => t.id === track.id)) return prev;
      return [...prev, track];
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setQueueIndex((curr) => {
        if (index < curr) return curr - 1;
        if (index === curr && curr >= updated.length) return Math.max(0, updated.length - 1);
        return curr;
      });
      return updated;
    });
  }, []);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  }, [currentTrack]);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setCurrentTime(0);
    setDuration(0);
    setIsExpandedMobile(false);
    setIsQueueOpen(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
      navigator.mediaSession.metadata = null;
    }
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isLooping: repeatMode === 'one' || repeatMode === 'all',
        isShuffle,
        queue,
        queueIndex,
        isExpandedMobile,
        isQueueOpen,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleLoop: toggleRepeat,
        toggleShuffle,
        playNext,
        playPrevious,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setIsExpandedMobile,
        setIsQueueOpen,
        closePlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}
