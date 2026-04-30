export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalDaysActive: number;
}

export const BADGES: Badge[] = [
  { id: 'profile_complete', name: 'Profile Pioneer', description: 'Completed your student profile', icon: '🎯', earned: false },
  { id: 'first_navigator', name: 'Explorer', description: 'Used the Career Navigator for the first time', icon: '🧭', earned: false },
  { id: 'roi_calculated', name: 'Finance Whiz', description: 'Calculated your education ROI', icon: '📊', earned: false },
  { id: 'sop_generated', name: 'Wordsmith', description: 'Generated your first SOP draft', icon: '✍️', earned: false },
  { id: 'loan_checked', name: 'Loan Ready', description: 'Checked your loan eligibility', icon: '💰', earned: false },
  { id: 'streak_7', name: '7-Day Streak', description: 'Used GradX for 7 days in a row', icon: '🔥', earned: false },
  { id: 'streak_30', name: 'Dedicated Scholar', description: 'Used GradX for 30 days in a row', icon: '🏆', earned: false },
  { id: 'readiness_80', name: 'Almost There', description: 'Achieved 80+ Readiness Score', icon: '⭐', earned: false },
  { id: 'shikha_chat', name: 'Good Conversation', description: 'Had your first chat with Shikha', icon: '💬', earned: false },
  { id: 'scholarship_finder', name: 'Scholarship Hunter', description: 'Explored scholarships matched to your profile', icon: '🏅', earned: false },
  { id: 'university_compared', name: 'Smart Comparer', description: 'Compared universities side by side', icon: '⚖️', earned: false },
  { id: 'first_application', name: 'First Step', description: 'Added your first university application to the tracker', icon: '📋', earned: false },
  { id: 'offer_received', name: 'Dream Unlocked', description: 'Received your first university offer!', icon: '🎉', earned: false },
  { id: 'docs_complete', name: 'Doc Master', description: 'Uploaded all required documents to the vault', icon: '📁', earned: false },
  { id: 'cost_explorer', name: 'Budget Pro', description: 'Calculated cost of living for your target city', icon: '💵', earned: false },
  { id: 'visa_guide', name: 'Visa Ready', description: 'Generated your personalized visa guide', icon: '🛂', earned: false },
  { id: 'community_post', name: 'Community Contributor', description: 'Shared your first experience in the community', icon: '🌟', earned: false },
  { id: 'cohort_joined', name: 'Team Player', description: 'Sent your first message in your cohort chat', icon: '👥', earned: false },
  { id: 'benchmarked', name: 'Know Your Stand', description: 'Benchmarked your profile against admitted students', icon: '📈', earned: false },
  { id: 'letter_analyzed', name: 'Offer in Hand', description: 'Analyzed your university acceptance letter', icon: '🎓', earned: false },
  { id: 'alumni_connected', name: 'Network Builder', description: 'Reached out to an alumni through GradX', icon: '🤝', earned: false },
  { id: 'post_admit', name: 'Ready for Departure', description: 'Generated your pre-departure checklist', icon: '✈️', earned: false },
  { id: 'score_card_shared', name: 'Proud Achiever', description: 'Generated your shareable GradX Score Card', icon: '🎖️', earned: false },
];

export function getStreakData(): StreakData {
  const stored = localStorage.getItem('gradx_streak');
  const today = new Date().toISOString().split('T')[0];

  if (!stored) {
    const initial: StreakData = { currentStreak: 1, longestStreak: 1, lastActiveDate: today, totalDaysActive: 1 };
    localStorage.setItem('gradx_streak', JSON.stringify(initial));
    return initial;
  }

  const data: StreakData = JSON.parse(stored);
  const lastDate = new Date(data.lastActiveDate);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return data;
  if (diffDays === 1) {
    const updated: StreakData = {
      ...data,
      currentStreak: data.currentStreak + 1,
      longestStreak: Math.max(data.longestStreak, data.currentStreak + 1),
      lastActiveDate: today,
      totalDaysActive: data.totalDaysActive + 1
    };
    localStorage.setItem('gradx_streak', JSON.stringify(updated));
    return updated;
  }
  
  const reset: StreakData = { 
    currentStreak: 1, 
    longestStreak: data.longestStreak, 
    lastActiveDate: today, 
    totalDaysActive: data.totalDaysActive + 1 
  };
  localStorage.setItem('gradx_streak', JSON.stringify(reset));
  return reset;
}

export function earnBadge(badgeId: string): void {
  const stored = localStorage.getItem('gradx_badges') || '[]';
  const earned: string[] = JSON.parse(stored);
  if (!earned.includes(badgeId)) {
    earned.push(badgeId);
    localStorage.setItem('gradx_badges', JSON.stringify(earned));
  }
}

export function getEarnedBadges(): string[] {
  return JSON.parse(localStorage.getItem('gradx_badges') || '[]');
}

export function getBadgeDescription(badgeId: string): string {
  const badge = BADGES.find(b => b.id === badgeId);
  return badge?.description || '';
}