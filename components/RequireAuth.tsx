'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
export function RequireAuth({ children }: { children: React.ReactNode }) { const router = useRouter(); const { user, loading } = useAuth(); useEffect(() => { if (!loading && !user) router.replace('/login'); }, [loading, user, router]); if (loading || !user) return null; return <>{children}</>; }
