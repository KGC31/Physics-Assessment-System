import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.max(0, Math.min(100, Math.round(((current - 1) / total) * 100)));

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-2 text-sm font-medium">
        <span className="text-slate-500">Tiến độ</span>
        <span className="text-emerald-600 border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 rounded-full">
          {current} / {total}
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
