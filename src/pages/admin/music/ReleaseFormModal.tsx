import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Upload, Play, Pause, Check, Disc, Music, Calendar, Clock, 
  Globe, Shield, ChevronRight, ChevronLeft, AlertCircle, FileText, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MusicRelease, ReleaseFormData, ReleaseType, ReleaseStatus } from '../../../types/music';
import { musicService } from '../../../lib/musicService';
import { useAuth } from '../../../contexts/AuthContext';

interface ReleaseFormModalProps {
  initialRelease?: MusicRelease | null;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  'Basic Info',
  'Artwork',
  'Audio Track',
  'Release Details',
  'Platform Links',
  'Description',
  'Review & Submit'
];

const GENRES = [
  'Electronic', 'Dance / EDM', 'Hip-Hop / Rap', 'Pop', 'Lo-Fi', 
  'Ambient', 'Cinematic / Soundtrack', 'Rock / Indie', 'Acoustic', 
  'R&B / Soul', 'Classical', 'Experimental', 'Gaming / Synthwave'
];

const LANGUAGES = [
  'English', 'Hindi', 'Instrumental', 'Punjabi', 'Spanish', 
  'French', 'Japanese', 'Korean', 'German', 'Other'
];

const TIMEZONES = [
  'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles', 
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney'
];

