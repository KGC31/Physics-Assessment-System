'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { QuizCard } from '@/components/QuizCard';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ScoreLevel } from '@/types';
import { RequireAuth } from '@/components/RequireAuth';
export default function QuizRoute() { const router = useRouter(); const a = useAssessment(); const question = a.activeQuestions[a.currentQuestionIndex]; if (!question) return null; return <RequireAuth><AppShell><QuizCard question={question} selectedAnswer={a.answers[question.id] as ScoreLevel} onAnswer={(score) => { const hasNext = a.answerQuestion(score); window.setTimeout(() => { if (!hasNext) router.push('/results'); }, 300); }} onPrevious={() => { if (a.currentQuestionIndex > 0) a.previousQuestion(); else router.push('/intake'); }} canGoBack disabled={false} /></AppShell></RequireAuth>; }
