import { useState } from "react";
import { LocationSection } from "../components/Sections";
import { Send, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    // Simulate network request
    setTimeout(() => {
      setStatus("success");
    }, 1200);
  };

  return (
    <div className="pt-12">
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6">Let's Connect</h1>
          <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            Have an idea, question, collaboration opportunity or simply want to connect with Aura Community ACT? Get in touch with us.
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Message Sent!</h3>
              <p className="text-white/60 max-w-sm mx-auto mb-8">
                Thank you for reaching out to Aura Community ACT. We have received your message and will get back to you soon.
              </p>
              <button 
                onClick={() => setStatus("idle")}
                className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full font-medium transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-white/80 block">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-white/80 block">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold uppercase tracking-widest text-white/80 block">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  required 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold uppercase tracking-widest text-white/80 block">Message</label>
                <textarea 
                  id="message" 
                  required 
                  rows={5}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg shadow-amber-500/20"
              >
                {status === "submitting" ? "Sending..." : "Send Message"}
                {!status && <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </section>

      <LocationSection />
    </div>
  );
}
