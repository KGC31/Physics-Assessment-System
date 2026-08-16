'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, ClipboardList, Settings2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/AppShell';

export default function HomePage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  return <AppShell><section className="flex min-h-[72vh] flex-col items-center justify-center gap-8 py-8 text-center"><div className="flex max-w-2xl flex-col items-center gap-6"><img src="/logo.jpg" alt="Logo hệ thống" className="size-28 rounded-[2rem] border border-border bg-card object-contain p-3 shadow-lg sm:size-36" /><div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"><Sparkles className="size-4" /> Khảo sát có hướng dẫn</div><h1 className="text-balance text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">Hiểu cơ thể, <span className="text-primary">chăm sóc đúng cách</span></h1><p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">Công cụ hỗ trợ học tập và đánh giá 9 loại thể chất phổ biến dựa trên các biểu hiện lâm sàng.</p></div><button onClick={() => router.push(user ? '/intake' : '/login')} className="inline-flex items-center gap-3 rounded-2xl bg-primary px-7 py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">{user ? 'Bắt đầu bài kiểm tra' : 'Đăng nhập để bắt đầu'} <ArrowRight className="size-4" /></button>{user && <div className="flex flex-wrap justify-center gap-3"><button onClick={() => router.push('/records')} className="inline-flex items-center gap-2 rounded-xl border border-primary/25 px-5 py-3 text-sm font-bold text-primary hover:bg-primary/10"><ClipboardList className="size-4" /> Lịch sử khảo sát</button>{isAdmin && <button onClick={() => router.push('/admin')} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-5 py-3 text-sm font-bold text-violet-700 hover:bg-violet-50"><Settings2 className="size-4" /> Quản trị</button>}</div>}</section></AppShell>;
}
