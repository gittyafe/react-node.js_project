import React from 'react';

type StatCardProps = {
  title: string;
  value: string | undefined;
  tone: 'blue' | 'green' | 'purple';
};

const toneClasses: Record<StatCardProps['tone'], string> = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  purple: 'bg-purple-50',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, tone }) => {
  return (
    <div className={`${toneClasses[tone]} p-4 rounded`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-gray-700">{value || '—'}</p>
    </div>
  );
};
