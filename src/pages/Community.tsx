import { Link } from "react-router-dom";
import { CommunitySection } from "../components/Sections";
import { useAuth } from "../contexts/AuthContext";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Community() {
  const { user, profile } = useAuth();

  return (
    <div className="pt-12 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Aura Community</h1>
        <p className="text-lg text-white/60 mb-12">
          Join our growing ecosystem of creators, developers, and innovators. 
          Connect with like-minded individuals and build the future together.
        </p>

        {!user ? (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Please login or create an account to join Aura Community ACT.</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/login" className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-full font-bold transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg mx-auto">
            {profile?.status === 'approved' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">You're a Member ✓</h2>
                <p className="text-white/70">Welcome to Aura Community ACT!</p>
              </div>
            ) : profile?.status === 'pending' || profile?.status === 'under_review' ? (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Application {profile.status === 'pending' ? 'Pending' : 'Under Review'}</h2>
                <Link to="/my-application" className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-colors">
                  View Status
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to join us?</h2>
                <Link to="/join-community" className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-full font-bold transition-colors">
                  Start Application <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <CommunitySection />
    </div>
  );
}
