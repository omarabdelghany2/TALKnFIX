import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { usersAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import ReputationBadge from '@/components/ReputationBadge';
import BadgesList from '@/components/BadgesList';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';

interface LeaderboardUser {
  _id: string;
  username: string;
  fullName?: string;
  avatar?: string;
  reputation: number;
  level: number;
  badges: any[];
  stats: {
    totalPosts: number;
    totalComments: number;
    totalReactionsReceived: number;
  };
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getLeaderboard(50);
      setUsers(response.users);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load leaderboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-8 w-8 text-yellow-500" />;
    if (index === 1) return <Medal className="h-7 w-7 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-500 font-bold text-2xl';
    if (index === 1) return 'text-gray-500 font-bold text-xl';
    if (index === 2) return 'text-amber-600 font-bold text-lg';
    return 'text-gray-400 font-medium text-base';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navbar />
        <div className="container max-w-4xl mx-auto py-8">
          <div className="text-center">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navbar />
      <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          Top contributors on IsuueTalk ranked by reputation
        </p>
      </div>

      <div className="space-y-3">
        {users.map((user, index) => (
          <Card
            key={user._id}
            className={`p-4 cursor-pointer hover:shadow-lg transition-all ${
              index < 3 ? 'border-2' : ''
            } ${
              index === 0
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                : index === 1
                ? 'border-gray-400 bg-gray-50 dark:bg-gray-900/20'
                : index === 2
                ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/20'
                : ''
            }`}
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex items-center justify-center w-16">
                {getRankIcon(index) || (
                  <span className={getRankColor(index)}>#{index + 1}</span>
                )}
              </div>

              {/* Avatar and Info */}
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {user.fullName || user.username}
                </h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>

              {/* Reputation Badge */}
              <div className="hidden md:block">
                <ReputationBadge
                  reputation={user.reputation}
                  level={user.level}
                  size="lg"
                />
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">
                  {user.stats.totalPosts}
                </span>{' '}
                posts
              </div>
              <div>
                <span className="font-semibold text-foreground">
                  {user.stats.totalComments}
                </span>{' '}
                comments
              </div>
              <div>
                <span className="font-semibold text-foreground">
                  {user.stats.totalReactionsReceived}
                </span>{' '}
                reactions
              </div>
            </div>

            {/* Badges */}
            {user.badges.length > 0 && (
              <div className="mt-4">
                <BadgesList badges={user.badges} maxDisplay={5} />
              </div>
            )}

            {/* Mobile Reputation */}
            <div className="mt-4 md:hidden">
              <ReputationBadge
                reputation={user.reputation}
                level={user.level}
                size="md"
              />
            </div>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          No users found. Be the first to contribute!
        </Card>
      )}
      </div>
    </div>
  );
};

export default Leaderboard;
