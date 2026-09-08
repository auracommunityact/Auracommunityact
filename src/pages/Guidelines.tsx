import { Shield, MessageCircle, Share2, Users, AlertTriangle } from 'lucide-react';

export default function Guidelines() {
  const sections = [
    {
      title: "Respectful Communication",
      icon: <MessageCircle className="w-6 h-6 text-amber-500" />,
      content: (
        <ul className="list-disc list-inside space-y-2 text-white/70">
          <li><strong>Be Kind and Courteous:</strong> Treat all members with respect. Constructive criticism is welcome; personal attacks are not.</li>
          <li><strong>No Hate Speech or Bullying:</strong> Harassment, sexism, racism, or hate speech will not be tolerated under any circumstances.</li>
          <li><strong>Mind Your Tone:</strong> Written text can be easily misunderstood. Use a professional and encouraging tone when interacting.</li>
        </ul>
      )
    },
    {
      title: "Content & Sharing Rules",
      icon: <Share2 className="w-6 h-6 text-amber-500" />,
      content: (
        <ul className="list-disc list-inside space-y-2 text-white/70">
          <li><strong>No Spam or Self-Promotion:</strong> Keep self-promotion to designated channels. Do not spam links or irrelevant content.</li>
          <li><strong>Respect Intellectual Property:</strong> Do not share copyrighted material without permission. Always credit original creators when sharing resources.</li>
          <li><strong>Keep it Relevant:</strong> Ensure your discussions and shared content align with the core focus of the Aura Community ACT.</li>
        </ul>
      )
    },
    {
      title: "Collaboration & Networking",
      icon: <Users className="w-6 h-6 text-amber-500" />,
      content: (
        <ul className="list-disc list-inside space-y-2 text-white/70">
          <li><strong>Help Each Other Grow:</strong> Share your knowledge and mentor others when possible. We succeed together.</li>
          <li><strong>Professional Conduct:</strong> Maintain a professional demeanor when collaborating on community projects or attending events.</li>
          <li><strong>Inclusive Environment:</strong> Welcome newcomers and make sure everyone feels their voice is heard in collaborative settings.</li>
        </ul>
      )
    },
    {
      title: "Moderation Policies",
      icon: <Shield className="w-6 h-6 text-amber-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-white/70">
            Our moderation team actively monitors the community to ensure these guidelines are followed. 
            Violations of these rules may result in the following actions:
          </p>
          <ul className="list-disc list-inside space-y-2 text-white/70">
            <li><strong>Warning:</strong> A private message outlining the violation and requesting correction.</li>
            <li><strong>Temporary Suspension:</strong> Temporary removal of access to community features (e.g., Discord, Member Dashboard) for repeated or severe violations.</li>
            <li><strong>Permanent Ban:</strong> Permanent removal from the Aura Community ACT and all associated platforms for egregious or continued offenses (e.g., hate speech, severe harassment).</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Community Guidelines
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
          Welcome to the Aura Community ACT. To ensure our community remains a safe, welcoming, and productive environment for everyone, we ask all members to read and adhere to the following guidelines.
        </p>
      </div>

      <div className="space-y-12">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-black border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            </div>
            {section.content}
          </div>
        ))}
        
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 text-center mt-12">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Reporting Violations</h3>
          <p className="text-white/70 max-w-xl mx-auto">
            If you experience or witness behavior that violates these guidelines, please contact a community administrator or email us immediately at <a href="mailto:auracommunityact@gmail.com" className="text-amber-500 hover:underline">auracommunityact@gmail.com</a>. All reports are kept strictly confidential.
          </p>
        </div>
      </div>
    </div>
  );
}
