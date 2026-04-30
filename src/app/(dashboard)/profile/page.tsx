"use client";

import { useState, useEffect } from "react";
import { User, Calendar, Check, Lock, Star, Sparkles, Trophy, Flame, MessageCircle, PenLine, TrendingUp, Target, Compass } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSetupModal } from "@/components/shared/ProfileSetupModal";
import { BADGES, getEarnedBadges, getStreakData } from "@/lib/gamification";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [streak, setStreak] = useState<{currentStreak: number; longestStreak: number; totalDaysActive: number}>({ currentStreak: 0, longestStreak: 0, totalDaysActive: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(profileData);
        setEarnedBadges(getEarnedBadges());
        setStreak(getStreakData());
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-600" />
      </div>
    );
  }

  const initials = (profile?.full_name || "S").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">{initials}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile?.full_name || "Student"}</h1>
              <p className="text-gray-500">{profile?.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1 text-sm text-amber-600">
                  <Flame className="w-4 h-4" /> {streak.currentStreak} day streak
                </span>
                <span className="text-sm text-gray-500">Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
            <Button onClick={() => setShowProfileModal(true)} variant="outline">Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Achievements</h2>
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
          {BADGES.map((badge) => {
            const isEarned = earnedBadges.includes(badge.id);
            return (
              <Card key={badge.id} className={isEarned ? "bg-white" : "bg-gray-50 opacity-60"}>
                <CardContent className="pt-4 text-center">
                  <div className={`text-4xl mb-2 ${isEarned ? '' : 'grayscale'}`}>{badge.icon}</div>
                  <h3 className={`font-semibold text-sm ${isEarned ? 'text-gray-900' : 'text-gray-400'}`}>{badge.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                  {!isEarned && <p className="text-xs text-gray-400 mt-2">🔒 Locked</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Profile Details */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Academic</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">CGPA:</span> {profile?.cgpa || "—"}</p>
                <p><span className="text-gray-500">GRE Score:</span> {profile?.gre_score || "—"}</p>
                <p><span className="text-gray-500">IELTS Score:</span> {profile?.ielts_score || "—"}</p>
                <p><span className="text-gray-500">Field of Study:</span> {profile?.field_of_study || "—"}</p>
                <p><span className="text-gray-500">Target Degree:</span> {profile?.target_degree || "—"}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Plans</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Target Country:</span> {profile?.target_country || "—"}</p>
                <p><span className="text-gray-500">Budget:</span> {profile?.budget_inr || "—"}</p>
                <p><span className="text-gray-500">Intake:</span> {profile?.intake_season} {profile?.intake_year || ""}</p>
                <p><span className="text-gray-500">Work Experience:</span> {profile?.work_experience_months || 0} months</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-3">Platform</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Readiness Score:</span> {profile?.readiness_score || "—"}</p>
                <p><span className="text-gray-500">Loan Score:</span> {profile?.loan_readiness_score || "—"}</p>
                <p><span className="text-gray-500">Days Active:</span> {streak.totalDaysActive}</p>
                <p><span className="text-gray-500">Badges Earned:</span> {earnedBadges.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {user && (
        <ProfileSetupModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userId={user.id}
          userEmail={user.email || ""}
        />
      )}
    </div>
  );
}