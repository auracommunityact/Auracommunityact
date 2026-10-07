import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import * as dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const PORT = 3000;

// Supabase server instance
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Local fallback database file path for music releases
const DATA_DIR = path.join(process.cwd(), 'data');
const RELEASES_FILE = path.join(DATA_DIR, 'music_releases.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data dir', e);
  }
}

if (!fs.existsSync(RELEASES_FILE)) {
  try {
    fs.writeFileSync(RELEASES_FILE, JSON.stringify([]), 'utf8');
  } catch (e) {
    console.error('Failed to create releases file', e);
  }
}

function readLocalReleases(): any[] {
  try {
    if (fs.existsSync(RELEASES_FILE)) {
      const data = fs.readFileSync(RELEASES_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (e) {
    console.error('Error reading local releases:', e);
  }
  return [];
}

function writeLocalReleases(releases: any[]): void {
  try {
    fs.writeFileSync(RELEASES_FILE, JSON.stringify(releases, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing local releases:', e);
  }
}

// Background Task: Auto-publish scheduled releases whose release time has arrived
async function checkAndPublishScheduledReleases() {
  const now = new Date();

  // 1. Check local store
  const localReleases = readLocalReleases();
  let changedLocal = false;
  for (const rel of localReleases) {
    if (rel.status === 'scheduled' && rel.scheduled_for) {
      const schedTime = new Date(rel.scheduled_for);
      if (schedTime <= now) {
        rel.status = 'published';
        rel.updated_at = now.toISOString();
        changedLocal = true;
        console.log(`[Scheduler] Auto-published release: "${rel.release_title}" (${rel.id})`);
      }
    }
  }
  if (changedLocal) {
    writeLocalReleases(localReleases);
  }

  // 2. Check Supabase table if accessible
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('music_releases')
        .select('*')
        .eq('status', 'scheduled')
        .lte('scheduled_for', now.toISOString());

      if (!error && data && data.length > 0) {
        for (const rel of data) {
          await supabase
            .from('music_releases')
            .update({ status: 'published', updated_at: now.toISOString() })
            .eq('id', rel.id);
          console.log(`[Scheduler Supabase] Auto-published release: "${rel.release_title}" (${rel.id})`);
        }
      }
    } catch (e) {
      // Supabase table may not exist yet or network issue, silently continue
    }
  }
}

// Run auto-publisher every 20 seconds
setInterval(checkAndPublishScheduledReleases, 20000);

app.use(cors());
app.use(express.json());

// Set up multer for file uploads (in-memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// API Routes

import { GoogleGenAI } from '@google/genai';

app.post('/api/ai/generate', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error', details: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const apiKey = process.env.KITS_AI_API_KEY?.trim();
    if (!apiKey) {
      return res.status(500).json({ error: 'Aura AI is temporarily unavailable (Missing API Key)' });
    }

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    
    let messages = [];
    if (req.body.messages) {
      try {
        messages = JSON.parse(req.body.messages);
      } catch (e) {
        console.error("Failed to parse messages");
      }
    }
    
    const latestMessage = req.body.message || '';
    const file = req.file;

    const systemInstruction = `You are Aura AI, your intelligent assistant for the Aura Community ACT ecosystem.
Owner: Shaan Mohammad.
Aura Community ACT: Ecosystem of projects, community, support.
Aura Learning: Education platform, videos, books.
Aura Play: Gaming platform, game listings, downloads.
Other projects: Aura Studio, Aura Store, Aura Movie, Aura Search, Aura Arrow, Aura Esport, Aura Hub.

Guidelines:
1. Use the Aura Knowledge Base first for Aura-related questions. Give detailed, accurate answers.
2. Never invent Aura-specific information. If unavailable, say it is not currently confirmed.
3. For technical problems, provide step-by-step solutions. Analyze screenshots if provided.
4. Support general questions too (Programming, Tech, Education, etc.).
5. Automatically respond in the user's language (Hindi, Hinglish, English). Example: If user asks in Hinglish, reply in Hinglish.`;

    const contents = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const latestParts = [];
    if (latestMessage) {
      latestParts.push({ text: latestMessage });
    }
    
    if (file) {
       latestParts.push({
         inlineData: {
           data: file.buffer.toString('base64'),
           mimeType: file.mimetype
         }
       });
    }
    
    // Ensure we don't send an empty user turn
    if (latestParts.length > 0) {
      contents.push({ role: 'user', parts: latestParts });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
            systemInstruction: { parts: [{ text: systemInstruction }] }
        }
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response. Please try again.',
      details: error.message 
    });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ==========================================
// AURA MUSIC STUDIO API ROUTES
// ==========================================

// 1. Get Releases (Admin or Public)
app.get('/api/music/releases', async (req, res) => {
  const isAdmin = req.query.admin === 'true';
  const now = new Date();

  // Try Supabase first
  if (supabase) {
    try {
      let query = supabase.from('music_releases').select('*');
      if (!isAdmin) {
        query = query.eq('status', 'published').order('release_date', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (!error && data) {
        // Filter or auto-publish scheduled if needed
        return res.json(data);
      }
    } catch (e) {
      // Table may not exist yet, fallback to local store
    }
  }

  // Fallback to local store
  let releases = readLocalReleases();
  
  // Check auto-publish on the fly
  let changed = false;
  for (const rel of releases) {
    if (rel.status === 'scheduled' && rel.scheduled_for && new Date(rel.scheduled_for) <= now) {
      rel.status = 'published';
      rel.updated_at = now.toISOString();
      changed = true;
    }
  }
  if (changed) writeLocalReleases(releases);

  if (!isAdmin) {
    releases = releases.filter(r => r.status === 'published');
    releases.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
  } else {
    releases.sort((a, b) => new Date(b.created_at || b.updated_at).getTime() - new Date(a.created_at || a.updated_at).getTime());
  }

  return res.json(releases);
});

// 2. Get Single Release by ID
app.get('/api/music/releases/:id', async (req, res) => {
  const { id } = req.params;
  const now = new Date();

  if (supabase) {
    try {
      const { data, error } = await supabase.from('music_releases').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      // fallback
    }
  }

  const releases = readLocalReleases();
  const found = releases.find(r => r.id === id);
  if (!found) {
    return res.status(404).json({ error: 'Release not found' });
  }

  if (found.status === 'scheduled' && found.scheduled_for && new Date(found.scheduled_for) <= now) {
    found.status = 'published';
    writeLocalReleases(releases);
  }

  return res.json(found);
});

// 3. Create Release (Admin)
app.post('/api/music/releases', async (req, res) => {
  try {
    const releaseData = {
      id: req.body.id || uuidv4(),
      release_title: req.body.release_title,
      track_title: req.body.track_title,
      artist: req.body.artist,
      featuring_artist: req.body.featuring_artist || null,
      version: req.body.version || null,
      genre: req.body.genre,
      language: req.body.language,
      release_type: req.body.release_type || 'single',
      artwork_url: req.body.artwork_url,
      artwork_storage_path: req.body.artwork_storage_path || null,
      audio_url: req.body.audio_url,
      audio_storage_path: req.body.audio_storage_path || null,
      release_date: req.body.release_date,
      release_time: req.body.release_time || null,
      timezone: req.body.timezone || 'Asia/Kolkata',
      catalog_number: req.body.catalog_number || null,
      isrc: req.body.isrc || null,
      upc_ean: req.body.upc_ean || null,
      label: req.body.label || 'Aura Music Studio',
      copyright_owner: req.body.copyright_owner || 'Aura Music Studio',
      publishing_info: req.body.publishing_info || null,
      c_line: req.body.c_line || 'Aura Music Studio',
      p_line: req.body.p_line || 'Aura Music Studio',
      youtube_url: req.body.youtube_url || null,
      youtube_music_url: req.body.youtube_music_url || null,
      spotify_url: req.body.spotify_url || null,
      apple_music_url: req.body.apple_music_url || null,
      amazon_music_url: req.body.amazon_music_url || null,
      soundcloud_url: req.body.soundcloud_url || null,
      deezer_url: req.body.deezer_url || null,
      tidal_url: req.body.tidal_url || null,
      other_url: req.body.other_url || null,
      description: req.body.description || null,
      status: req.body.status || 'draft',
      scheduled_for: req.body.scheduled_for || null,
      created_by: req.body.created_by || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to local store
    const localReleases = readLocalReleases();
    localReleases.unshift(releaseData);
    writeLocalReleases(localReleases);

    // Also attempt Supabase insert if available
    if (supabase) {
      try {
        const { error } = await supabase.from('music_releases').insert(releaseData);
        if (error) {
          console.warn('Supabase insert notice (table might not exist yet):', error.message);
        }
      } catch (err) {
        // local store already saved
      }
    }

    return res.status(201).json(releaseData);
  } catch (err: any) {
    console.error('Error creating release:', err);
    return res.status(500).json({ error: err.message || 'Failed to create release' });
  }
});

// 4. Update Release (Admin)
app.put('/api/music/releases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    // Update local store
    const localReleases = readLocalReleases();
    const index = localReleases.findIndex(r => r.id === id);
    let updatedObj = null;
    if (index !== -1) {
      localReleases[index] = { ...localReleases[index], ...updates };
      updatedObj = localReleases[index];
      writeLocalReleases(localReleases);
    }

    // Also attempt Supabase update
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('music_releases')
          .update(updates)
          .eq('id', id)
          .select()
          .maybeSingle();

        if (!error && data) {
          updatedObj = data;
        }
      } catch (err) {
        // fallback
      }
    }

    if (!updatedObj) {
      return res.status(404).json({ error: 'Release not found' });
    }

    return res.json(updatedObj);
  } catch (err: any) {
    console.error('Error updating release:', err);
    return res.status(500).json({ error: err.message || 'Failed to update release' });
  }
});

// 5. Delete Release (Admin)
app.delete('/api/music/releases/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from local store
    const localReleases = readLocalReleases();
    const filtered = localReleases.filter(r => r.id !== id);
    writeLocalReleases(filtered);

    // Also attempt Supabase delete
    if (supabase) {
      try {
        await supabase.from('music_releases').delete().eq('id', id);
      } catch (err) {
        // ignore
      }
    }

    return res.json({ success: true, message: 'Release deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting release:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete release' });
  }
});

