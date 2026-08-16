'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { LoginPage } from '@/components/LoginPage';
export default function LoginRoute() { const router = useRouter(); return <AppShell><LoginPage onBack={() => router.push('/')} /></AppShell>; }
