'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ResultDashboard } from '@/components/ResultDashboard';
import { useAssessment } from '@/contexts/AssessmentContext';
import { RequireAuth } from '@/components/RequireAuth';
export default function ResultsRoute() { const router = useRouter(); const a = useAssessment(); return <RequireAuth><AppShell><ResultDashboard results={a.results} onReset={() => { a.reset(); router.push('/'); }} onEditAnswers={() => { a.editAnswers(); router.push('/quiz'); }} answers={a.answers} activeQuestions={a.activeQuestions} patientName={a.patientName} birthYear={a.birthYear} address={a.address} gender={a.gender || undefined} /></AppShell></RequireAuth>; }
