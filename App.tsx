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
  const { user, profile, isAdmin, isPreviewAdmin, signOut, exitPreviewAdmin, loading: authLoading, authError } = useAuth();
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
    <div className="min-h-screen bg-[#f8f7f4] font-sans text-slate-950 selection:bg-orange-100 flex flex-col overflow-hidden">
      <header className="relative z-10 flex w-full items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <button onClick={handleReset} className="flex items-center gap-3" title="Về trang đầu">
          <span className="flex items-center gap-1" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-slate-950" /><span className="h-2 w-2 rounded-full bg-slate-950" /></span>
          <span className="sr-only">Study Constitution</span>
        </button>
        <div className="flex items-center gap-5 text-[11px] font-medium uppercase tracking-wide text-slate-700 sm:gap-8">
          <span className="hidden sm:inline">VN / EN</span>
          <span className="hidden sm:inline">Study lab</span>
          <button onClick={handleReset} className="flex items-center gap-3" aria-label="Mở menu"><span>Menu</span><span className="flex w-6 flex-col gap-1.5"><span className="h-px w-full bg-slate-950" /><span className="h-px w-full bg-slate-950" /></span></button>
        </div>
      </header>
      {isPreviewAdmin && <div className="relative z-10 mx-6 flex items-center justify-between rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs text-orange-900 sm:mx-10 lg:mx-16"><span><strong>Preview admin mode</strong> · Chỉ dùng trong môi trường phát triển.</span><button onClick={exitPreviewAdmin} className="font-semibold underline underline-offset-2">Thoát</button></div>}

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
              className="relative flex flex-1 flex-col justify-between py-12 sm:py-16 lg:py-20"
            >
              <div className="pointer-events-none absolute -right-32 top-0 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,_rgba(249,170,103,0.48)_0%,_rgba(249,211,155,0.24)_35%,_rgba(248,247,244,0)_70%)] blur-2xl" />
              <div className="relative z-[1] flex max-w-3xl flex-col gap-8 px-6 sm:px-10 lg:px-16">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Study Constitution / 01</p>
                <h1 className="max-w-4xl text-[3.5rem] font-light uppercase leading-[0.94] tracking-[-0.07em] text-slate-950 sm:text-7xl lg:text-[7.4rem]">We make<br />study results<br /><span className="text-slate-500">easy to read.</span></h1>
                <p className="max-w-md text-sm leading-6 text-slate-600 sm:text-base">Một bài khảo sát rõ ràng để bạn luyện tập, quan sát và hiểu các nhóm thể chất trong Y học cổ truyền.</p>
                <div className="flex flex-wrap items-center gap-4">
                  <button onClick={handleStart} className="rounded-full border border-slate-950 bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-950 transition hover:bg-slate-950 hover:text-white">{user ? 'Start assessment' : 'Enter study space'}</button>
                  <span className="text-xs text-slate-500">01 / 10 min / guided</span>
                </div>
                <div className="flex flex-wrap gap-6 pt-5 text-[11px] uppercase tracking-wide text-slate-500"><span>09 constitution groups</span><span>Student-friendly</span><span>Reference-based</span></div>
                {user && <div className="flex flex-wrap gap-3 pt-2"><button onClick={() => setStep('records')} className="text-xs font-semibold uppercase tracking-wide text-slate-700 underline underline-offset-4">View history</button>{isAdmin && <button onClick={() => setStep('admin')} className="text-xs font-semibold uppercase tracking-wide text-slate-700 underline underline-offset-4">Open admin</button>}<button onClick={signOut} className="text-xs font-semibold uppercase tracking-wide text-slate-500 underline underline-offset-4">Sign out</button></div>}
                {!user && authError && <div className="max-w-lg rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{authError}</div>}
              </div>
              <div className="relative z-[1] mt-16 flex items-end justify-between px-6 text-xs text-slate-500 sm:px-10 lg:px-16"><p className="max-w-sm leading-5">We build calm digital tools for learning, assessment, and better understanding.</p><button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="hidden items-center gap-3 uppercase tracking-wide sm:flex">Who we are <span className="h-px w-12 bg-slate-950" /></button></div>
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
