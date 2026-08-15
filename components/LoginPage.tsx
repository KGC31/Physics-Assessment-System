'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps { onBack: () => void; }
type Mode = 'login' | 'forgot' | 'reset';

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const { signIn, forgotPassword, confirmForgotPassword } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearFeedback = () => { setError(null); setSuccess(null); };
  const handleLogin = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(null); const result = await signIn(email, password); if (result.error) setError(result.error); setLoading(false); };
  const handleForgotPassword = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(null); const result = await forgotPassword(email); if (result.error) setError(result.error); else { setSuccess('Đã gửi mã xác nhận tới email của bạn.'); setMode('reset'); } setLoading(false); };
  const handleResetPassword = async (e: React.FormEvent) => { e.preventDefault(); setLoading(true); setError(null); const result = await confirmForgotPassword(email, code, newPassword); if (result.error) setError(result.error); else { setSuccess('Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay.'); setMode('login'); setPassword(''); setCode(''); setNewPassword(''); } setLoading(false); };

  const heading = mode === 'login' ? 'Chào mừng bạn quay lại' : mode === 'forgot' ? 'Khôi phục mật khẩu' : 'Đặt mật khẩu mới';
  const description = mode === 'login' ? 'Đăng nhập để tiếp tục bài khảo sát và xem lại lịch sử của bạn.' : mode === 'forgot' ? 'Nhập email đã đăng ký, chúng tôi sẽ gửi mã xác nhận.' : 'Nhập mã trong email và tạo một mật khẩu mới an toàn.';
  const fieldClass = 'w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:bg-card focus:outline-none';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[70vh] items-center justify-center py-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border bg-card shadow-xl shadow-primary/5 md:grid-cols-[0.85fr_1.15fr]">
        <div className="hidden flex-col justify-between bg-primary p-8 text-primary-foreground md:flex">
          <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-5" /> Không gian học tập an toàn</div>
          <div className="flex flex-col gap-4"><Sparkles className="size-8 opacity-80" /><p className="text-2xl font-semibold leading-tight">Theo dõi tiến trình đánh giá thể chất một cách rõ ràng và riêng tư.</p><p className="text-sm leading-6 text-primary-foreground/75">Dữ liệu khảo sát chỉ được dùng để hỗ trợ học tập, nghiên cứu và xem lại kết quả của bạn.</p></div>
          <p className="text-xs text-primary-foreground/60">Y học cổ truyền · Nghiên cứu và thực hành</p>
        </div>
        <div className="p-6 sm:p-10">
          <div className="mb-8 flex flex-col gap-3"><div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole className="size-5" /></div><div><h2 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></div></div>
          {error && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700"><TriangleAlert className="mt-0.5 size-4 shrink-0" />{error}</div>}
          {success && <div role="status" className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{success}</div>}
          {mode === 'login' && <form onSubmit={handleLogin} className="flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-semibold text-foreground">Email<div className="relative"><Mail className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" /><input aria-label="Email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={`${fieldClass} pl-10`} placeholder="ten@example.com" /></div></label><label className="flex flex-col gap-2 text-sm font-semibold text-foreground">Mật khẩu<input aria-label="Mật khẩu" type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={fieldClass} placeholder="Nhập mật khẩu" /></label><button disabled={loading} className="mt-1 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button><button type="button" onClick={() => { setMode('forgot'); clearFeedback(); }} className="text-sm font-semibold text-primary hover:underline">Quên mật khẩu?</button></form>}
          {mode === 'forgot' && <form onSubmit={handleForgotPassword} className="flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-semibold">Email<input aria-label="Email" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} placeholder="ten@example.com" /></label><button disabled={loading} className="w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">{loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}</button><button type="button" onClick={() => { setMode('login'); clearFeedback(); }} className="text-sm font-semibold text-muted-foreground hover:text-foreground">Quay lại đăng nhập</button></form>}
          {mode === 'reset' && <form onSubmit={handleResetPassword} className="flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-semibold">Mã xác nhận<input aria-label="Mã xác nhận" type="text" required value={code} onChange={e => setCode(e.target.value)} className={fieldClass} placeholder="Nhập mã trong email" /></label><label className="flex flex-col gap-2 text-sm font-semibold">Mật khẩu mới<input aria-label="Mật khẩu mới" type="password" required autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={fieldClass} placeholder="Tối thiểu 8 ký tự" /></label><button disabled={loading} className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary py-3.5 font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"><KeyRound className="size-4" />{loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</button></form>}
          <button onClick={onBack} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Quay lại trang chủ</button>
        </div>
      </div>
    </motion.div>
  );
};
