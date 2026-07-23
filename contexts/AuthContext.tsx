'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
  signInWithRedirect,
  signOut as amplifySignOut,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { dataClient } from '@/lib/amplifyClient';

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  fullName: string | null;
}

export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'user';
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getGroupsFromSession(
  session: Awaited<ReturnType<typeof fetchAuthSession>>
): string[] {
  const claim = session.tokens?.accessToken?.payload['cognito:groups'];
  if (Array.isArray(claim)) return claim.map(String);
  return [];
}

async function upsertProfile(
  userId: string,
  email: string,
  fullName: string | null,
  isAdmin: boolean
): Promise<Profile | null> {
  const role = isAdmin ? 'admin' : 'user';
  const existing = await dataClient.models.Profile.list({
    filter: { email: { eq: email } },
  });

  const mine = existing.data?.find((p) => p.id === userId) ?? existing.data?.[0];

  if (mine) {
    const { data } = await dataClient.models.Profile.update({
      id: mine.id,
      email,
      fullName: fullName ?? mine.fullName ?? undefined,
      role,
    });
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      role: (data.role as 'admin' | 'user') ?? role,
      full_name: data.fullName ?? null,
      created_at: data.createdAt ?? new Date().toISOString(),
      updated_at: data.updatedAt ?? new Date().toISOString(),
    };
  }

  const { data } = await dataClient.models.Profile.create({
    email,
    fullName: fullName ?? undefined,
    role,
  });

  if (!data) return null;
  return {
    id: data.id,
    email: data.email,
    role: (data.role as 'admin' | 'user') ?? role,
    full_name: data.fullName ?? null,
    created_at: data.createdAt ?? new Date().toISOString(),
    updated_at: data.updatedAt ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      const session = await fetchAuthSession();
      const attrs = await fetchUserAttributes();
      const groups = getGroupsFromSession(session);
      const admin = groups.includes('ADMIN');

      const email = attrs.email ?? '';
      const fullName =
        [attrs.given_name, attrs.family_name].filter(Boolean).join(' ') ||
        attrs.name ||
        null;

      const authUser: AuthUser = {
        userId: current.userId,
        username: current.username,
        email,
        fullName,
      };

      setUser(authUser);
      setIsAdmin(admin);

      try {
        const p = await upsertProfile(current.userId, email, fullName, admin);
        setProfile(p);
      } catch (err) {
        console.error('Profile sync failed:', err);
        setProfile({
          id: current.userId,
          email,
          role: admin ? 'admin' : 'user',
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  useEffect(() => {
    loadSession();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
        case 'signInWithRedirect':
          setLoading(true);
          loadSession();
          break;
        case 'signedOut':
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
          break;
        default:
          break;
      }
    });

    return () => unsubscribe();
  }, [loadSession]);

  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect({ provider: 'Google' });
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đăng nhập Google thất bại';
      return { error: message };
    }
  };

  const signOut = async () => {
    await amplifySignOut({ global: true });
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
