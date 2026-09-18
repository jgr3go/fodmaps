import { GROUPS, GROUP_LABEL, type FodmapProfile, type Rating } from '../types';
import { RATING_STYLE } from '../lib/fodmap';

const SHORT: Record<string, string> = { fructans: 'Fru', gos: 'GOS', lactose: 'Lac', fructose: 'Fro', polyols: 'Pol' };

export function RatingPill({ rating, label, small }: { rating: Rating | 'unknown'; label: string; small?: boolean }) {
  const cls = RATING_STYLE[rating ?? 'unknown'];
  return <span className={`inline-flex items-center rounded-full border font-medium ${small ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'} ${cls}`}>{label}</span>;
}

/** Inline flags for a row: shows moderate/high groups; green Low when all known groups are low; grey ? when untested. */
export function FodmapPills({ profile, overall, groupUnknown, conflictCount, compact = true }: {
  profile: FodmapProfile; overall: Rating; groupUnknown?: boolean; conflictCount?: number; compact?: boolean;
}) {
  const flagged = GROUPS.filter((g) => profile[g] === 'high' || profile[g] === 'moderate');
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {overall === null && <RatingPill rating="unknown" label="? untested" small={compact} />}
      {overall !== null && flagged.length === 0 && <RatingPill rating={overall} label={overall === 'low' ? 'Low' : overall} small={compact} />}
      {flagged.map((g) => (
        <RatingPill key={g} rating={profile[g]} label={`${compact ? SHORT[g] : GROUP_LABEL[g]} ${profile[g] === 'high' ? 'H' : 'M'}`} small={compact} />
      ))}
      {groupUnknown && overall && <span className="text-[10px] text-slate-400" title="rated without naming a FODMAP group">group?</span>}
      {!!conflictCount && <span className="text-[10px] text-amber-600" title="sources disagree">±</span>}
    </span>
  );
}