export default function ReleaseFormModal({ initialRelease, onClose, onSuccess }: ReleaseFormModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ReleaseFormData>({
    release_title: initialRelease?.release_title || '',
    track_title: initialRelease?.track_title || '',
    artist: initialRelease?.artist || '',
    featuring_artist: initialRelease?.featuring_artist || '',
    version: initialRelease?.version || '',
    genre: initialRelease?.genre || 'Electronic',
    language: initialRelease?.language || 'English',
    release_type: initialRelease?.release_type || 'single',

    artwork_url: initialRelease?.artwork_url || '',
    artwork_storage_path: initialRelease?.artwork_storage_path || '',

    audio_url: initialRelease?.audio_url || '',
    audio_storage_path: initialRelease?.audio_storage_path || '',

    release_date: initialRelease?.release_date || new Date().toISOString().split('T')[0],
    release_time: initialRelease?.release_time || '00:00',
    timezone: initialRelease?.timezone || 'Asia/Kolkata',
    catalog_number: initialRelease?.catalog_number || `AMS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    isrc: initialRelease?.isrc || '',
    upc_ean: initialRelease?.upc_ean || '',
    label: initialRelease?.label || 'Aura Music Studio',
    copyright_owner: initialRelease?.copyright_owner || 'Aura Music Studio',
    publishing_info: initialRelease?.publishing_info || 'Aura Community Act Music Publishing',
    c_line: initialRelease?.c_line || 'Aura Music Studio',
    p_line: initialRelease?.p_line || 'Aura Music Studio',

    youtube_url: initialRelease?.youtube_url || '',
    youtube_music_url: initialRelease?.youtube_music_url || '',
    spotify_url: initialRelease?.spotify_url || '',
    apple_music_url: initialRelease?.apple_music_url || '',
    amazon_music_url: initialRelease?.amazon_music_url || '',
    soundcloud_url: initialRelease?.soundcloud_url || '',
    deezer_url: initialRelease?.deezer_url || '',
    tidal_url: initialRelease?.tidal_url || '',
    other_url: initialRelease?.other_url || '',

    description: initialRelease?.description || '',

    status: initialRelease?.status || 'draft',
    scheduled_for: initialRelease?.scheduled_for || null,
  });

  // Upload States
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  // Audio preview in modal
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  const handleArtworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Artwork image size must be under 10MB');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP)');
      return;
    }

    setUploadingArtwork(true);
    try {
      const res = await musicService.uploadArtwork(file);
      setFormData(prev => ({
        ...prev,
        artwork_url: res.publicUrl,
        artwork_storage_path: res.storagePath
      }));
      toast.success('Cover artwork uploaded successfully!');
    } catch (err: any) {
      toast.error('Failed to upload artwork: ' + err.message);
    } finally {
      setUploadingArtwork(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Validate size (max 80MB)
    if (file.size > 80 * 1024 * 1024) {
      toast.error('Audio file size must be under 80MB');
      return;
    }

    setUploadingAudio(true);
    try {
      const res = await musicService.uploadAudio(file);
      setFormData(prev => ({
        ...prev,
        audio_url: res.publicUrl,
        audio_storage_path: res.storagePath
      }));
      toast.success('Audio file uploaded successfully!');
    } catch (err: any) {
      toast.error('Failed to upload audio file: ' + err.message);
    } finally {
      setUploadingAudio(false);
    }
  };

  const toggleAudioPreview = () => {
    if (!audioPreviewRef.current) return;
    if (previewPlaying) {
      audioPreviewRef.current.pause();
      setPreviewPlaying(false);
    } else {
      audioPreviewRef.current.play().then(() => setPreviewPlaying(true)).catch(e => console.error(e));
    }
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      if (!formData.release_title.trim()) {
        toast.error('Release title is required');
        return false;
      }
      if (!formData.track_title.trim()) {
        toast.error('Track title is required');
        return false;
      }
      if (!formData.artist.trim()) {
        toast.error('Main artist name is required');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.artwork_url.trim()) {
        toast.error('Cover artwork is required');
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.audio_url.trim()) {
        toast.error('Audio file is required');
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.release_date) {
        toast.error('Release date is required');
        return false;
      }
      if (!formData.label.trim()) {
        toast.error('Record label name is required');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const calculateScheduledTimestamp = (dateStr: string, timeStr?: string): string => {
    // Return ISO timestamp combining date and time
    const time = timeStr || '00:00';
    const combined = `${dateStr}T${time}:00`;
    try {
      const dt = new Date(combined);
      return dt.toISOString();
    } catch {
      return new Date(dateStr).toISOString();
    }
  };

  const handleSubmit = async (targetStatus: ReleaseStatus) => {
    // Validate required fields
    if (!formData.release_title.trim() || !formData.track_title.trim() || !formData.artist.trim()) {
      toast.error('Please complete the basic information');
      setCurrentStep(1);
      return;
    }
    if (!formData.artwork_url) {
      toast.error('Please upload cover artwork');
      setCurrentStep(2);
      return;
    }
    if (!formData.audio_url) {
      toast.error('Please upload the audio file');
      setCurrentStep(3);
      return;
    }

    setSubmitting(true);
    try {
      let finalScheduledFor: string | null = null;
      if (targetStatus === 'scheduled') {
        finalScheduledFor = calculateScheduledTimestamp(formData.release_date, formData.release_time);
      }

      const submissionData: ReleaseFormData = {
        ...formData,
        status: targetStatus,
        scheduled_for: finalScheduledFor,
      };

      if (initialRelease?.id) {
        // Update
        await musicService.updateRelease(initialRelease.id, submissionData);
        toast.success(`Release successfully updated as ${targetStatus}!`);
      } else {
        // Create
        await musicService.createRelease(submissionData, user?.id);
        toast.success(`New release created as ${targetStatus}!`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error('Failed to save release: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e0e12] border border-white/10 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-4">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Disc className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialRelease ? 'Edit Music Release' : 'Create New Music Release'}
              </h2>
              <p className="text-xs text-white/50">
                Aura Music Studio • RouteNote Workflow Architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Indicator */}
        <div className="px-6 py-3 border-b border-white/5 bg-black/40 overflow-x-auto shrink-0">
          <div className="flex items-center min-w-max gap-2 text-xs">
            {STEPS.map((stepName, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              return (
                <button
                  key={stepName}
                  onClick={() => {
                    if (stepNum < currentStep || validateCurrentStep()) {
                      setCurrentStep(stepNum);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : isDone
                      ? 'bg-white/10 text-white font-medium hover:bg-white/15'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent ? 'bg-black text-amber-400' : isDone ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10'
                  }`}>
                    {isDone ? <Check className="w-3 h-3 text-amber-400" /> : stepNum}
                  </span>
                  <span>{stepName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* STEP 1: BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 1 — Basic Information</h3>
                <p className="text-xs text-white/50">
                  Enter the core release metadata, title, artists, genre, and track classification.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Release Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Echoes of the Horizon"
                    value={formData.release_title}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      release_title: e.target.value,
                      track_title: prev.track_title || e.target.value 
                    }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Track Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Echoes of the Horizon"
                    value={formData.track_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, track_title: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Primary Artist *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shaan Mohammad / Aura Music Studio"
                    value={formData.artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Featuring Artist (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Guest Vocalist"
                    value={formData.featuring_artist}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuring_artist: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Version / Mix Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Original Mix, Radio Edit, Club Mix, Instrumental"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Release Type *
                  </label>
                  <select
                    value={formData.release_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, release_type: e.target.value as ReleaseType }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="single">Single (1 Track)</option>
                    <option value="ep">EP (Extended Play)</option>
                    <option value="album">Full Album</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Primary Genre *
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {GENRES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Audio / Track Language *
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ARTWORK */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 2 — Cover Artwork</h3>
                <p className="text-xs text-white/50">
                  Upload cover artwork directly from your device. Recommended: Square image (1400x1400 or higher), JPG/PNG format.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-white/20 hover:border-amber-500/50 rounded-2xl p-6 text-center transition-colors bg-white/[0.02]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArtworkUpload}
                    disabled={uploadingArtwork}
                    className="hidden"
                    id="artwork-upload-input"
                  />
                  <label
                    htmlFor="artwork-upload-input"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white block">
                        {uploadingArtwork ? 'Uploading to Supabase Storage...' : 'Click to Upload Cover Artwork'}
                      </span>
                      <span className="text-xs text-white/40 block mt-1">
                        PNG, JPEG, WebP up to 10MB
                      </span>
                    </div>
                    <span className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold rounded-full transition-colors">
                      Choose Image File
                    </span>
                  </label>
                </div>

                {/* Artwork Preview Card */}
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-2">
                    Artwork Preview
                  </label>
                  {formData.artwork_url ? (
                    <div className="relative aspect-square max-w-xs rounded-2xl overflow-hidden border border-white/20 shadow-xl bg-black">
                      <img
                        src={formData.artwork_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/80 backdrop-blur-md rounded-xl text-[11px] text-white/70 truncate border border-white/10">
                        Path: {formData.artwork_storage_path || 'Uploaded to Storage'}
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square max-w-xs rounded-2xl border border-white/10 bg-black/40 flex flex-col items-center justify-center text-white/30 p-6 text-center">
                      <Disc className="w-12 h-12 mb-2 stroke-1" />
                      <span className="text-xs">No artwork uploaded yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct URL input fallback */}
              <div className="pt-4 border-t border-white/10">
                <label className="block text-xs font-semibold text-white/50 mb-1">
                  Or specify direct Artwork URL (if hosted):
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.artwork_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, artwork_url: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: AUDIO FILE */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 3 — Master Audio Track</h3>
                <p className="text-xs text-white/50">
                  Upload the official master audio file from your device. Supported: MP3, WAV, FLAC, M4A, AAC.
                </p>
              </div>

              {/* Audio Upload Box */}
              <div className="border-2 border-dashed border-white/20 hover:border-amber-500/50 rounded-2xl p-8 text-center transition-colors bg-white/[0.02]">
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.flac,.m4a,.aac"
                  onChange={handleAudioUpload}
                  disabled={uploadingAudio}
                  className="hidden"
                  id="audio-upload-input"
                />
                <label
                  htmlFor="audio-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Music className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      {uploadingAudio ? 'Uploading audio to Supabase Storage...' : 'Click to Upload Audio File'}
                    </span>
                    <span className="text-xs text-white/40 block mt-1">
                      Direct upload to Supabase Storage (MP3, WAV, FLAC, M4A)
                    </span>
                  </div>
                  <span className="px-5 py-2.5 bg-amber-500 text-black text-xs font-bold rounded-full shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors">
                    Select Audio File
                  </span>
                </label>
              </div>

              {/* In-Form Audio Player Preview */}
              {formData.audio_url && (
                <div className="bg-black/50 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleAudioPreview}
                      className="w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      {previewPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                        Playable Audio Preview
                      </span>
                      <span className="text-sm font-bold text-white block truncate max-w-md">
                        {formData.track_title || 'Uploaded Audio Track'}
                      </span>
                      <span className="text-[11px] text-white/40 font-mono">
                        {formData.audio_storage_path || 'Uploaded Audio'}
                      </span>
                    </div>
                  </div>

                  <audio
                    ref={audioPreviewRef}
                    src={formData.audio_url}
                    onEnded={() => setPreviewPlaying(false)}
                    className="hidden"
                  />
                </div>
              )}

              {/* Direct Audio URL fallback */}
              <div className="pt-4 border-t border-white/10">
                <label className="block text-xs font-semibold text-white/50 mb-1">
                  Or specify direct Audio Stream URL:
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.audio_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, audio_url: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: RELEASE INFORMATION */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 4 — Release & Copyright Information</h3>
                <p className="text-xs text-white/50">
                  Configure release date, timezone, catalog identifier, legal copyrights (C Line & P Line default to Aura Music Studio).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    Release Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.release_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, release_date: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Release Time
                  </label>
                  <input
                    type="time"
                    value={formData.release_time || '00:00'}
                    onChange={(e) => setFormData(prev => ({ ...prev, release_time: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Catalog Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AMS-2026-001"
                    value={formData.catalog_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, catalog_number: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    ISRC Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IN-AMS-26-00001"
                    value={formData.isrc}
                    onChange={(e) => setFormData(prev => ({ ...prev, isrc: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    UPC / EAN Barcode
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 198000123456"
                    value={formData.upc_ean}
                    onChange={(e) => setFormData(prev => ({ ...prev, upc_ean: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Legal Copyright defaults */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    ℗ P Line (Phonographic Copyright) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.p_line}
                    onChange={(e) => setFormData(prev => ({ ...prev, p_line: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">Default: Aura Music Studio</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    © C Line (Composition Copyright) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.c_line}
                    onChange={(e) => setFormData(prev => ({ ...prev, c_line: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-white/40 mt-1 block">Default: Aura Music Studio</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Record Label
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Publishing Information
                  </label>
                  <input
                    type="text"
                    value={formData.publishing_info}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishing_info: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: MUSIC PLATFORM LINKS */}
          {currentStep === 5 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 5 — Music Platform Links</h3>
                <p className="text-xs text-white/50">
                  Optional official links. Platform buttons will only appear on the public page if an actual URL is provided.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Spotify URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://open.spotify.com/track/..."
                    value={formData.spotify_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, spotify_url: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Apple Music URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://music.apple.com/..."
                    value={formData.apple_music_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, apple_music_url: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.youtube_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    YouTube Music URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://music.youtube.com/watch?v=..."
                    value={formData.youtube_music_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_music_url: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Amazon Music URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://music.amazon.com/..."
                    value={formData.amazon_music_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, amazon_music_url: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    SoundCloud URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://soundcloud.com/..."
                    value={formData.soundcloud_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, soundcloud_url: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Deezer URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.deezer.com/track/..."
                    value={formData.deezer_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, deezer_url: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    TIDAL URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://tidal.com/browse/track/..."
                    value={formData.tidal_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, tidal_url: e.target.value }))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DESCRIPTION */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 6 — Description & Liner Notes</h3>
                <p className="text-xs text-white/50">
                  Provide an optional background story, composition details, production credits, or lyrics.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1.5">
                  Release Description
                </label>
                <textarea
                  rows={8}
                  placeholder="Describe the inspiration, instruments used, mixing/mastering notes, or track history..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & SUBMIT */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Step 7 — Review & Publish Decision</h3>
                <p className="text-xs text-white/50">
                  Review the complete release summary before saving. Choose whether to save as a Draft, schedule auto-publishing, or publish immediately.
                </p>
              </div>

              {/* Release Card Preview */}
              <div className="bg-black/60 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center">
                <div className="w-32 h-32 rounded-xl overflow-hidden shrink-0 border border-white/15 bg-zinc-900">
                  {formData.artwork_url ? (
                    <img src={formData.artwork_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <Music className="w-8 h-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">
                      {formData.release_type}
                    </span>
                    <span className="text-xs text-white/50">{formData.genre}</span>
                  </div>

                  <h4 className="text-xl font-extrabold text-white">
                    {formData.track_title || formData.release_title}
                    {formData.version && <span className="text-sm font-normal text-white/50 ml-2">({formData.version})</span>}
                  </h4>

                  <p className="text-sm text-white/70 font-medium">
                    {formData.artist}
                    {formData.featuring_artist && <span className="text-white/40"> feat. {formData.featuring_artist}</span>}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-white/40 pt-2 border-t border-white/10">
                    <span>Date: <strong className="text-white/80">{formData.release_date}</strong></span>
                    <span>Time: <strong className="text-white/80">{formData.release_time} ({formData.timezone})</strong></span>
                    <span>Catalog: <strong className="text-white/80">{formData.catalog_number}</strong></span>
                  </div>
                </div>
              </div>

              {/* Schedule Info Box */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-white/70 space-y-1">
                <p className="font-semibold text-amber-400">Release Automation Workflow:</p>
                <p>• <strong>Publish Now:</strong> Immediately visible in the public Aura Music Studio catalog.</p>
                <p>• <strong>Schedule Release:</strong> System server-side worker will automatically publish on <strong>{formData.release_date} at {formData.release_time} ({formData.timezone})</strong>.</p>
                <p>• <strong>Save Draft:</strong> Stored securely in database, only accessible to administrators.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-white/10 bg-black/60 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('draft')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('scheduled')}
                  className="px-5 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" /> Schedule Release
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('published')}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  {submitting ? 'Publishing...' : 'Publish Release Now'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
