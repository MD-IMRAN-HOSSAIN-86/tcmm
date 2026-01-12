
import React from 'react';
import { SummaryStats } from '../types';
import { Icons } from '../constants';

interface SummaryCardsProps {
  stats: SummaryStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  const cards = [
    { label: 'সকালের মিল', count: stats.breakfast, icon: Icons.Breakfast, color: 'from-emerald-600 to-emerald-800' },
    { label: 'দুপুরের মিল', count: stats.lunch, icon: Icons.Lunch, color: 'from-blue-600 to-blue-800' },
    { label: 'রাতের মিল', count: stats.dinner, icon: Icons.Dinner, color: 'from-purple-600 to-purple-800' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 px-4 sm:px-0">
      {cards.map((card) => (
        <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-xl transform transition-all border border-white/10`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 font-bold uppercase tracking-wider text-xs">{card.label}</span>
            <div className="text-white/50"><card.icon /></div>
          </div>
          <div className="text-4xl font-bold text-white mb-1">
            {card.count} <span className="text-xl font-normal opacity-70">টি</span>
          </div>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-tighter">
            মোট সক্রিয় মিল সংখ্যা
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
