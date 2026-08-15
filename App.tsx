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
import { ArrowRight, ClipboardList, LogOut, Settings2, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col items-center">
      <header className="flex w-full items-center justify-between px-4 sm:px-8 py-4 border-b border-border/80 bg-card/95 backdrop-blur sticky top-0 z-10">
        <div 
          onClick={handleReset}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="Quay lại giao diện đầu"
        >
          <div className="size-10 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold group-hover:scale-105 transition-transform">Y</div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">HỆ THỐNG ĐÁNH GIÁ THỂ CHẤT</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-widest leading-none mt-1">Nghiên cứu và thực hành y khoa</p>
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
              <span className="text-xs text-muted-foreground max-w-[140px] truncate" title={profile?.full_name || profile?.email || ''}>
                {profile?.full_name || profile?.email}
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
              >
                <LogOut className="size-3.5" aria-hidden="true" /> Đăng xuất
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
              className="flex flex-col items-center justify-center flex-1 gap-8 text-center min-h-[60vh] py-8"
            >
              <div className="flex flex-col items-center gap-6 max-w-2xl">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="size-28 sm:size-36 object-contain rounded-[2rem] shadow-lg border border-border bg-card p-3 transition-transform duration-300 hover:scale-105 mb-2" 
                />
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="size-3.5" aria-hidden="true" /> Khảo sát có hướng dẫn
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-balance">
                  Hiểu cơ thể, <span className="text-primary">chăm sóc đúng cách</span>
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Công cụ hỗ trợ học tập và đánh giá 9 loại thể chất phổ biến dựa trên các biểu hiện lâm sàng. Trả lời từng câu hỏi theo cảm nhận của bạn trong 1 năm gần đây.
                </p>
              </div>
              <button
                onClick={handleStart}
                className="inline-flex items-center gap-3 px-7 py-4 mt-2 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20 active:scale-[0.98]"
              >
                {user ? 'Bắt đầu bài kiểm tra' : 'Đăng nhập để bắt đầu'}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>

              {/* Auth-related buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {!user ? (
                  <></>
                ) : (
                  <>
                    <button
                      onClick={() => setStep('records')}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-primary/25 text-primary font-bold hover:bg-primary/10 transition-colors text-sm active:scale-95"
                    >
                      <ClipboardList className="size-4" aria-hidden="true" /> Lịch sử khảo sát
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setStep('admin')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-violet-200 text-violet-700 font-bold hover:bg-violet-50 transition-colors text-sm active:scale-95"
                      >
                        <Settings2 className="size-4" aria-hidden="true" /> Quản trị
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
