'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onBack: () => void;
  message?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBack,
  message = 'Đăng nhập bằng Google để làm bài kiểm tra và lưu kết quả khảo sát',
}) => {
  const { signInWithGoogle, authError, clearAuthError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setSubmitting(false);
    }
  }, [authError]);

  const handleGoogleSignIn = async () => {
    clearAuthError();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err);
      setSubmitting(false);
    }
    // On success Cognito redirects away; whitelist is checked after redirect.
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-center flex-1 min-h-[60vh] w-full"
    >
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Đăng nhập</h2>
            <p className="text-emerald-100 text-sm mt-2">{message}</p>
          </div>

          <div className="px-8 py-8 space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {submitting ? 'Đang chuyển hướng...' : 'Đăng nhập với Google'}
            </button>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              Chỉ email đã được quản trị viên thêm vào hệ thống mới được phép đăng nhập. Google SSO
              — không dùng email/mật khẩu.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            clearAuthError();
            onBack();
          }}
          className="mt-6 w-full py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 transition-colors uppercase tracking-wider text-xs active:scale-95"
        >
          Quay lại trang chủ
        </button>
      </div>
    </motion.div>
  );
};
