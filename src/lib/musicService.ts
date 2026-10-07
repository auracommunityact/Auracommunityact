import { supabase } from './supabase';
import { MusicRelease, ReleaseFormData, ReleaseStatus } from '../types/music';

const API_BASE = '/api/music';

export const musicService = {
  /**
   * Fetch all published releases for public visitors
   */
  async getPublishedReleases(): Promise<MusicRelease[]> {
    try {
      // 1. Try Supabase directly with RLS
      const { data, error } = await supabase
        .from('music_releases')
        .select('*')
        .eq('status', 'published')
        .order('release_date', { ascending: false });

      if (!error && data) {
        // Filter out any scheduled releases that haven't arrived yet
        const now = new Date();
        return data.filter(r => !r.scheduled_for || new Date(r.scheduled_for) <= now);
      }
    } catch (err) {
      // Fallback to server route
    }

    // 2. Fallback to API route
    try {
      const res = await fetch(`${API_BASE}/releases`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch published releases:', err);
    }

    return [];
  },

  /**
   * Fetch a single release by ID
   */
  async getReleaseById(id: string): Promise<MusicRelease | null> {
    try {
      const { data, error } = await supabase
        .from('music_releases')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }

    try {
      const res = await fetch(`${API_BASE}/releases/${id}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch release by ID:', err);
    }

    return null;
  },

  /**
   * Fetch all releases for Admin Dashboard (includes Drafts, Scheduled, Published, Archived)
   */
  async getAllReleasesAdmin(): Promise<MusicRelease[]> {
    try {
      const { data, error } = await supabase
        .from('music_releases')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      // Fallback
    }

    try {
      const res = await fetch(`${API_BASE}/releases?admin=true`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error('Failed to fetch admin releases:', err);
    }

    return [];
  },

  /**
   * Create a new release
   */
  async createRelease(data: ReleaseFormData, userId?: string | null): Promise<MusicRelease> {
    const payload = {
      ...data,
      created_by: userId || null,
    };

    // Try Supabase first
    try {
      const { data: inserted, error } = await supabase
        .from('music_releases')
        .insert(payload)
        .select()
        .single();

      if (!error && inserted) {
        // Also ping server API to ensure local persistence matches
        fetch(`${API_BASE}/releases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inserted),
        }).catch(() => {});
        return inserted;
      }
    } catch (err) {
      // Fallback
    }

    // Fallback to server route
    const res = await fetch(`${API_BASE}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create release');
    }

    return await res.json();
  },

  /**
   * Update an existing release
   */
  async updateRelease(id: string, updates: Partial<MusicRelease>): Promise<MusicRelease> {
    // Try Supabase first
    try {
      const { data: updated, error } = await supabase
        .from('music_releases')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && updated) {
        fetch(`${API_BASE}/releases/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch(() => {});
        return updated;
      }
    } catch (err) {
      // Fallback
    }

    // Fallback to server API
    const res = await fetch(`${API_BASE}/releases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to update release');
    }

    return await res.json();
  },

  /**
   * Delete a release
   */
  async deleteRelease(id: string): Promise<void> {
    // Try Supabase
    try {
      await supabase.from('music_releases').delete().eq('id', id);
    } catch (err) {
      // Fallback
    }

    const res = await fetch(`${API_BASE}/releases/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to delete release');
    }
  },

  /**
   * Quick status change (draft, scheduled, published, archived)
   */
  async updateStatus(id: string, status: ReleaseStatus, scheduledFor?: string | null): Promise<MusicRelease> {
    return this.updateRelease(id, {
      status,
      scheduled_for: scheduledFor !== undefined ? scheduledFor : null,
    });
  },

  /**
   * Duplicate an existing release into a new Draft
   */
  async duplicateRelease(release: MusicRelease, userId?: string | null): Promise<MusicRelease> {
    const duplicateData: ReleaseFormData = {
      release_title: `${release.release_title} (Copy)`,
      track_title: release.track_title,
      artist: release.artist,
      featuring_artist: release.featuring_artist || undefined,
      version: release.version ? `${release.version} (Copy)` : undefined,
      genre: release.genre,
      language: release.language,
      release_type: release.release_type,
      artwork_url: release.artwork_url,
      artwork_storage_path: release.artwork_storage_path || undefined,
      audio_url: release.audio_url,
      audio_storage_path: release.audio_storage_path || undefined,
      release_date: new Date().toISOString().split('T')[0],
      release_time: release.release_time || undefined,
      timezone: release.timezone || 'Asia/Kolkata',
      catalog_number: release.catalog_number ? `${release.catalog_number}-COPY` : undefined,
      isrc: undefined, // ISRC should not be duplicated
      upc_ean: undefined,
      label: release.label,
      copyright_owner: release.copyright_owner,
      publishing_info: release.publishing_info || undefined,
      c_line: release.c_line,
      p_line: release.p_line,
      youtube_url: release.youtube_url || undefined,
      youtube_music_url: release.youtube_music_url || undefined,
      spotify_url: release.spotify_url || undefined,
      apple_music_url: release.apple_music_url || undefined,
      amazon_music_url: release.amazon_music_url || undefined,
      soundcloud_url: release.soundcloud_url || undefined,
      deezer_url: release.deezer_url || undefined,
      tidal_url: release.tidal_url || undefined,
      other_url: release.other_url || undefined,
      description: release.description || undefined,
      status: 'draft',
      scheduled_for: null,
    };

    return this.createRelease(duplicateData, userId);
  },

  /**
   * Upload Cover Artwork directly to storage
   */
  async uploadArtwork(file: File): Promise<{ publicUrl: string; storagePath: string }> {
    // 1. Try Supabase storage client directly first
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `music/artwork/${fileName}`;

      const bucketsToTry = ['project-assets', 'music', 'app-icons'];
      for (const bucket of bucketsToTry) {
        try {
          const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
            upsert: true,
            contentType: file.type || 'image/jpeg',
          });

          if (!error && data) {
            const pub = supabase.storage.from(bucket).getPublicUrl(filePath);
            return {
              publicUrl: pub.data.publicUrl,
              storagePath: `${bucket}/${filePath}`,
            };
          }
        } catch (e) {
          // try next bucket
        }
      }
    } catch (err) {
      // Fallback to server proxy
    }

    // 2. Server upload proxy
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'artwork');

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload artwork');
    }

    return await res.json();
  },

  /**
   * Upload Audio file directly to storage
   */
  async uploadAudio(file: File): Promise<{ publicUrl: string; storagePath: string }> {
    // 1. Try Supabase storage client directly first
    try {
      const fileExt = file.name.split('.').pop() || 'mp3';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `music/audio/${fileName}`;

      const bucketsToTry = ['project-assets', 'music', 'app-icons'];
      for (const bucket of bucketsToTry) {
        try {
          const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
            upsert: true,
            contentType: file.type || 'audio/mpeg',
          });

          if (!error && data) {
            const pub = supabase.storage.from(bucket).getPublicUrl(filePath);
            return {
              publicUrl: pub.data.publicUrl,
              storagePath: `${bucket}/${filePath}`,
            };
          }
        } catch (e) {
          // try next
        }
      }
    } catch (err) {
      // Fallback
    }

    // 2. Server upload proxy
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'audio');

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload audio');
    }

    return await res.json();
  },
};
