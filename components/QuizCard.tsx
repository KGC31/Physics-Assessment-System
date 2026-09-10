import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, ScoreLevel } from '../types';
import { cn } from '../utils';

interface QuizCardProps {
  question: Question;
  selectedAnswer?: ScoreLevel;
  onAnswer: (score: ScoreLevel) => void;
  onPrevious?: () => void;
  canGoBack?: boolean;
  disabled?: boolean;
}

const SCORE_LABELS: Record<ScoreLevel, { title: string, desc: string }> = {
  1: { title: 'Không có', desc: 'Hoàn toàn không xuất hiện.' },
  2: { title: 'Hiếm khi có (Ít)', desc: 'Xuất hiện 1-3 ngày/tuần hoặc < 1 tuần/tháng.' },
  3: { title: 'Thỉnh thoảng có (Đôi khi)', desc: 'Xuất hiện 3-4 ngày/tuần hoặc 1-2 tuần/tháng.' },
  4: { title: 'Thường xuyên có (Tương đối)', desc: 'Xuất hiện 4-6 ngày/tuần hoặc 2-3 tuần/tháng.' },
  5: { title: 'Luôn luôn có (Nhiều)', desc: 'Xuất hiện hầu hết các ngày.' },
};

export const QuizCard: React.FC<QuizCardProps> = ({ question, selectedAnswer, onAnswer, onPrevious, canGoBack, disabled }) => {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto flex flex-col items-center"
    >
      <div className="w-full mb-5 flex justify-between items-end">
        <div className="flex flex-col gap-1 w-full">
          <span className="text-emerald-600 text-sm font-bold tracking-wide uppercase">
            Câu hỏi {question.id} / Nhóm {question.group}
          </span>
          <p className="text-slate-500 text-sm italic mb-2 tracking-tight">
            Căn cứ vào cảm nhận của cơ thể trong 1 năm gần đây, ông bà hãy trả lời câu hỏi dưới đây:
          </p>
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 leading-snug">
            {question.text}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 w-full">
        {([1, 2, 3, 4, 5] as ScoreLevel[]).map((score) => {
          const isSelected = selectedAnswer === score;
          return (
            <button
              key={score}
              disabled={disabled}
              onClick={() => !disabled && onAnswer(score)}
              className={cn(
                "group flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all duration-200 text-left",
                isSelected
                  ? "border-emerald-600 bg-emerald-100 shadow-md shadow-emerald-100"
                  : "border-emerald-200 bg-emerald-50/70 hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-sm",
                disabled && "pointer-events-none"
              )}
            >
              <div className="flex items-center gap-4">
                <span className={cn(
                  "w-9 h-9 shrink-0 flex items-center justify-center rounded-lg font-bold transition-colors",
                  isSelected
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                )}>
                  {score}
                </span>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-base font-semibold",
                    isSelected ? "text-slate-900" : "text-slate-700"
                  )}>
                    {SCORE_LABELS[score].title}
                  </span>
                  <span className={cn(
                    "text-xs mt-0.5",
                    isSelected ? "text-emerald-700/80" : "text-slate-400 group-hover:text-slate-500"
                  )}>
                    {SCORE_LABELS[score].desc}
                  </span>
                </div>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="flex justify-between w-full mt-5">
        <button
          onClick={onPrevious}
          disabled={!canGoBack || disabled}
          className={cn(
            "px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors",
            canGoBack && !disabled
              ? "text-slate-400 hover:text-slate-600" 
              : "text-slate-300 cursor-not-allowed pointer-events-none"
          )}
        >
          Quay lại
        </button>
      </div>

    </motion.div>
  );
};
