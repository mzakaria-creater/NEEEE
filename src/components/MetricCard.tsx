/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MetricCardProps {
  id: string;
  title: string;
  value: number | string;
  subtitle?: string;
  description?: string;
  subtitleColor?: 'secondary' | 'emerald' | 'error' | 'sky';
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  valueStyle?: React.CSSProperties;
  subtitleStyle?: React.CSSProperties;
}

export function MetricCard({
  title,
  value,
  subtitle,
  description,
  subtitleColor = 'secondary',
  icon,
  isActive = false,
  onClick,
  valueStyle,
  subtitleStyle,
}: MetricCardProps) {
  const getBorderColor = () => {
    if (isActive) {
      if (subtitleColor === 'emerald') return 'border-emerald-500 shadow-lg shadow-emerald-500/10';
      if (subtitleColor === 'error') return 'border-red-500 shadow-lg shadow-red-500/10';
      return 'border-amber-400 shadow-lg shadow-amber-500/10';
    }
    return 'border-white/10 hover:border-white/20';
  };

  const getSubtitleClass = () => {
    if (subtitleColor === 'emerald') return 'text-emerald-400';
    if (subtitleColor === 'error') return 'text-red-400';
    if (subtitleColor === 'sky') return 'text-sky-400';
    return 'text-amber-400';
  };

  const displaySubtitle = subtitle || description || '';

  return (
    <div
      id={`metric-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`glass-card rounded-xl p-5 flex flex-col justify-between min-h-[140px] transition-all duration-300 cursor-pointer select-none border group hover:scale-[1.02] transform ${getBorderColor()}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          {title}
        </span>
        <div className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="flex items-baseline gap-2 mt-4">
          <span 
            className="text-4xl font-extrabold tracking-tight text-white font-sans"
            style={valueStyle}
          >
            {value}
          </span>
          <span 
            className={`text-xs font-medium ${getSubtitleClass()} transition-all`}
            style={subtitleStyle}
          >
            {displaySubtitle}
          </span>
        </div>
      </div>
    </div>
  );
}
