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
  /** Set when Google SSO succeeds but email is not on the invite list. */
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const UNAUTHORIZED_MSG =
  'Email của bạn chưa được cấp quyền truy cập. Vui lòng liên hệ quản trị viên để được thêm vào hệ thống.';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapProfile(data: {
  id: string;
  email: string;
  role?: string | null;
  fullName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}): Profile {
  return {
    id: data.id,
    email: data.email,
    role: (data.role as 'admin' | 'user') ?? 'user',
    full_name: data.fullName ?? null,
    created_at: data.createdAt ?? new Date().toISOString(),
    updated_at: data.updatedAt ?? new Date().toISOString(),
  };
}

function getGroupsFromSession(
  session: Awaited<ReturnType<typeof fetchAuthSession>>
): string[] {
  const claim = session.tokens?.accessToken?.payload['cognito:groups'];
  if (Array.isArray(claim)) return claim.map(String);
  return [];
}

async function findProfileByEmail(email: string): Promise<Profile | null> {
  const normalized = normalizeEmail(email);
  const { data, errors } = await dataClient.models.Profile.list({
    filter: { email: { eq: normalized } },
    limit: 50,
  });

  if (errors?.length) {
    // Fallback: some records may have been stored with original casing.
    const all = await dataClient.models.Profile.list({ limit: 500 });
    const match = all.data?.find(
      (p) => normalizeEmail(p.email) === normalized
    );
    return match ? mapProfile(match) : null;
  }

  const exact =
    data?.find((p) => normalizeEmail(p.email) === normalized) ?? data?.[0];
  return exact ? mapProfile(exact) : null;
}

/** Bootstrap only: Cognito ADMIN with no Profile row yet. */
async function createBootstrapAdminProfile(
  email: string,
  fullName: string | null
): Promise<Profile | null> {
  const { data } = await dataClient.models.Profile.create({
    email: normalizeEmail(email),
    fullName: fullName ?? undefined,
    role: 'admin',
  });
  return data ? mapProfile(data) : null;
}

async function touchProfileName(
  profile: Profile,
  fullName: string | null
): Promise<Profile> {
  if (!fullName || fullName === profile.full_name) return profile;
  try {
    const { data } = await dataClient.models.Profile.update({
      id: profile.id,
      fullName,
    });
    return data ? mapProfile(data) : profile;
  } catch {
    return profile;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const denyAndSignOut = useCallback(async (message: string) => {
    setAuthError(message);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
    try {
      await amplifySignOut({ global: true });
    } catch {
      // Ignore sign-out errors when session is already invalid.
    }
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const current = await getCurrentUser();
      const session = await fetchAuthSession();
      const attrs = await fetchUserAttributes();
      const groups = getGroupsFromSession(session);
      const cognitoAdmin = groups.includes('ADMIN');

      const email = attrs.email ?? '';
      if (!email) {
        await denyAndSignOut(UNAUTHORIZED_MSG);
        return;
      }

      const fullName =
        [attrs.given_name, attrs.family_name].filter(Boolean).join(' ') ||
        attrs.name ||
        null;

      let p = await findProfileByEmail(email);

      if (!p) {
        // First Cognito ADMIN can bootstrap their own whitelist row.
        if (cognitoAdmin) {
          p = await createBootstrapAdminProfile(email, fullName);
        }
        if (!p) {
          await denyAndSignOut(UNAUTHORIZED_MSG);
          return;
        }
      }

      p = await touchProfileName(p, fullName);

      const authUser: AuthUser = {
        userId: current.userId,
        username: current.username,
        email: normalizeEmail(email),
        fullName,
      };

      setAuthError(null);
      setUser(authUser);
      setProfile(p);
      setIsAdmin(p.role === 'admin' || cognitoAdmin);
    } catch {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [denyAndSignOut]);

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
      setAuthError(null);
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
        authError,
        clearAuthError,
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
