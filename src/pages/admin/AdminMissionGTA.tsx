import { useState, useEffect } from 'react';
import { supabase, ProjectGallery, ProjectUpdate, ProjectPerformance } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Upload, Link as LinkIcon, Check, Eye, Monitor } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function AdminMissionGTA() {
  const [activeTab, setActiveTab] = useState<'gallery' | 'updates' | 'performance'>('performance');
  const PROJECT_ID = 'mission-gta-mobile';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-4">
        <h2 className="text-2xl font-bold text-white">Mission GTA Mobile</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'performance' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
          >
            Performance
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'gallery' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
          >
            Gallery
          </button>
          <button 
            onClick={() => setActiveTab('updates')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'updates' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
          >
            Updates
          </button>
        </div>
      </div>

      {activeTab === 'performance' && <PerformanceManager projectId={PROJECT_ID} />}
      {activeTab === 'gallery' && <GalleryManager projectId={PROJECT_ID} />}
      {activeTab === 'updates' && <UpdatesManager projectId={PROJECT_ID} />}
    </div>
  );
}

function GalleryManager({ projectId }: { projectId: string }) {
  const [images, setImages] = useState<ProjectGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_galleries')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setImages(data || []);
    } catch (err: any) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      toast.error('Only image files are allowed');
    }

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeSelected = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    let uploadedCount = 0;

    try {
      for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${projectId}/gallery/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('project-assets')
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-assets')
          .getPublicUrl(filePath);

        // Save to DB
        const { error: dbError } = await supabase
          .from('project_galleries')
          .insert([{
            project_id: projectId,
            image_url: publicUrl,
            storage_path: filePath,
            title: file.name
          }]);

        if (dbError) throw dbError;
        uploadedCount++;
      }
      
      toast.success(`Successfully uploaded ${uploadedCount} image(s)`);
      setSelectedFiles([]);
      setPreviews([]);
      fetchGallery();
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-assets')
        .remove([storagePath]);
        
      if (storageError) console.error('Storage cleanup failed', storageError);

      // Delete from DB
      const { error: dbError } = await supabase
        .from('project_galleries')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;
      
      toast.success('Image deleted');
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err: any) {
      toast.error('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Upload Photos</h3>
        
        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden" 
            id="gallery-upload"
          />
          <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-8 h-8 text-white/40 mb-2" />
            <span className="text-white/70 font-medium">Click or drag images to upload</span>
            <span className="text-white/40 text-sm mt-1">Supports JPG, PNG, WEBP</span>
          </label>
        </div>

        {previews.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white/60 mb-3">Selected ({previews.length})</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
              {previews.map((preview, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeSelected(i)}
                    className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-12 text-white/50">Loading gallery...</div>
        ) : images.length === 0 ? (
          <div className="col-span-full text-center py-12 text-white/50 bg-white/[0.02] rounded-xl border border-white/5">No images uploaded yet.</div>
        ) : (
          images.map((img) => (
            <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden group border border-white/10">
              <img src={img.image_url} alt={img.title || 'Gallery image'} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleDelete(img.id, img.storage_path)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform hover:scale-110 transition-all shadow-lg"
                  title="Delete Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function UpdatesManager({ projectId }: { projectId: string }) {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [currentUpdate, setCurrentUpdate] = useState<Partial<ProjectUpdate>>({
    title: '', description: '', links: [], is_published: false
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Link editor state
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUpdates(data || []);
    } catch (err: any) {
      toast.error('Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    
    let validUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = 'https://' + validUrl;
    }

    setCurrentUpdate(prev => ({
      ...prev,
      links: [...(prev.links || []), { label: newLinkLabel.trim(), url: validUrl }]
    }));
    
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    setCurrentUpdate(prev => ({
      ...prev,
      links: prev.links?.filter((_, i) => i !== index)
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Must be an image file');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = async () => {
    // If editing existing update with an image, we need to handle that on save
    // For now, just clear the UI state
    setImageFile(null);
    setImagePreview(null);
    if (currentUpdate.id && currentUpdate.storage_path) {
      setCurrentUpdate(prev => ({ ...prev, image_url: null, storage_path: null }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUpdate.title?.trim() || !currentUpdate.description?.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = currentUpdate.image_url;
      let finalStoragePath = currentUpdate.storage_path;

      // Handle new image upload
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${projectId}/updates/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-assets')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-assets')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
        finalStoragePath = filePath;

        // Cleanup old image if replacing
        if (currentUpdate.id && currentUpdate.storage_path) {
           await supabase.storage.from('project-assets').remove([currentUpdate.storage_path]);
        }
      } 
      // Handle image removal (if they removed existing image without replacing)
      else if (currentUpdate.id && !currentUpdate.image_url && updates.find(u => u.id === currentUpdate.id)?.storage_path) {
        const oldStoragePath = updates.find(u => u.id === currentUpdate.id)!.storage_path!;
        await supabase.storage.from('project-assets').remove([oldStoragePath]);
      }

      const updateData = {
        project_id: projectId,
        title: currentUpdate.title,
        description: currentUpdate.description,
        links: currentUpdate.links || [],
        is_published: currentUpdate.is_published || false,
        image_url: finalImageUrl,
        storage_path: finalStoragePath,
        updated_at: new Date().toISOString()
      };

      if (currentUpdate.id) {
        const { error } = await supabase
          .from('project_updates')
          .update(updateData)
          .eq('id', currentUpdate.id);
        if (error) throw error;
        toast.success('Update saved successfully');
      } else {
        const { error } = await supabase
          .from('project_updates')
          .insert([{ ...updateData, created_at: new Date().toISOString() }]);
        if (error) throw error;
        toast.success('Update created successfully');
      }

      setIsEditing(false);
      resetForm();
      fetchUpdates();
    } catch (err: any) {
      toast.error('Failed to save update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, storagePath: string | null) => {
    if (!window.confirm('Are you sure you want to delete this update?')) return;
    
    try {
      if (storagePath) {
        await supabase.storage.from('project-assets').remove([storagePath]);
      }

      const { error } = await supabase
        .from('project_updates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Update deleted');
      setUpdates(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('project_updates')
        .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      
      setUpdates(prev => prev.map(u => u.id === id ? { ...u, is_published: !currentStatus } : u));
      toast.success(`Update ${!currentStatus ? 'published' : 'unpublished'}`);
    } catch (err: any) {
      toast.error('Failed to change status: ' + err.message);
    }
  };

  const resetForm = () => {
    setCurrentUpdate({ title: '', description: '', links: [], is_published: false });
    setImageFile(null);
    setImagePreview(null);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  if (isEditing) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">{currentUpdate.id ? 'Edit Update' : 'Create Update'}</h3>
          <button onClick={() => { setIsEditing(false); resetForm(); }} className="text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Title *</label>
            <input 
              type="text" 
              required
              value={currentUpdate.title || ''}
              onChange={e => setCurrentUpdate({...currentUpdate, title: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500/50 focus:outline-none"
              placeholder="e.g. New Android Build Released"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Description *</label>
            <textarea 
              required
              rows={5}
              value={currentUpdate.description || ''}
              onChange={e => setCurrentUpdate({...currentUpdate, description: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500/50 focus:outline-none"
              placeholder="Detailed description of the update..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Featured Image (Optional)</label>
            <div className="flex items-start gap-4">
              {(imagePreview || currentUpdate.image_url) ? (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden border border-white/10 group">
                  <img src={imagePreview || currentUpdate.image_url!} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="w-48 aspect-video border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 transition-colors bg-black/30">
                  <ImageIcon className="w-6 h-6 text-white/40 mb-2" />
                  <span className="text-xs text-white/50">Upload Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Links (Optional)</label>
            <div className="space-y-3 mb-4">
              {currentUpdate.links?.map((link, i) => (
                <div key={i} className="flex items-center gap-3 bg-black/30 p-2 rounded-lg border border-white/5">
                  <LinkIcon className="w-4 h-4 text-white/40 ml-2" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-semibold text-white truncate">{link.label}</div>
                    <div className="text-xs text-white/50 truncate">{link.url}</div>
                  </div>
                  <button type="button" onClick={() => handleRemoveLink(i)} className="p-2 text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <input 
                  type="text" 
                  placeholder="Label (e.g. Download)" 
                  value={newLinkLabel}
                  onChange={e => setNewLinkLabel(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white"
                />
              </div>
              <div className="flex-1">
                <input 
                  type="url" 
                  placeholder="URL (https://...)" 
                  value={newLinkUrl}
                  onChange={e => setNewLinkUrl(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddLink}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors h-[38px]"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 py-4 border-t border-white/10">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={currentUpdate.is_published}
                onChange={e => setCurrentUpdate({...currentUpdate, is_published: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ml-3 text-sm font-medium text-white">Publish Immediately</span>
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button 
              type="button" 
              onClick={() => { setIsEditing(false); resetForm(); }}
              className="px-6 py-2 rounded-lg text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Update'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/[0.02] border border-white/10 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white">Project Updates</h3>
        <button 
          onClick={() => { resetForm(); setIsEditing(true); }}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Update
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-white/50">Loading updates...</div>
        ) : updates.length === 0 ? (
          <div className="text-center py-12 text-white/50 bg-white/[0.02] rounded-xl border border-white/5">No updates found.</div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-6 flex gap-6">
              {update.image_url && (
                <div className="w-48 aspect-video rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <img src={update.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-bold text-white">{update.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${update.is_published ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {update.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{update.description}</p>
                <div className="text-xs text-gray-500 mb-4">
                  {new Date(update.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setCurrentUpdate(update); setIsEditing(true); }}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button 
                    onClick={() => handleTogglePublish(update.id, update.is_published)}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                  >
                    {update.is_published ? <Eye className="w-3 h-3 line-through" /> : <Eye className="w-3 h-3" />}
                    {update.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button 
                    onClick={() => handleDelete(update.id, update.storage_path)}
                    className="flex items-center gap-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1.5 rounded text-xs font-semibold transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}



export function PerformanceManager({ projectId }: { projectId: string }) {
  const [metrics, setMetrics] = useState<Partial<ProjectPerformance>>({
    fps: 'Testing',
    gpu: 'Testing',
    ram: 'Data N/A',
    stability: 'Testing'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_performance')
        .select('*')
        .eq('project_id', projectId)
        .single();
        
      if (data) {
        setMetrics(data);
      }
    } catch (err: any) {
      console.error('Failed to load performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('project_performance')
        .upsert({
          project_id: projectId,
          fps: metrics.fps || 'Testing',
          gpu: metrics.gpu || 'Testing',
          ram: metrics.ram || 'Data N/A',
          stability: metrics.stability || 'Testing',
          updated_at: new Date().toISOString()
        }, { onConflict: 'project_id' });

      if (error) throw error;
      toast.success('Performance Dashboard updated successfully.');
    } catch (err: any) {
      toast.error('Failed to update performance: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-white/50">Loading performance data...</div>;
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="p-3 bg-amber-500/10 rounded-lg w-fit shrink-0">
          <Monitor className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Performance Dashboard</h3>
          <p className="text-sm text-gray-400">Update the hardware performance stats shown on the public project page.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">FPS</label>
            <input 
              type="text" 
              value={metrics.fps || ''}
              onChange={e => setMetrics({...metrics, fps: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500/50 focus:outline-none"
              placeholder="e.g. 60 FPS, Testing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">GPU</label>
            <input 
              type="text" 
              value={metrics.gpu || ''}
              onChange={e => setMetrics({...metrics, gpu: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500/50 focus:outline-none"
              placeholder="e.g. Adreno 750, Testing..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">RAM</label>
            <input 
              type="text" 
              value={metrics.ram || ''}
              onChange={e => setMetrics({...metrics, ram: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500/50 focus:outline-none"
              placeholder="e.g. 8 GB, Data N/A..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Stability</label>
            <input 
              type="text" 
              value={metrics.stability || ''}
              onChange={e => setMetrics({...metrics, stability: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-amber-500/50 focus:outline-none"
              placeholder="e.g. Stable, Experimental..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
