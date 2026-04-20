import { cn } from '@/lib/utils';

interface TrustScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function toSafeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getTrustLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-trust-excellent', bg: 'bg-trust-excellent/10' };
  if (score >= 60) return { label: 'Great', color: 'text-trust-great', bg: 'bg-trust-great/10' };
  if (score >= 40) return { label: 'Average', color: 'text-trust-average', bg: 'bg-trust-average/10' };
  if (score >= 20) return { label: 'Poor', color: 'text-trust-poor', bg: 'bg-trust-poor/10' };
  return { label: 'Bad', color: 'text-trust-bad', bg: 'bg-trust-bad/10' };
}

const sizeStyles = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

export function TrustScoreBadge({ score, size = 'md', showLabel = true }: TrustScoreBadgeProps) {
  const safeScore = toSafeNumber(score);
  const { label, color, bg } = getTrustLabel(safeScore);
  const displayScore = Math.round(safeScore);

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-bold',
          sizeStyles[size],
          color,
          bg,
        )}
      >
        {displayScore}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', color)}>{label}</span>
      )}
    </div>
  );
}

interface TrustBreakdownProps {
  breakdown: {
    overall: number;
    baseRating: number;
    volumeConfidence: number;
    consistency: number;
    recency: number;
    responsiveness: number;
    warningPenalty: number;
    suspiciousPenalty: number;
    moderationPenalty: number;
  };
}

export function TrustScoreBreakdown({ breakdown }: TrustBreakdownProps) {
  const items = [
    { label: 'Base Rating', value: toSafeNumber(breakdown.baseRating), max: 40 },
    { label: 'Volume Confidence', value: toSafeNumber(breakdown.volumeConfidence), max: 15 },
    { label: 'Consistency', value: toSafeNumber(breakdown.consistency), max: 10 },
    { label: 'Recency', value: toSafeNumber(breakdown.recency), max: 10 },
    { label: 'Responsiveness', value: toSafeNumber(breakdown.responsiveness), max: 10 },
    { label: 'Warning Penalty', value: toSafeNumber(breakdown.warningPenalty), max: 0, isNegative: true },
    { label: 'Suspicious Penalty', value: toSafeNumber(breakdown.suspiciousPenalty), max: 0, isNegative: true },
    { label: 'Moderation Penalty', value: toSafeNumber(breakdown.moderationPenalty), max: 0, isNegative: true },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Trust Score Breakdown</span>
        <TrustScoreBadge score={toSafeNumber(breakdown.overall)} size="sm" />
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <span className="text-muted">{item.label}</span>
            <span
              className={cn(
                'font-medium',
                item.isNegative && item.value < 0 ? 'text-trust-bad' : 'text-foreground',
              )}
            >
              {item.value > 0 ? '+' : ''}{item.value.toFixed(1)}
              {!item.isNegative && <span className="text-muted">/{item.max}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
