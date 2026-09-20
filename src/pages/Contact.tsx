import { useState } from "react";
import { LocationSection } from "../components/Sections";
import { Send, CheckCircle2, Mail, Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const officialEmail = "auracommunityact@googlegroups.com";
  const supportEmail = "auracommunityact@gmail.com";

  const handleCopyEmail = (emailToCopy: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(emailToCopy)
        .then(() => {
          setCopiedEmail(emailToCopy);
          toast.success("Email address copied to clipboard!");
          setTimeout(() => setCopiedEmail(null), 2500);
        })
        .catch(() => {
          fallbackCopy(emailToCopy);
        });
    } else {
      fallbackCopy(emailToCopy);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setCopiedEmail(text);
        toast.success("Email address copied to clipboard!");
        setTimeout(() => setCopiedEmail(null), 2500);
      } else {
        toast.error("Could not copy email");
      }
    } catch {
      toast.error("Could not copy email");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    
    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string).trim();
    const email = (formData.get("email") as string).trim();
    const subject = (formData.get("subject") as string).trim();
    const message = (formData.get("message") as string).trim();

    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all fields.");
      setStatus("idle");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      setStatus("idle");
      return;
    }
    
    if (message.length < 10) {
      toast.error("Message is too short. Please provide more details.");
      setStatus("idle");
      return;
    }

    try {
      const { error } = await supabase.from("contact_messages").insert([{
        name, email, subject, message
      }]);
      
      if (error) throw error;
      
      setStatus("success");
      toast.success("Your message has been sent successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
      setStatus("idle");
    }
  };

  return (
    <div className="pt-12">
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4">
            <Mail className="w-4 h-4 text-amber-500" />
            <span>Contact Us</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Let's Connect</h1>
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            Have an idea, question, collaboration opportunity, or want to connect with Aura Community ACT? Get in touch with us through any of our channels.
          </p>
        </div>

        {/* Contact Email Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          {/* Primary Official Community Email Card */}
          <div 
            id="official-community-email-card"
            className="md:col-span-7 bg-gradient-to-b from-amber-500/10 via-white/[0.03] to-transparent border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-amber-500/5"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 block">
                    Official Community Email
                  </span>
                  <span className="text-xs text-white/50">Primary contact channel</span>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 mb-4">
                <span className="text-xs text-white/40 block mb-1 font-mono uppercase tracking-wider">Send email to</span>
                <a
                  id="official-community-email-link"
                  href={`mailto:${officialEmail}`}
                  className="text-base sm:text-lg md:text-xl font-bold text-white hover:text-amber-400 transition-colors break-all block tracking-tight"
                  title="Click or tap to compose email"
                >
                  {officialEmail}
                </a>
              </div>

              <p className="text-sm text-white/60 leading-relaxed mb-6">
                Official community group inbox for project queries, discussions, partnerships, and announcements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                id="official-email-us-btn"
                href={`mailto:${officialEmail}`}
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Mail className="w-4 h-4" />
                <span>Email Us</span>
              </a>

              <button
                id="copy-official-email-btn"
                type="button"
                onClick={() => handleCopyEmail(officialEmail)}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors active:scale-95"
                title="Copy email to clipboard"
                aria-label="Copy official email address"
              >
                {copiedEmail === officialEmail ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white/70" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Secondary Direct Support Email Card */}
          <div 
            id="direct-support-email-card"
            className="md:col-span-5 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-white/80" />
                </div>
                <div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/60 block">
                    Direct Support
                  </span>
                  <span className="text-xs text-white/40">Member assistance</span>
                </div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 sm:p-5 mb-4">
                <span className="text-xs text-white/40 block mb-1 font-mono uppercase tracking-wider">Alternative inbox</span>
                <a
                  id="direct-support-email-link"
                  href={`mailto:${supportEmail}`}
                  className="text-sm sm:text-base font-semibold text-white/90 hover:text-white transition-colors break-all block"
                  title="Click to compose email to direct support"
                >
                  {supportEmail}
                </a>
              </div>

              <p className="text-sm text-white/50 leading-relaxed mb-6">
                Direct channel for personal account support, verification, and general questions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                id="support-email-btn"
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors active:scale-95"
              >
                <ExternalLink className="w-4 h-4 text-white/70" />
                <span>Write to Support</span>
              </a>

              <button
                id="copy-support-email-btn"
                type="button"
                onClick={() => handleCopyEmail(supportEmail)}
                className="inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm transition-colors active:scale-95"
                title="Copy support email address"
                aria-label="Copy support email address"
              >
                {copiedEmail === supportEmail ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="mb-8 border-b border-white/10 pb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Send Us a Direct Message</h2>
            <p className="text-sm text-white/60">
              Fill out the form below and we will get back to you at your provided email address.
            </p>
          </div>

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
                    name="name"
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
                    name="email"
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
                  name="subject"
                  required 
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold uppercase tracking-widest text-white/80 block">Message</label>
                <textarea 
                  id="message" 
                  name="message"
                  required 
                  rows={5}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors resize-none"
                  placeholder="Your message here..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={status === "submitting"}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-black px-8 py-4 rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg shadow-amber-500/20 cursor-pointer"
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
