import { ArrowLeft, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuraAI() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Prevent double scrolling on the body while on this full-screen route
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="pt-16 h-[100dvh] flex flex-col bg-[#050505] w-full">
      {/* Sub-header for back navigation */}
      <div className="flex items-center px-4 py-3 bg-black/40 border-b border-white/5 shrink-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Aura Community
        </button>
      </div>

      {/* Main embed container */}
      <div className="relative flex-1 w-full bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#050505]">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <p className="text-white/50 text-sm animate-pulse font-medium">Connecting to Aura AI...</p>
          </div>
        )}
        
        {/* Udify / Dify.ai iframe embed 
            Uses the direct chat URL which supports full-screen iframe embedding
        */}
        <iframe
          src="https://udify.app/chat/15ftxHUjVve7H7my"
          className="absolute inset-0 w-full h-full border-0"
          title="Aura AI Powered by Dify"
          allow="microphone"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
