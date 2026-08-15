import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps { current: number; total: number; }
export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.max(0, Math.min(100, Math.round(((current - 1) / total) * 100)));
  return <div className="w-full" aria-label={`Tiến độ câu hỏi ${current} trên ${total}`}><div className="mb-2 flex items-center justify-between text-xs font-semibold"><span className="text-muted-foreground">Tiến độ khảo sát</span><span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{current} / {total}</span></div><div className="h-2 w-full overflow-hidden rounded-full bg-muted"><motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} /></div></div>;
};
