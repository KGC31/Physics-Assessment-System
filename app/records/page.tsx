'use client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { UserRecords } from '@/components/UserRecords';
import { RequireAuth } from '@/components/RequireAuth';
export default function RecordsRoute() { const router = useRouter(); return <RequireAuth><AppShell><UserRecords onBack={() => router.push('/')} /></AppShell></RequireAuth>; }
