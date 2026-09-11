import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuraAI() {
  const navigate = useNavigate();

  useEffect(() => {
    const scriptId = 'kit-ai-v2-loader';
    
    // Inject the V2 script provided by Kit.ai if it's not already there
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.async = true;
      s.src = "https://kit.ai/widget/v2/kit-loader.js";
      s.setAttribute("data-bot-id", "2zpYbWGdPektFJou9huVVTGA");
      s.setAttribute("data-api-origin", "https://kit.ai");
      s.setAttribute("data-brand-color", "#CD6F49"); // Custom brand color from snippet
      s.setAttribute("data-position", "right");
      document.body.appendChild(s);
    }

    return () => {
      // We don't remove the script on unmount because the user might want 
      // the widget to persist while browsing, but if you want to strictly 
      // limit it to this page, you can uncomment the following lines.
      // 
      // const script = document.getElementById(scriptId);
      // if (script) script.remove();
      // // Kit.ai v2 widget exposes cleanup logic
      // if ((window as any).kitChat && (window as any).kitChat.destroy) {
      //   (window as any).kitChat.destroy();
      // }
    };
  }, []);

  return (
    <div className="pt-24 pb-12 min-h-[100dvh] flex flex-col items-center justify-center bg-[#050505] px-4 w-full">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/10 rounded-3xl p-8 text-center backdrop-blur-sm shadow-2xl shadow-[#CD6F49]/10">
        <div className="w-20 h-20 bg-[#CD6F49]/10 border border-[#CD6F49]/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner shadow-[#CD6F49]/20">
          <MessageSquare className="w-10 h-10 text-[#CD6F49]" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">Aura AI Launched</h1>
        <p className="text-white/60 mb-8 leading-relaxed text-sm">
          The official Aura AI floating assistant is now active. Click the chat bubble icon in the <strong className="text-[#CD6F49]">bottom right corner</strong> of your screen to start a conversation.
        </p>
        
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-white hover:text-white font-medium transition-all bg-[#CD6F49] hover:bg-[#b55c3a] px-6 py-3 rounded-full shadow-lg shadow-[#CD6F49]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </button>
      </div>
    </div>
  );
}
