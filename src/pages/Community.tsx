import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { CommunitySection } from "../components/Sections";
import { EventCalendar } from "../components/EventCalendar";
import { useAuth } from "../contexts/AuthContext";
import { supabase, CommunityApplication } from "../lib/supabase";
import { ArrowRight, CheckCircle, Clock, AlertCircle, LayoutDashboard, User } from "lucide-react";

export default function Community() {
  const { user, profile, loading: authLoading } = useAuth();
  const [application, setApplication] = useState<CommunityApplication | null>(null);
  const [loadingApp, setLoadingApp] = useState(false);

  // Fetch the current user's latest community application
  const fetchApplication = useCallback(async (userId: string) => {
    try {
      setLoadingApp(true);
      const { data, error } = await supabase
        .from("community_applications")
        .select("*")
        .eq("user_id", userId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setApplication(data);
      } else {
        setApplication(null);
      }
    } catch (err) {
      console.error("Error fetching community application:", err);
      setApplication(null);
    } finally {
      setLoadingApp(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchApplication(user.id);

      // Listen for real-time changes on community_applications and profiles for instant state updates
      const channel = supabase
        .channel(`community-page-updates-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "community_applications",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchApplication(user.id);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${user.id}`,
          },
          () => {
            fetchApplication(user.id);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setApplication(null);
      setLoadingApp(false);
    }
  }, [user?.id, fetchApplication]);

  // Determine membership status from database (profile and latest application)
  const isMember = Boolean(
    user && (
      profile?.status === "member" || 
      profile?.status === "accepted" || 
      application?.status === "accepted"
    )
  );

  const isUnderReview = Boolean(
    user && !isMember && (
      profile?.status === "under_review" || 
      profile?.status === "pending" || 
      application?.status === "under_review" || 
      application?.status === "pending"
    )
  );

  const isRejected = Boolean(
    user && !isMember && !isUnderReview && (
      profile?.status === "rejected" || 
      application?.status === "rejected"
    )
  );

  const isInitialLoading = authLoading || (Boolean(user) && loadingApp && !profile && !application);

  return (
    <div className="pt-12 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">Aura Community</h1>
        <p className="text-lg text-white/60 mb-12 leading-relaxed">
          Join our growing ecosystem of creators, developers, and innovators. 
          Connect with like-minded individuals and build the future together.
        </p>
        
        {isInitialLoading ? (
          /* Subtle skeleton state during initial auth/data hydration */
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg mx-auto flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-white/5 mb-4" />
            <div className="h-6 w-48 bg-white/10 rounded-full mb-3" />
            <div className="h-4 w-64 bg-white/5 rounded-full" />
          </div>
        ) : !user ? (
          /* GUEST / UNAUTHENTICATED: Show login/signup CTA */
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Please login or create an account to join Aura Community ACT.
            </h2>
            <p className="text-white/60 text-sm mb-8">
              Sign in with your account to submit a membership application or access your status.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 transition-colors">
                Login
              </Link>
              <Link to="/signup" className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-full font-bold transition-colors">
                Create Account
              </Link>
            </div>
          </div>
        ) : isMember ? (
          /* APPROVED / ACTIVE MEMBER: Show Member badge and welcome, hide join prompts */
          <div className="bg-white/[0.03] backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 sm:p-10 max-w-lg mx-auto relative overflow-hidden shadow-2xl shadow-emerald-950/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 border border-emerald-500/40 shadow-lg shadow-emerald-950/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">You're a Member ✓</h2>
              <p className="text-white/70 text-base mb-6">Welcome to Aura Community ACT!</p>
              
              <div className="flex flex-wrap gap-3 justify-center w-full">
                <Link 
                  to="/members" 
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Members Area</span>
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium text-sm transition-colors border border-white/10"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
              </div>
            </div>
          </div>
        ) : isUnderReview ? (
          /* UNDER REVIEW / PENDING: Inform applicant and prevent duplicate submission */
          <div className="bg-white/[0.03] backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 sm:p-10 max-w-lg mx-auto relative overflow-hidden shadow-2xl shadow-amber-950/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-4 border border-amber-500/40">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Application Under Review</h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
                Your application has been received and is currently under review by the Aura Community ACT team. We will update your status as soon as it is processed.
              </p>
              <Link 
                to="/my-application" 
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-sm transition-colors border border-white/10"
              >
                <span>View Application Status</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : isRejected ? (
          /* REJECTED: Show rejection details and provide option to view details or re-apply */
          <div className="bg-white/[0.03] backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 sm:p-10 max-w-lg mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-500/40">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Application Not Approved</h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
                {application?.rejection_reason 
                  ? `Feedback: ${application.rejection_reason}` 
                  : "Your application was not approved at this time. You can review your submission details or submit an updated application."}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link 
                  to="/my-application" 
                  className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium text-sm transition-colors border border-white/10"
                >
                  View Details
                </Link>
                <Link 
                  to="/join-community" 
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-full font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
                >
                  Re-apply
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* NOT APPLIED YET: User is logged in but hasn't submitted an application */
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 max-w-lg mx-auto">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Ready to join us?</h2>
              <p className="text-white/60 text-sm sm:text-base mb-6 leading-relaxed">
                Take the first step to join our creators, developers, and builders ecosystem.
              </p>
              <Link 
                to="/join-community" 
                className="flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black rounded-full font-bold transition-all shadow-lg shadow-amber-500/20"
              >
                <span>Start Application</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Community Event Calendar */}
      <EventCalendar />

      {/*
        CONDITIONAL "Join the Aura Community" SECTION:
        - If the user is an active/approved member (isMember): HIDE the entire section and join button.
        - If the user's application is under review (isUnderReview): HIDE the section to prevent duplicate join attempts.
        - If the user has NOT joined yet (!user or not applied): SHOW the section with the "Join Community" button.
        - If the user's application was rejected: Show section with "Re-apply to Join".
      */}
      {!isInitialLoading && !isMember && !isUnderReview && (
        <CommunitySection 
          ctaLink="/join-community" 
          ctaText={isRejected ? "Re-apply to Join" : "Join Community"} 
        />
      )}
    </div>
  );
}
