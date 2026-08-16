'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { AdminDashboard } from '@/components/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
export default function AdminRoute() { const router = useRouter(); const { isAdmin, loading } = useAuth(); if (loading) return null; if (!isAdmin) { router.replace('/'); return null; } return <AppShell><AdminDashboard onBack={() => router.push('/')} /></AppShell>; }
