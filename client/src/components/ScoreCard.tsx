import React from 'react';

type ScoreCardProps = {
  title: string;
  value: string | number;
  tone?: 'blue' | 'green' | 'purple' | 'amber';
};

const toneMap: Record<NonNullable<ScoreCardProps['tone']>, string> = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-emerald-100 text-emerald-700',
  purple: 'bg-violet-100 text-violet-700',
  amber: 'bg-amber-100 text-amber-700',
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ title, value, tone = 'blue' }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${toneMap[tone]}`}>
        {value}
      </div>
    </div>
  );
};
