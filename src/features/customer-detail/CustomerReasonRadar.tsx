import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { getReasonShortLabel } from '@/utils/risk';
import type { ChurnReason } from '@/types/churn';

type CustomerReasonRadarProps = {
  churnReasons: ChurnReason[];
};

export function CustomerReasonRadar({
  churnReasons,
}: CustomerReasonRadarProps) {
  const radarData = churnReasons.map((reason) => ({
    label: getReasonShortLabel(reason.label),
    score: reason.score,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} outerRadius="72%">
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#6b7280' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
          />
          <Radar
            dataKey="score"
            stroke="#466CFF"
            fill="#466CFF"
            fillOpacity={0.25}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
