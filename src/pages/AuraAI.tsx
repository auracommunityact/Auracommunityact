import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuraAI() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const navigate = useNavigate();
  const fallbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prevent double scrolling on the body while on this full-screen route
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // Fallback: If iframe doesn't load within 8 seconds (e.g. CSP block), show error and inject official JS widget
    fallbackTimeout.current = setTimeout(() => {
      if (isLoading) {
        setLoadError(true);
        const script = document.createElement("script");
        script.src = "https://kit.ai/widget/v1/kit-chat.min.js";
        script.setAttribute("data-bot-id", "2zpYbWGdPektFJou9huVVTGA");
        script.async = true;
        document.body.appendChild(script);
      }
    }, 8000);

    return () => {
      document.body.style.overflow = "";
      if (fallbackTimeout.current) clearTimeout(fallbackTimeout.current);
    };
  }, [isLoading]);

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
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#050505]">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
            <p className="text-white/50 text-sm animate-pulse font-medium">Connecting to Aura AI...</p>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#050505] p-6 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connection Taking Longer Than Expected</h3>
            <p className="text-white/50 text-sm max-w-md">
              The full-screen experience couldn't be loaded directly. We've launched the official Aura AI floating widget as a fallback. Please check the bottom right of your screen.
            </p>
          </div>
        )}
        
        {/* Kit.ai iframe embed 
            Uses the bot's public URL embedded within the site.
            If iframe restrictions are ever applied by Kit.ai in the future, 
            the JS embed fallback triggers automatically.
        */}
        <iframe
          src="https://kit.ai/bot/2zpYbWGdPektFJou9huVVTGA?embed=true"
          className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          title="Aura AI Powered by Kit.ai"
          allow="microphone"
          onLoad={() => {
            setIsLoading(false);
            if (fallbackTimeout.current) clearTimeout(fallbackTimeout.current);
          }}
        />
      </div>
    </div>
  );
}
