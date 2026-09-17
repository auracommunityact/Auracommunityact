import React, { useState, useEffect } from 'react';
import { supabase, Project } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Check, Eye, EyeOff, Save, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true });
        
      if (error) throw error;
      setProjects(data || []);
    } catch (err: any) {
      toast.error('Failed to load projects: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.name || !editingProject?.short_description) {
      toast.error('Name and short description are required.');
      return;
    }

    try {
      if (editingProject.id) {
        // Update
        const { error } = await supabase
          .from('projects')
          .update({
            ...editingProject,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProject.id);
        if (error) throw error;
        toast.success('Project updated successfully.');
      } else {
        // Insert
        const { error } = await supabase
          .from('projects')
          .insert({
            ...editingProject,
            display_order: projects.length + 1
          });
        if (error) throw error;
        toast.success('Project created successfully.');
      }
      setEditingProject(null);
      fetchProjects();
    } catch (err: any) {
      toast.error('Failed to save project: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Project deleted successfully.');
      fetchProjects();
    } catch (err: any) {
      toast.error('Failed to delete project: ' + err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'cover_image') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-assets')
        .getPublicUrl(filePath);

      setEditingProject(prev => prev ? { ...prev, [field]: data.publicUrl } : null);
      toast.success('Image uploaded successfully.');
    } catch (err: any) {
      toast.error('Failed to upload image: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const toggleVisibility = async (project: Project) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ visible_on_home: !project.visible_on_home })
        .eq('id', project.id);
      if (error) throw error;
      fetchProjects();
    } catch (err: any) {
      toast.error('Failed to update visibility: ' + err.message);
    }
  };

  const addLink = () => {
    setEditingProject(prev => {
      if (!prev) return prev;
      const links = prev.links || [];
      return { ...prev, links: [...links, { label: 'Visit', url: 'https://' }] };
    });
  };

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    setEditingProject(prev => {
      if (!prev) return prev;
      const links = [...(prev.links || [])];
      links[index] = { ...links[index], [field]: value };
      return { ...prev, links };
    });
  };

  const removeLink = (index: number) => {
    setEditingProject(prev => {
      if (!prev) return prev;
      const links = [...(prev.links || [])];
      links.splice(index, 1);
      return { ...prev, links };
    });
  };

  const moveProject = async (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= projects.length) return;
    
    const newProjects = [...projects];
    const temp = newProjects[index];
    newProjects[index] = newProjects[index + direction];
    newProjects[index + direction] = temp;
    
    // Update display_order for all to ensure consistency
    setProjects(newProjects);
    
    try {
      for (let i = 0; i < newProjects.length; i++) {
        await supabase
          .from('projects')
          .update({ display_order: i + 1 })
          .eq('id', newProjects[i].id);
      }
      toast.success('Order updated.');
    } catch (err: any) {
      toast.error('Failed to update order.');
      fetchProjects(); // revert
    }
  };

  if (editingProject) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">{editingProject.id ? 'Edit Project' : 'New Project'}</h3>
          <button onClick={() => setEditingProject(null)} className="text-white/50 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Project Name *</label>
              <input required type="text" value={editingProject.name || ''} onChange={e => setEditingProject({...editingProject, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
              <input type="text" value={editingProject.category || ''} onChange={e => setEditingProject({...editingProject, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" placeholder="e.g. Gaming / Porting • Android" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-2">Short Description * (For Home Page)</label>
              <textarea required rows={2} value={editingProject.short_description || ''} onChange={e => setEditingProject({...editingProject, short_description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-2">Full Description (For Project Page)</label>
              <textarea rows={4} value={editingProject.description || ''} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white resize-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
              <select value={editingProject.status || ''} onChange={e => setEditingProject({...editingProject, status: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white">
                <option value="">None</option>
                <option value="Active">Active</option>
                <option value="In Development">In Development</option>
                <option value="Testing">Testing</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Available">Available</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Primary Link (Internal Route or External)</label>
              <input type="text" value={editingProject.link || ''} onChange={e => setEditingProject({...editingProject, link: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white" placeholder="e.g. /projects/mission-gta-mobile or https://..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Project Logo</label>
              {editingProject.logo && (
                <div className="mb-2 relative w-16 h-16 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  {editingProject.logo.includes('.svg') || !editingProject.logo.startsWith('http') ? (
                     <div className="w-full h-full flex items-center justify-center text-xs text-white/50 break-all p-1">{editingProject.logo}</div>
                  ) : (
                     <img src={editingProject.logo} alt="Logo" className="w-full h-full object-cover" />
                  )}
                  <button type="button" onClick={() => setEditingProject({...editingProject, logo: null})} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-xl"><X className="w-3 h-3"/></button>
                </div>
              )}
              <label className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-lg p-3 cursor-pointer transition-colors text-white/70">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm">{uploadingImage ? 'Uploading...' : 'Upload Logo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'logo')} disabled={uploadingImage} />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Settings</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={editingProject.verified || false} onChange={e => setEditingProject({...editingProject, verified: e.target.checked})} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 bg-black/50 w-4 h-4" />
                  Verified Badge
                </label>
                <label className="flex items-center gap-3 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={editingProject.published ?? true} onChange={e => setEditingProject({...editingProject, published: e.target.checked})} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 bg-black/50 w-4 h-4" />
                  Published (Publicly accessible)
                </label>
                <label className="flex items-center gap-3 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={editingProject.visible_on_home ?? true} onChange={e => setEditingProject({...editingProject, visible_on_home: e.target.checked})} className="rounded border-gray-300 text-amber-500 focus:ring-amber-500 bg-black/50 w-4 h-4" />
                  Visible on Home Page
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 border-t border-white/10 pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-white/70">Additional Links (Optional)</label>
                <button type="button" onClick={addLink} className="text-sm bg-white/5 hover:bg-white/10 text-white px-3 py-1 rounded-lg transition-colors flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Link
                </button>
              </div>
              
              <div className="space-y-3">
                {(editingProject.links || []).map((link, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input type="text" value={link.label} onChange={e => updateLink(idx, 'label', e.target.value)} placeholder="Label (e.g. GitHub)" className="w-1/3 bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white" />
                    <input type="text" value={link.url} onChange={e => updateLink(idx, 'url', e.target.value)} placeholder="URL" className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white" />
                    <button type="button" onClick={() => removeLink(idx)} className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/30"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
                {(!editingProject.links || editingProject.links.length === 0) && (
                  <p className="text-sm text-white/40 italic">No additional links.</p>
                )}
              </div>
            </div>

          </div>
          <div className="flex justify-end pt-6 border-t border-white/10">
            <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-3 rounded-xl text-sm font-bold transition-colors">
              Save Project
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Manage Projects</h2>
        <button 
          onClick={() => setEditingProject({ verified: false, published: true, visible_on_home: true, links: [] })}
          className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        {loading ? (
          <div className="py-8 text-center text-white/50">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center text-white/50">No projects found. Create one above.</div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, idx) => (
              <div key={project.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-black/40 border border-white/5 rounded-xl group hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1 text-white/20">
                    <button onClick={() => moveProject(idx, -1)} disabled={idx === 0} className="hover:text-white disabled:opacity-30"><GripVertical className="w-4 h-4 rotate-90"/></button>
                    <button onClick={() => moveProject(idx, 1)} disabled={idx === projects.length - 1} className="hover:text-white disabled:opacity-30"><GripVertical className="w-4 h-4 rotate-90"/></button>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#111] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {project.logo && (project.logo.startsWith('http') || project.logo.includes('data:image')) ? (
                      <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/30 text-xs font-bold">{project.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      {project.name}
                      {!project.published && <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase tracking-wider">Draft</span>}
                    </h3>
                    <div className="text-sm text-gray-400">{project.category || 'No category'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => toggleVisibility(project)}
                    className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                    title={project.visible_on_home ? "Hide from Home" : "Show on Home"}
                  >
                    {project.visible_on_home ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-red-400" />}
                  </button>
                  {project.link && project.link.startsWith('/') && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <button 
                    onClick={() => setEditingProject(project)}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-semibold transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
