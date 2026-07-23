/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { questions } from './data/questions';
import { Gender, ScoreLevel } from './types';
import { useConstitutionCalculation } from './hooks/useConstitutionCalculation';
import { QuizCard } from './components/QuizCard';
import { ProgressBar } from './components/ProgressBar';
import { ResultDashboard } from './components/ResultDashboard';
import { PatientInfoForm } from './components/PatientInfoForm';
import { LoginPage } from './components/LoginPage';
import { UserRecords } from './components/UserRecords';
import { AdminDashboard } from './components/AdminDashboard';
import { useAuth } from './contexts/AuthContext';

const logo = '/logo.jpg';

type AppStep = 'landing' | 'login' | 'records' | 'admin' | 'gender' | 'quiz' | 'result';

export default function App() {
  const { user, profile, isAdmin, signOut, loading: authLoading, authError } = useAuth();
  const [step, setStep] = useState<AppStep>('landing');
  const [gender, setGender] = useState<Gender | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Patient info
  const [patientName, setPatientName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [address, setAddress] = useState('');
  const [selectedGenderTemp, setSelectedGenderTemp] = useState<Gender | null>(null);

  // Lọc ra các câu hỏi hợp lệ dựa trên giới tính
  const activeQuestions = useMemo(() => {
    return questions.filter(q => !q.genderSpecific || q.genderSpecific === gender);
  }, [gender]);

  const results = useConstitutionCalculation(answers, gender);

  useEffect(() => {
    if (!authLoading && authError && !user && step === 'landing') {
      setStep('login');
    }
  }, [authLoading, authError, user, step]);

  const handleStart = () => {
    if (!user) {
      setStep('login');
      return;
    }
    setStep('gender');
  };

  const handleSelectGender = (selectedGender: Gender) => {
    setGender(selectedGender);
    setStep('quiz');
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const handleAnswer = (score: ScoreLevel) => {
    if (isTransitioning) return;

    const currentQ = activeQuestions[currentQuestionIndex];
    if (!currentQ) return; // Prevent crash if out of bounds
    
    setAnswers(prev => ({ ...prev, [currentQ.id]: score }));
    setIsTransitioning(true);

    // Di chuyển màn hình tiếp theo
    setTimeout(() => {
      setCurrentQuestionIndex(prev => {
        if (prev < activeQuestions.length - 1) {
          return prev + 1;
        } else {
          setStep('result');
          return prev;
        }
      });
      setIsTransitioning(false);
    }, 300); // Thêm độ trễ nhỏ để user thấy click state
  };

  const handlePrevious = () => {
    if (isTransitioning) return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setStep('gender');
    }
  };

  const handleReset = () => {
    setStep('landing');
    setGender(null);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setPatientName('');
    setBirthYear('');
    setAddress('');
    setSelectedGenderTemp(null);
    setIsTransitioning(false);
  };

  const handleEditAnswers = () => {
    setCurrentQuestionIndex(0);
    setStep('quiz');
    setIsTransitioning(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-800 selection:bg-emerald-100 flex flex-col items-center">
      <header className="flex w-full items-center justify-between px-4 sm:px-8 py-5 border-b border-slate-100 bg-white shadow-sm sticky top-0 z-10">
        <div 
          onClick={handleReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="Quay lại giao diện đầu"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold group-hover:bg-emerald-700 transition-colors">Y</div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">HỆ THỐNG ĐÁNH GIÁ THỂ CHẤT</h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest leading-none mt-1">Dành cho Nghiên cứu Y khoa</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {step === 'quiz' && (
            <div className="w-[150px] sm:w-[200px] hidden sm:block">
              <ProgressBar current={currentQuestionIndex + 1} total={activeQuestions.length} />
            </div>
          )}
          {step !== 'landing' && (
            <img 
              src={logo} 
              alt="Logo" 
              className="h-10 w-auto object-contain rounded-md shadow-sm border border-slate-100" 
            />
          )}
          {/* Auth controls in header */}
          {user && step === 'landing' && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-slate-500 max-w-[120px] truncate" title={profile?.full_name || profile?.email || ''}>
                {profile?.full_name || profile?.email}
              </span>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden w-full max-w-5xl px-4 sm:px-8 py-12 relative">
        {step === 'quiz' && (
          <div className="mb-8 w-full sm:hidden">
            <ProgressBar current={currentQuestionIndex + 1} total={activeQuestions.length} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {authLoading && (
            <motion.div
              key="auth-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center flex-1 min-h-[60vh]"
            >
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </motion.div>
          )}

          {!authLoading && step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center flex-1 space-y-8 text-center min-h-[60vh]"
            >
              <div className="flex flex-col items-center space-y-6 max-w-2xl">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-3xl shadow-xl border border-slate-100 bg-white p-3 transition-transform duration-300 hover:scale-105 mb-4" 
                />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  <span className="text-emerald-600">Khảo sát Thể chất</span> <br />
                  <span className="text-emerald-600">Y học cổ truyền</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                  Công cụ hỗ trợ học tập và đánh giá 9 loại thể chất phổ biến dựa trên các biểu hiện lâm sàng. Dành riêng cho nghiên cứu và thực hành y khoa.
                </p>
              </div>
              <button
                onClick={handleStart}
                className="px-10 py-4 mt-6 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold hover:from-rose-600 hover:to-rose-700 transition-all uppercase tracking-widest text-sm shadow-lg shadow-rose-200 active:scale-95"
              >
                {user ? 'Bắt đầu bài kiểm tra' : 'Đăng nhập để làm bài kiểm tra'}
              </button>

              {/* Auth-related buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {!user ? (
                  <button
                    onClick={() => setStep('login')}
                    className="px-6 py-3 rounded-xl border-2 border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors text-sm active:scale-95"
                  >
                    Đăng nhập với Google
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setStep('records')}
                      className="px-6 py-3 rounded-xl border-2 border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 transition-colors text-sm active:scale-95"
                    >
                      📋 Lịch sử khảo sát
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setStep('admin')}
                        className="px-6 py-3 rounded-xl border-2 border-violet-200 text-violet-700 font-bold hover:bg-violet-50 transition-colors text-sm active:scale-95"
                      >
                        ⚙️ Quản trị
                      </button>
                    )}
                    {/* Mobile sign-out */}
                    <button
                      onClick={signOut}
                      className="sm:hidden px-6 py-3 rounded-xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-colors text-sm active:scale-95"
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>

              {!user && authError && (
                <div className="max-w-lg mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                  {authError}
                </div>
              )}
            </motion.div>
          )}

          {!authLoading && step === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <LoginPage
                onBack={handleReset}
                message="Chỉ tài khoản đã được admin thêm email mới đăng nhập được. Đăng nhập bằng Google SSO."
              />
            </motion.div>
          )}

          {!authLoading && step === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <UserRecords onBack={handleReset} />
            </motion.div>
          )}

          {!authLoading && step === 'admin' && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <AdminDashboard onBack={handleReset} />
            </motion.div>
          )}

          {!authLoading && step === 'gender' && user && (
            <motion.div
              key="gender"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <PatientInfoForm
                patientName={patientName}
                setPatientName={setPatientName}
                birthYear={birthYear}
                setBirthYear={setBirthYear}
                address={address}
                setAddress={setAddress}
                gender={selectedGenderTemp}
                onSelectGender={setSelectedGenderTemp}
                onSubmit={() => {
                  if (selectedGenderTemp) {
                    handleSelectGender(selectedGenderTemp);
                  }
                }}
                onBack={handleReset}
              />
            </motion.div>
          )}

          {!authLoading && step === 'quiz' && user && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full"
            >
              <QuizCard
                question={activeQuestions[currentQuestionIndex]}
                selectedAnswer={answers[activeQuestions[currentQuestionIndex].id] as ScoreLevel}
                onAnswer={handleAnswer}
                onPrevious={handlePrevious}
                canGoBack={true}
                disabled={isTransitioning}
              />
            </motion.div>
          )}

          {!authLoading && step === 'result' && user && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full"
            >
              <ResultDashboard 
                results={results} 
                onReset={handleReset} 
                onEditAnswers={handleEditAnswers} 
                answers={answers}
                activeQuestions={activeQuestions}
                patientName={patientName}
                birthYear={birthYear}
                address={address}
                gender={gender || undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
