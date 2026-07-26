'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface LoginPageProps {
  onBack: () => void;
}

type Mode = 'login' | 'forgot' | 'reset';

export const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const {
    signIn,
    forgotPassword,
    confirmForgotPassword,
  } = useAuth();

  const [mode, setMode] = useState<Mode>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    setError(null);

    const result = await forgotPassword(email);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(
        'Đã gửi mã xác nhận tới email.'
      );
      setMode('reset');
    }

    setLoading(false);
  };

  const handleResetPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    setError(null);

    const result =
      await confirmForgotPassword(
        email,
        code,
        newPassword
      );

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(
        'Đổi mật khẩu thành công.'
      );

      setMode('login');

      setPassword('');
      setCode('');
      setNewPassword('');
    }

    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh]"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

        <div className="bg-gradient-to-br from-violet-600 to-violet-800 p-8 text-center">

          <h2 className="text-2xl font-bold text-white">

            {mode === 'login' && 'Đăng nhập'}

            {mode === 'forgot' && 'Quên mật khẩu'}

            {mode === 'reset' && 'Đặt mật khẩu mới'}

          </h2>

        </div>

        <div className="p-8">

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          {mode === 'login' && (
            <form
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-xl border p-3"
              />

              <input
                type="password"
                placeholder="Mật khẩu"
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full rounded-xl border p-3"
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 py-3 text-white font-bold"
              >
                {loading
                  ? 'Đang đăng nhập...'
                  : 'Đăng nhập'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('forgot');
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full text-sm text-violet-600"
              >
                Quên mật khẩu?
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form
              onSubmit={handleForgotPassword}
              className="space-y-4"
            >
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-xl border p-3"
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 py-3 text-white font-bold"
              >
                {loading
                  ? 'Đang gửi...'
                  : 'Gửi mã xác nhận'}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-sm text-slate-500"
              >
                Quay lại đăng nhập
              </button>
            </form>
          )}

          {mode === 'reset' && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              <input
                type="text"
                placeholder="Mã xác nhận"
                required
                value={code}
                onChange={(e) =>
                  setCode(e.target.value)
                }
                className="w-full rounded-xl border p-3"
              />

              <input
                type="password"
                placeholder="Mật khẩu mới"
                required
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                className="w-full rounded-xl border p-3"
              />

              <button
                disabled={loading}
                className="w-full rounded-xl bg-violet-600 py-3 text-white font-bold"
              >
                {loading
                  ? 'Đang cập nhật...'
                  : 'Đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>

      <button
        onClick={onBack}
        className="mt-6 text-sm text-slate-500"
      >
        Quay lại trang chủ
      </button>
    </motion.div>
  );
};