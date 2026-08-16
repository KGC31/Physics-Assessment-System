'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { questions } from '@/data/questions';
import { Gender, ScoreLevel } from '@/types';
import { useConstitutionCalculation } from '@/hooks/useConstitutionCalculation';

interface AssessmentContextValue {
  gender: Gender | null;
  selectedGender: Gender | null;
  setSelectedGender: (gender: Gender | null) => void;
  patientName: string;
  setPatientName: (value: string) => void;
  birthYear: string;
  setBirthYear: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  answers: Record<string, number>;
  currentQuestionIndex: number;
  activeQuestions: typeof questions;
  results: ReturnType<typeof useConstitutionCalculation>;
  answerQuestion: (score: ScoreLevel) => boolean;
  previousQuestion: () => void;
  reset: () => void;
  start: () => void;
  editAnswers: () => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [gender, setGender] = useState<Gender | null>(null);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [patientName, setPatientName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [address, setAddress] = useState('');
  const activeQuestions = useMemo(() => questions.filter((q) => !q.genderSpecific || q.genderSpecific === gender), [gender]);
  const results = useConstitutionCalculation(answers, gender);

  const answerQuestion = (score: ScoreLevel) => {
    const question = activeQuestions[currentQuestionIndex];
    if (!question) return false;
    setAnswers((prev) => ({ ...prev, [question.id]: score }));
    const hasNext = currentQuestionIndex < activeQuestions.length - 1;
    if (hasNext) setCurrentQuestionIndex((index) => index + 1);
    return hasNext;
  };
  const previousQuestion = () => setCurrentQuestionIndex((index) => Math.max(0, index - 1));
  const start = () => { setGender(selectedGender); setAnswers({}); setCurrentQuestionIndex(0); };
  const reset = () => { setGender(null); setSelectedGender(null); setAnswers({}); setCurrentQuestionIndex(0); setPatientName(''); setBirthYear(''); setAddress(''); };
  const editAnswers = () => setCurrentQuestionIndex(0);

  return <AssessmentContext.Provider value={{ gender, selectedGender, setSelectedGender, patientName, setPatientName, birthYear, setBirthYear, address, setAddress, answers, currentQuestionIndex, activeQuestions, results, answerQuestion, previousQuestion, reset, start, editAnswers }}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error('useAssessment must be used within AssessmentProvider');
  return context;
}
