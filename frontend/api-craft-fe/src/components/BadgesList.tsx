import { formatDistanceToNow } from 'date-fns';

interface Badge {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

interface BadgesListProps {
  badges: Badge[];
  showEarnedDate?: boolean;
  maxDisplay?: number;
}

const BadgesList = ({ badges, showEarnedDate = false, maxDisplay }: BadgesListProps) => {
  const displayBadges = maxDisplay ? badges.slice(0, maxDisplay) : badges;
  const remaining = maxDisplay && badges.length > maxDisplay ? badges.length - maxDisplay : 0;

  if (badges.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No badges earned yet. Keep contributing!
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {displayBadges.map((badge) => (
        <div
          key={badge.badgeId}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group relative"
          title={badge.description}
        >
          <span className="text-xl">{badge.icon}</span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{badge.name}</span>
            {showEarnedDate && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(badge.earnedAt), { addSuffix: true })}
              </span>
            )}
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            {badge.description}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
          </div>
        </div>
      ))}

      {remaining > 0 && (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground">
          +{remaining} more
        </div>
      )}
    </div>
  );
};

export default BadgesList;
