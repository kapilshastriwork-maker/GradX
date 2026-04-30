'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Target, Zap, ChevronRight, CheckCircle2, 
  Clock, Star, Trophy, ArrowUpCircle, BookOpen, Award
} from 'lucide-react';

interface GrowthTask {
  id: string;
  title: string;
  description: string;
  category: 'academics' | 'test_scores' | 'extracurriculars' | 'essays' | 'applications';
  impact: number;
  completed: boolean;
  dueDate?: string;
}

interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
}

const sampleTasks: GrowthTask[] = [
  {
    id: '1',
    title: 'Complete GRE Mock Test 3',
    description: 'Take a full-length GRE practice test to assess your readiness',
    category: 'test_scores',
    impact: 15,
    completed: false,
    dueDate: '2026-04-20',
  },
  {
    id: '2',
    title: 'Update SOP Draft',
    description: 'Refine your statement of purpose based on Shikha feedback',
    category: 'essays',
    impact: 20,
    completed: false,
    dueDate: '2026-04-18',
  },
  {
    id: '3',
    title: 'Request Professor Recommendation',
    description: 'Email your internship supervisor for a letter of recommendation',
    category: 'applications',
    impact: 25,
    completed: false,
    dueDate: '2026-04-22',
  },
  {
    id: '4',
    title: 'Add Research Project',
    description: 'Document your summer research work to your profile',
    category: 'extracurriculars',
    impact: 10,
    completed: true,
  },
  {
    id: '5',
    title: 'Improve GPA This Semester',
    description: 'Focus on maintaining above 8.5 GPA in final semester',
    category: 'academics',
    impact: 30,
    completed: false,
  },
];

const sampleChallenges: WeeklyChallenge[] = [
  {
    id: '1',
    title: 'Application Sprint',
    description: 'Complete 3 university applications this week',
    progress: 1,
    target: 3,
    reward: 100,
  },
  {
    id: '2',
    title: 'Essay Polish',
    description: 'Get feedback on 2 essays from Shikha',
    progress: 0,
    target: 2,
    reward: 75,
  },
  {
    id: '3',
    title: 'Test Score Boost',
    description: 'Improve GRE score by 5 points',
    progress: 0,
    target: 5,
    reward: 150,
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  academics: <BookOpen className="h-4 w-4" />,
  test_scores: <Award className="h-4 w-4" />,
  extracurriculars: <Star className="h-4 w-4" />,
  essays: <BookOpen className="h-4 w-4" />,
  applications: <ArrowUpCircle className="h-4 w-4" />,
};

const categoryColors: Record<string, string> = {
  academics: 'bg-purple-500',
  test_scores: 'bg-blue-500',
  extracurriculars: 'bg-emerald-500',
  essays: 'bg-orange-500',
  applications: 'bg-indigo-500',
};

export default function GrowthLoopPage() {
  const [tasks, setTasks] = useState<GrowthTask[]>(sampleTasks);
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>(sampleChallenges);
  const [xp, setXp] = useState(1250);
  const [streak, setStreak] = useState(7);
  const [level, setLevel] = useState(5);

  useEffect(() => {
  }, []);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  const totalImpact = activeTasks.reduce((sum, t) => sum + t.impact, 0);
  const completedImpact = completedTasks.reduce((sum, t) => sum + t.impact, 0);

  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId && !t.completed) {
        setXp(p => p + t.impact);
        return { ...t, completed: true };
      }
      return t;
    }));
  };

  const getProgressToNextLevel = () => {
    const xpForLevel = level * 500;
    const currentLevelXp = xp % xpForLevel;
    return (currentLevelXp / xpForLevel) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Growth Loop</h1>
            <p className="text-slate-400">Continuous improvement for your dream university</p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{level}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-yellow-400" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold">{xp.toLocaleString()} XP</p>
                  <Progress value={getProgressToNextLevel()} className="w-20 h-2" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-500/20 border-orange-500/30">
              <CardContent className="flex items-center gap-2 p-3">
                <Zap className="w-5 h-5 text-orange-400" />
                <span className="text-orange-400 font-bold">{streak} day streak</span>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-400" />
                Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-500 hover:border-purple-400'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <div>
                        <p className={`font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-white'}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-slate-400">{task.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-xs text-white ${categoryColors[task.category]}`}>
                            {task.category}
                          </span>
                          <span className="text-xs text-yellow-400">+{task.impact} XP</span>
                          {task.dueDate && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
                {completedTasks.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Completed</h3>
                    {completedTasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-slate-400 line-through">{task.title}</span>
                        </div>
                        <span className="text-emerald-400 text-sm">+{task.impact} XP</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Weekly Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {challenges.map(challenge => (
                  <div
                    key={challenge.id}
                    className="p-4 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{challenge.title}</h3>
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        +{challenge.reward} XP
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{challenge.description}</p>
                    <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                    <p className="text-sm text-slate-400 mt-2">
                      {challenge.progress} / {challenge.target} completed
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Your Growth Impact</h2>
                  <p className="text-slate-300">
                    Complete all tasks to boost your admission chances by{' '}
                    <span className="text-emerald-400 font-bold">+{totalImpact}%</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-8 text-center">
                <div>
                  <p className="text-3xl font-bold text-white">{completedTasks.length}</p>
                  <p className="text-sm text-slate-400">Completed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-400">{activeTasks.length}</p>
                  <p className="text-sm text-slate-400">Pending</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-400">+{completedImpact}</p>
                  <p className="text-sm text-slate-400">XP Earned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}