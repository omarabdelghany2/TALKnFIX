import { Trophy } from 'lucide-react';

interface ReputationBadgeProps {
  reputation: number;
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const ReputationBadge = ({ reputation, level, size = 'md', showIcon = true }: ReputationBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2',
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'bg-purple-500';
    if (level >= 5) return 'bg-blue-500';
    if (level >= 3) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      {showIcon && <Trophy className="h-4 w-4 text-yellow-500" />}
      <div className="flex items-center gap-2">
        <span className="font-medium text-foreground">
          {reputation.toLocaleString()} pts
        </span>
        <span className={`${getLevelColor(level)} text-white px-2 py-0.5 rounded-full text-xs font-semibold`}>
          Lvl {level}
        </span>
      </div>
    </div>
  );
};

export default ReputationBadge;
