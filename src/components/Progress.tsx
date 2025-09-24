import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { TrendingUp, Award, Clock, BarChart3, Beaker, Zap, Microscope } from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';

interface ProgressProps {
  user: User | null;
}

interface ExperimentData {
  id: string;
  labType: string;
  experimentType?: string;
  score: number;
  timestamp: any;
  data: any;
}

interface ProgressStats {
  totalExperiments: number;
  averageScore: number;
  totalTimeSpent: number;
  labProgress: {
    chemistry: number;
    physics: number;
    biology: number;
  };
  achievements: string[];
}

const Progress: React.FC<ProgressProps> = ({ user }) => {
  const { db } = useFirebase();
  const [experiments, setExperiments] = useState<ExperimentData[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    totalExperiments: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    labProgress: {
      chemistry: 0,
      physics: 0,
      biology: 0
    },
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProgressData = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(db, 'experiments'), 
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const experimentData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as ExperimentData[];

      setExperiments(experimentData);
      calculateStats(experimentData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (experimentData: ExperimentData[]) => {
    if (experimentData.length === 0) {
      setStats({
        totalExperiments: 0,
        averageScore: 0,
        totalTimeSpent: 0,
        labProgress: { chemistry: 0, physics: 0, biology: 0 },
        achievements: []
      });
      return;
    }

    const totalExperiments = experimentData.length;
    const averageScore = experimentData.reduce((sum, exp) => sum + exp.score, 0) / totalExperiments;
    
    // Calculate lab progress
    const labCounts = experimentData.reduce((counts, exp) => {
      counts[exp.labType] = (counts[exp.labType] || 0) + 1;
      return counts;
    }, {} as { [key: string]: number });

    const labProgress = {
      chemistry: Math.min(100, (labCounts.chemistry || 0) * 20),
      physics: Math.min(100, (labCounts.physics || 0) * 20),
      biology: Math.min(100, (labCounts.biology || 0) * 20)
    };

    // Calculate achievements
    const achievements = [];
    if (totalExperiments >= 1) achievements.push('First Experiment');
    if (totalExperiments >= 5) achievements.push('Curious Scientist');
    if (totalExperiments >= 10) achievements.push('Lab Expert');
    if (averageScore >= 85) achievements.push('High Achiever');
    if (labCounts.chemistry >= 3) achievements.push('Chemistry Master');
    if (labCounts.physics >= 3) achievements.push('Physics Guru');
    if (labCounts.biology >= 3) achievements.push('Biology Expert');

    setStats({
      totalExperiments,
      averageScore,
      totalTimeSpent: totalExperiments * 15, // Estimate 15 minutes per experiment
      labProgress,
      achievements
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getLabIcon = (labType: string) => {
    switch (labType) {
      case 'chemistry': return Beaker;
      case 'physics': return Zap;
      case 'biology': return Microscope;
      default: return BarChart3;
    }
  };

  const getLabColor = (labType: string) => {
    switch (labType) {
      case 'chemistry': return 'from-green-400 to-blue-500';
      case 'physics': return 'from-yellow-400 to-orange-500';
      case 'biology': return 'from-purple-400 to-pink-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-12">
            <TrendingUp size={64} className="mx-auto mb-6 text-gray-400" />
            <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
            <p className="text-xl text-gray-300">
              Please sign in to view your experiment progress and achievements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-white text-xl">Loading your progress...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <TrendingUp size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your Progress
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Track your learning journey through virtual lab experiments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="text-blue-400" size={32} />
              <span className="text-3xl font-bold text-white">{stats.totalExperiments}</span>
            </div>
            <div className="text-gray-300">Total Experiments</div>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="text-yellow-400" size={32} />
              <span className="text-3xl font-bold text-white">{stats.averageScore.toFixed(0)}%</span>
            </div>
            <div className="text-gray-300">Average Score</div>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="text-green-400" size={32} />
              <span className="text-3xl font-bold text-white">{Math.floor(stats.totalTimeSpent / 60)}h</span>
            </div>
            <div className="text-gray-300">Time Spent</div>
          </div>

          <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="text-purple-400" size={32} />
              <span className="text-3xl font-bold text-white">{stats.achievements.length}</span>
            </div>
            <div className="text-gray-300">Achievements</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lab Progress */}
          <div className="lg:col-span-2 bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Lab Progress</h2>
            
            <div className="space-y-6">
              {Object.entries(stats.labProgress).map(([lab, progress]) => {
                const Icon = getLabIcon(lab);
                const gradientClass = getLabColor(lab);
                
                return (
                  <div key={lab} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${gradientClass} rounded-lg flex items-center justify-center`}>
                          <Icon size={20} className="text-white" />
                        </div>
                        <span className="text-white font-medium capitalize">{lab} Lab</span>
                      </div>
                      <span className="text-white font-bold">{progress}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${gradientClass} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent Experiments */}
            <div className="mt-8">
              <h3 className="text-xl font-bold text-white mb-4">Recent Experiments</h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {experiments.slice(0, 10).map((experiment, index) => {
                  const Icon = getLabIcon(experiment.labType);
                  const gradientClass = getLabColor(experiment.labType);
                  
                  return (
                    <div key={experiment.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-br ${gradientClass} rounded-lg flex items-center justify-center`}>
                            <Icon size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium capitalize">
                              {experiment.labType} {experiment.experimentType && `- ${experiment.experimentType}`}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {formatDate(experiment.timestamp)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-bold">{experiment.score}%</div>
                          <div className={`text-xs ${
                            experiment.score >= 90 ? 'text-green-400' :
                            experiment.score >= 70 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {experiment.score >= 90 ? 'Excellent' :
                             experiment.score >= 70 ? 'Good' : 'Needs Improvement'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Achievements</h2>
            
            <div className="space-y-4">
              {stats.achievements.map((achievement, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-600/30">
                  <div className="flex items-center space-x-3">
                    <Award className="text-yellow-400" size={24} />
                    <div>
                      <div className="text-white font-medium">{achievement}</div>
                      <div className="text-yellow-300 text-sm">Unlocked!</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {stats.achievements.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Award size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Complete experiments to earn achievements!</p>
                </div>
              )}
            </div>

            {/* Performance Chart */}
            <div className="mt-8">
              <h3 className="text-white font-medium mb-4">Score Trend</h3>
              <div className="h-32 bg-gray-800/50 rounded-lg p-4 relative overflow-hidden">
                {experiments.length >= 2 ? (
                  <svg width="100%" height="100%" className="absolute inset-0">
                    <path
                      d={experiments.slice(-10).reverse().map((exp, i) => 
                        `${i === 0 ? 'M' : 'L'} ${(i / Math.max(9, experiments.slice(-10).length - 1)) * 100}% ${100 - (exp.score / 100) * 80}%`
                      ).join(' ')}
                      stroke="#3B82F6"
                      strokeWidth="3"
                      fill="none"
                      className="opacity-80"
                    />
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Complete more experiments to see trends
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;