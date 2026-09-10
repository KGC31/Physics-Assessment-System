'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onBack: () => void;
}

type Mode = 'login' | 'forgot' | 'reset';

const fieldClassName = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100';

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

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await forgotPassword(email);
    if (result.error) setError(result.error);
    else {
      setSuccess('Đã gửi mã xác nhận tới email của bạn.');
      setMode('reset');
    }
    setLoading(false);
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await confirmForgotPassword(email, code, newPassword);
    if (result.error) setError(result.error);
    else {
      setSuccess('Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay.');
      setMode('login');
      setPassword('');
      setCode('');
      setNewPassword('');
    }
    setLoading(false);
  };

  const title = mode === 'login' ? 'Chào mừng trở lại' : mode === 'forgot' ? 'Khôi phục tài khoản' : 'Tạo mật khẩu mới';
  const description = mode === 'login' ? 'Đăng nhập để tiếp tục bài khảo sát và theo dõi kết quả học tập.' : mode === 'forgot' ? 'Nhập email để nhận mã xác nhận bảo mật.' : 'Nhập mã đã gửi tới email và chọn mật khẩu mới.';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-1 items-center justify-center py-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden flex-col justify-between bg-emerald-900 p-8 text-white md:flex">
          <div>
            <div className="mb-8 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 font-bold text-emerald-950">Y</div><span className="text-sm font-bold tracking-tight">Study Constitution</span></div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Học tập có định hướng</p>
            <h2 className="max-w-xs text-3xl font-bold leading-tight">Hiểu bài làm. Hiểu chính mình.</h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-emerald-100">Một không gian gọn gàng để luyện tập, hoàn thành khảo sát và đọc kết quả rõ ràng hơn.</p>
          </div>
          <div className="border-t border-emerald-700 pt-5 text-xs leading-5 text-emerald-200">Dữ liệu được sử dụng cho mục đích học tập, nghiên cứu và tham khảo sức khỏe.</div>
        </div>

        <div className="p-6 sm:p-8">
          <button onClick={onBack} className="mb-8 text-sm font-medium text-slate-500 transition hover:text-emerald-700">← Về trang giới thiệu</button>
          <div className="mb-6"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Khu vực học viên</p><h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div>

          {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {success && <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>}

          {mode === 'login' && <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Email<input type="email" placeholder="ban@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} className={`${fieldClassName} mt-2`} /></label>
            <label className="block text-sm font-semibold text-slate-700">Mật khẩu<input type="password" placeholder="Nhập mật khẩu" required value={password} onChange={(event) => setPassword(event.target.value)} className={`${fieldClassName} mt-2`} /></label>
            <button disabled={loading} className="w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60">{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
            <button type="button" onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }} className="w-full text-sm font-medium text-emerald-700 hover:text-emerald-900">Quên mật khẩu?</button>
          </form>}

          {mode === 'forgot' && <form onSubmit={handleForgotPassword} className="space-y-4"><label className="block text-sm font-semibold text-slate-700">Email<input type="email" placeholder="ban@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} className={`${fieldClassName} mt-2`} /></label><button disabled={loading} className="w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">{loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}</button><button type="button" onClick={() => setMode('login')} className="w-full text-sm font-medium text-slate-500 hover:text-emerald-700">Quay lại đăng nhập</button></form>}

          {mode === 'reset' && <form onSubmit={handleResetPassword} className="space-y-4"><label className="block text-sm font-semibold text-slate-700">Mã xác nhận<input type="text" placeholder="Nhập mã trong email" required value={code} onChange={(event) => setCode(event.target.value)} className={`${fieldClassName} mt-2`} /></label><label className="block text-sm font-semibold text-slate-700">Mật khẩu mới<input type="password" placeholder="Tối thiểu 8 ký tự" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={`${fieldClassName} mt-2`} /></label><button disabled={loading} className="w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60">{loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}</button></form>}
        </div>
      </div>
    </motion.div>
  );
};