// 6. Direct Storage Upload Proxy (Audio / Artwork)
app.post('/api/music/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: 'File upload error: ' + err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const file = req.file;
    const fileType = req.body.type || 'artwork'; // 'artwork' or 'audio'

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileExt = path.extname(file.originalname).replace('.', '') || (fileType === 'artwork' ? 'jpg' : 'mp3');
    const fileName = `${uuidv4()}.${fileExt}`;
    const storagePath = `music/${fileType}/${fileName}`;

    if (supabase) {
      // Try 'music' bucket, then 'project-assets', then 'app-icons'
      const candidateBuckets = ['project-assets', 'app-icons', 'music'];
      for (const bucket of candidateBuckets) {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(storagePath, file.buffer, {
              contentType: file.mimetype,
              upsert: true,
            });

          if (!error && data) {
            const pubRes = supabase.storage.from(bucket).getPublicUrl(storagePath);
            return res.json({
              publicUrl: pubRes.data.publicUrl,
              storagePath: `${bucket}/${storagePath}`,
              bucket,
            });
          }
        } catch (e) {
          // try next bucket
        }
      }
    }

    // Local static fallback in public folder if Supabase storage is completely offline
    const localUploadsDir = path.join(process.cwd(), 'public', 'uploads', fileType);
    if (!fs.existsSync(localUploadsDir)) {
      fs.mkdirSync(localUploadsDir, { recursive: true });
    }
    const localFilePath = path.join(localUploadsDir, fileName);
    fs.writeFileSync(localFilePath, file.buffer);

    const publicUrl = `/uploads/${fileType}/${fileName}`;
    return res.json({
      publicUrl,
      storagePath: `local/${fileType}/${fileName}`,
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// AI Chat Endpoint

// Global error handler for API routes
app.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

async function startServer() {

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
