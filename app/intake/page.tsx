'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PatientInfoForm } from '@/components/PatientInfoForm';
import { useAssessment } from '@/contexts/AssessmentContext';
import { RequireAuth } from '@/components/RequireAuth';
export default function IntakeRoute() { const router = useRouter(); const a = useAssessment(); return <RequireAuth><AppShell><PatientInfoForm patientName={a.patientName} setPatientName={a.setPatientName} birthYear={a.birthYear} setBirthYear={a.setBirthYear} address={a.address} setAddress={a.setAddress} gender={a.selectedGender} onSelectGender={a.setSelectedGender} onSubmit={() => { if (a.selectedGender) { a.start(); router.push('/quiz'); } }} onBack={() => router.push('/')} /></AppShell></RequireAuth>; }
