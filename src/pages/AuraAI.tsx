import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, Paperclip, Image as ImageIcon, FileText, X, Plus, MessageSquare, Trash2, Edit2, Loader2, StopCircle, RefreshCcw, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  image_data?: string;
  created_at: string;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export default function AuraAI() {
  const { user, profile } = useAuth();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocalMode, setIsLocalMode] = useState(false); // Fallback if SQL tables aren't set up yet

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load Chats on Mount
  useEffect(() => {
    if (!user) return;
    fetchChats();
  }, [user]);

  // Load Messages when activeChatId changes
  useEffect(() => {
    if (!user || !activeChatId) return;
    if (isLocalMode) return; // In local mode, messages are already in state
    fetchMessages(activeChatId);
  }, [activeChatId, user, isLocalMode]);

  const fetchChats = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') {
          // Table doesn't exist - fallback to local mode
          console.warn("Aura AI tables not found. Running in local-only mode.");
          setIsLocalMode(true);
        } else {
          console.error("Failed to load chats:", JSON.stringify(error));
        }
        return;
      }
      
      setChats(data || []);
      if (data && data.length > 0 && !activeChatId) {
        setActiveChatId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    if (isLocalMode) {
      setChats(chats.filter(c => c.id !== id));
      if (activeChatId === id) handleNewChat();
      return;
    }

    try {
      const { error } = await supabase.from('ai_chats').delete().eq('id', id);
      if (error) throw error;
      setChats(chats.filter(c => c.id !== id));
      if (activeChatId === id) handleNewChat();
      toast.success('Chat deleted');
    } catch (err) {
      toast.error('Failed to delete chat');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setAttachment(file);
      setAttachmentPreview(URL.createObjectURL(file));
      // Focus back on input
      textareaRef.current?.focus();
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const createChatIfNone = async (firstMessage: string) => {
    if (activeChatId) return activeChatId;
    
    const title = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');
    
    if (isLocalMode) {
      const newId = Date.now().toString();
      setChats([{ id: newId, title, created_at: new Date().toISOString() }, ...chats]);
      setActiveChatId(newId);
      return newId;
    }

    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .insert([{ user_id: user!.id, title }])
        .select()
        .single();
        
      if (error) throw error;
      setChats([data, ...chats]);
      setActiveChatId(data.id);
      return data.id;
    } catch (err) {
      if (err?.code === '42P01' || err?.code === 'PGRST205') {
        console.warn("Aura AI tables not found. Running in local-only mode.");
      } else {
        console.error("Failed to create chat:", JSON.stringify(err));
      }
      // Fallback
      setIsLocalMode(true);
      return Date.now().toString();
    }
  };

  const saveMessage = async (chatId: string, role: 'user' | 'model', content: string, imageData?: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      role,
      content,
      image_data: imageData,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);

    if (!isLocalMode) {
      try {
        await supabase.from('ai_messages').insert([{
          chat_id: chatId,
          role,
          content,
          image_data: imageData
        }]);
        // Update chat timestamp
        await supabase.from('ai_chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);
      } catch (err) {
        console.error("Failed to save message to DB", err);
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if ((!input.trim() && !attachment) || isLoading) return;

    const userText = input.trim();
    const userImage = attachment;
    
    setInput('');
    clearAttachment();
    setIsLoading(true);

    try {
      const chatId = await createChatIfNone(userText || 'Image attachment');
      
      let base64Image: string | undefined;
      if (userImage) {
        // Read file as base64 for UI preview
        base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(userImage);
        });
      }

      await saveMessage(chatId, 'user', userText, base64Image);

      const formData = new FormData();
      formData.append('message', userText);
      if (userImage) {
        formData.append('image', userImage);
      }
      
      // Pass recent history to backend
      const historyForApi = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));
      formData.append('messages', JSON.stringify(historyForApi));

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        body: formData
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(`Server returned an invalid response (Status: ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate response');
      }

      await saveMessage(chatId, 'model', data.text);

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
      // Add error message to UI
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: '*Sorry, I encountered an error while processing your request. Please try again.*',
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    "What is Aura Community ACT?",
    "Tell me about Aura Learning.",
    "What is Aura Play?",
    "Who is the owner of Aura?"
  ];

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
          <Bot className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Aura AI</h1>
        <p className="text-white/60 max-w-md mx-auto mb-8">
          Please sign in to use Aura AI. Your intelligent assistant for the Aura ecosystem.
        </p>
        <Link to="/login" className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20">
          Sign In to Access
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full h-[calc(100vh-80px)] overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "absolute md:relative z-50 w-72 h-full bg-[#050505] border-r border-white/5 flex flex-col transition-transform duration-300",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-4 border-b border-white/5">
          <button 
            onClick={handleNewChat}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors border border-white/5"
          >
            <Plus className="w-5 h-5" /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => { setActiveChatId(chat.id); setIsSidebarOpen(false); }}
              className={cn(
                "group w-full text-left px-3 py-3 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer",
                activeChatId === chat.id 
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                  : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </div>
              <button 
                onClick={(e) => handleDeleteChat(chat.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-white/50 hover:text-red-400 transition-all shrink-0 ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="text-center p-4 text-white/40 text-sm">
              No recent chats
            </div>
          )}
        </div>
        
        {isLocalMode && (
          <div className="p-3 bg-blue-500/10 border-t border-blue-500/20 text-xs text-blue-400">
            Running in Local Mode (Database tables not found). History will not be saved across reloads.
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] relative">
        {/* Header (Mobile) */}
        <div className="md:hidden flex items-center gap-4 p-4 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white/70 hover:text-white p-2">
            <MessageSquare className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 font-bold text-white">
            <Bot className="w-5 h-5 text-amber-500" /> Aura AI
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)]">
                <Sparkles className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">👋 Hi! I'm Aura AI</h2>
              <p className="text-white/60 mb-8 text-lg">Your intelligent assistant for the Aura Community ACT ecosystem.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {suggestions.map((sug, i) => (
                  <button 
                    key={i}
                    onClick={() => { setInput(sug); textareaRef.current?.focus(); }}
                    className="p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-amber-500/30 rounded-2xl text-left text-sm text-white/80 transition-all"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={cn(
                  "flex gap-4 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    msg.role === 'user' ? "bg-white/10" : "bg-amber-500/20 border border-amber-500/30 text-amber-500"
                  )}>
                    {msg.role === 'user' ? <div className="text-xs font-bold">{profile?.full_name?.charAt(0) || 'U'}</div> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div className={cn(
                    "rounded-2xl px-5 py-3.5",
                    msg.role === 'user' 
                      ? "bg-white/10 text-white" 
                      : "bg-transparent text-white/90"
                  )}>
                    {msg.image_data && (
                      <div className="mb-3 rounded-xl overflow-hidden max-w-sm border border-white/10">
                        <img src={msg.image_data} alt="Attachment" className="w-full h-auto" />
                      </div>
                    )}
                    
                    {msg.role === 'model' ? (
                      <div className="prose prose-invert prose-amber max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 text-[15px]">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap text-[15px]">{msg.content}</div>
                    )}
                    
                    {msg.role === 'model' && (
                      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => {navigator.clipboard.writeText(msg.content); toast.success('Copied!');}} className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors" title="Copy">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors" title="Good response">
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded-md text-white/40 hover:text-white transition-colors" title="Bad response">
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 max-w-[85%] animate-in fade-in">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 bg-amber-500/20 border border-amber-500/30 text-amber-500">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2 px-5 py-4">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="text-white/50 text-sm">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
          <div className="max-w-4xl mx-auto relative">
            
            {attachmentPreview && (
              <div className="absolute bottom-full left-0 mb-4 p-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl inline-flex relative group">
                <img src={attachmentPreview} alt="Preview" className="h-20 w-auto rounded-lg object-cover" />
                <button 
                  onClick={clearAttachment}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <form 
              onSubmit={handleSubmit}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-2 pl-4 flex items-end gap-2 shadow-2xl focus-within:border-amber-500/50 transition-colors relative"
            >
              <div className="relative pb-2">
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <label 
                  htmlFor="file-upload" 
                  className={cn(
                    "p-2 rounded-xl text-white/50 hover:text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer block",
                    isLoading && "opacity-50 cursor-not-allowed hover:text-white/50 hover:bg-transparent"
                  )}
                  title="Attach Image"
                >
                  <Paperclip className="w-5 h-5" />
                </label>
              </div>

              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aura AI anything..."
                className="flex-1 max-h-[200px] min-h-[44px] bg-transparent border-0 focus:ring-0 text-white placeholder-white/30 resize-none py-3"
                rows={1}
                disabled={isLoading}
              />

              <button
                type="submit"
                disabled={(!input.trim() && !attachment) || isLoading}
                className="p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-white/10 disabled:text-white/30 text-black font-bold rounded-xl transition-all shrink-0"
              >
                {isLoading ? <StopCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
            <div className="text-center mt-2">
              <span className="text-[10px] text-white/30 uppercase tracking-widest">Aura AI can make mistakes. Verify important info.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
