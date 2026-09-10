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

    if (!authLoading && user && step === 'login') {
      setStep('landing');
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
    <div className="min-h-screen bg-[#f6f8f5] font-sans text-slate-800 selection:bg-emerald-100 flex flex-col items-center">
      <header className="flex w-full items-center justify-between px-4 sm:px-8 py-3 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div 
          onClick={handleReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="Quay lại giao diện đầu"
        >
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold group-hover:bg-emerald-700 transition-colors">Y</div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">Study Constitution</h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-widest leading-none mt-1">Học tập & khảo sát y khoa</p>
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

      <main className="flex-1 flex flex-col overflow-hidden w-full max-w-6xl px-4 sm:px-8 py-6 sm:py-8 relative">
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
              className="flex flex-col justify-center flex-1 py-4 sm:py-8 min-h-[60vh]"
            >
              <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] max-w-5xl w-full mx-auto">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain rounded-xl border border-slate-200 bg-white p-2 shadow-sm" 
                />
                <div className="max-w-2xl"><p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Nền tảng học tập và khảo sát</p><h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl">Luyện tập có hệ thống.<br /><span className="text-emerald-700">Đọc kết quả dễ hiểu.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-slate-600">Khám phá 9 nhóm thể chất qua một bài khảo sát ngắn, trực quan và phù hợp cho học tập, nghiên cứu y khoa cổ truyền.</p></div>
              </div>
              <div className="grid max-w-2xl grid-cols-3 gap-3 text-left"><div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><p className="text-lg font-bold text-slate-950">09</p><p className="mt-1 text-xs leading-4 text-slate-500">nhóm thể chất</p></div><div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><p className="text-lg font-bold text-slate-950">01</p><p className="mt-1 text-xs leading-4 text-slate-500">bài khảo sát</p></div><div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><p className="text-lg font-bold text-slate-950">10′</p><p className="mt-1 text-xs leading-4 text-slate-500">thời gian dự kiến</p></div></div>
              <button
                onClick={handleStart}
                className="self-start rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-95"
              >
                {user ? 'Bắt đầu bài kiểm tra' : 'Đăng nhập để làm bài kiểm tra'}
              </button>

              {/* Auth-related buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {!user ? (
                  <></>
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
