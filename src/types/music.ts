export type ReleaseStatus = 'draft' | 'scheduled' | 'published' | 'archived';
export type ReleaseType = 'single' | 'ep' | 'album';

export interface MusicPlatformLinks {
  youtube?: string;
  youtube_music?: string;
  spotify?: string;
  apple_music?: string;
  amazon_music?: string;
  soundcloud?: string;
  deezer?: string;
  tidal?: string;
  other?: string;
}

export interface MusicRelease {
  id: string;
  release_title: string;
  track_title: string;
  artist: string;
  featuring_artist: string | null;
  version: string | null;
  genre: string;
  language: string;
  release_type: ReleaseType;
  artwork_url: string;
  artwork_storage_path: string | null;
  audio_url: string;
  audio_storage_path: string | null;
  release_date: string; // YYYY-MM-DD
  release_time: string | null; // HH:mm
  timezone: string;
  catalog_number: string | null;
  isrc: string | null;
  upc_ean: string | null;
  label: string;
  copyright_owner: string;
  publishing_info: string | null;
  c_line: string;
  p_line: string;
  youtube_url: string | null;
  youtube_music_url: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  amazon_music_url: string | null;
  soundcloud_url: string | null;
  deezer_url: string | null;
  tidal_url: string | null;
  other_url: string | null;
  description: string | null;
  status: ReleaseStatus;
  scheduled_for: string | null; // ISO timestamp
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReleaseFormData {
  // Step 1: Basic Information
  release_title: string;
  track_title: string;
  artist: string;
  featuring_artist?: string;
  version?: string;
  genre: string;
  language: string;
  release_type: ReleaseType;

  // Step 2: Artwork
  artwork_url: string;
  artwork_storage_path?: string;

  // Step 3: Audio
  audio_url: string;
  audio_storage_path?: string;

  // Step 4: Release Information
  release_date: string;
  release_time?: string;
  timezone: string;
  catalog_number?: string;
  isrc?: string;
  upc_ean?: string;
  label: string;
  copyright_owner: string;
  publishing_info?: string;
  c_line: string;
  p_line: string;

  // Step 5: Music Platform Links
  youtube_url?: string;
  youtube_music_url?: string;
  spotify_url?: string;
  apple_music_url?: string;
  amazon_music_url?: string;
  soundcloud_url?: string;
  deezer_url?: string;
  tidal_url?: string;
  other_url?: string;

  // Step 6: Description
  description?: string;

  // Workflow status
  status: ReleaseStatus;
  scheduled_for?: string | null;
}
