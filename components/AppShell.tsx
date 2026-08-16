'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ClipboardList, LogOut, Settings2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAssessment } from '@/contexts/AssessmentContext';
import { ProgressBar } from '@/components/ProgressBar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  const { reset, currentQuestionIndex, activeQuestions } = useAssessment();
  const goHome = () => { reset(); router.push('/'); };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-background"><div className="size-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" aria-label="Đang tải" /></main>;
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-20 flex w-full items-center justify-between border-b border-border/80 bg-card/95 px-4 py-4 backdrop-blur sm:px-8">
      <button onClick={goHome} className="flex items-center gap-3 text-left" aria-label="Về trang chủ"><span className="flex size-10 items-center justify-center rounded-2xl bg-primary font-bold text-primary-foreground">Y</span><span><strong className="block text-sm sm:text-base">HỆ THỐNG ĐÁNH GIÁ THỂ CHẤT</strong><small className="text-[10px] uppercase tracking-widest text-muted-foreground">Nghiên cứu và thực hành y khoa</small></span></button>
      <div className="flex items-center gap-3">{pathname === '/quiz' && <div className="hidden w-44 sm:block"><ProgressBar current={currentQuestionIndex + 1} total={activeQuestions.length} /></div>}{user && <><span className="hidden max-w-36 truncate text-xs text-muted-foreground sm:block">{profile?.full_name || profile?.email}</span>{pathname === '/' && <button onClick={() => router.push('/records')} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted sm:inline-flex"><ClipboardList className="size-4" /> Lịch sử</button>}{isAdmin && pathname === '/' && <button onClick={() => router.push('/admin')} className="hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50 sm:inline-flex"><Settings2 className="size-4" /> Quản trị</button>}<button onClick={() => void signOut()} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-red-50 hover:text-destructive"><LogOut className="size-4" /> <span className="hidden sm:inline">Đăng xuất</span></button></>}</div>
    </header><main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-8">{pathname === '/quiz' && <div className="mb-6 sm:hidden"><ProgressBar current={currentQuestionIndex + 1} total={activeQuestions.length} /></div>}{children}</main>
  </div>;
}
