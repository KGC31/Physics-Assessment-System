'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  signIn,
  signOut as amplifySignOut,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
} from "aws-amplify/auth";

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

  authError: string | null;
  clearAuthError: () => void;

  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;

  signOut: () => Promise<void>;

  forgotPassword: (
    email: string
  ) => Promise<{ error: string | null }>;

  confirmForgotPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<{ error: string | null }>;

  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const UNAUTHORIZED_MSG =
  'Email của bạn chưa được cấp quyền truy cập. Vui lòng liên hệ quản trị viên để được thêm vào hệ thống.';

function normalizeEmail(email: string) {
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
  const groups = session.tokens?.accessToken?.payload['cognito:groups'];

  return Array.isArray(groups) ? groups.map(String) : [];
}

async function findProfileByEmail(
  email: string
): Promise<Profile | null> {
  const normalized = normalizeEmail(email);

  const { data, errors } =
    await dataClient.models.Profile.list({
      filter: {
        email: {
          eq: normalized,
        },
      },
      limit: 1,
    });

  if (errors?.length) {
    return null;
  }

  if (!data?.length) {
    return null;
  }

  return mapProfile(data[0]);
}

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
  if (!fullName || profile.full_name === fullName) {
    return profile;
  }

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

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const denyAndSignOut = useCallback(async (message: string) => {
    setAuthError(message);

    setUser(null);
    setProfile(null);
    setIsAdmin(false);

    try {
      await amplifySignOut({ global: true });
    } catch { }
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();

      const session = await fetchAuthSession();

      const attributes = await fetchUserAttributes();

      const groups = getGroupsFromSession(session);

      const cognitoAdmin = groups.includes('ADMIN');

      const email = attributes.email ?? '';

      if (!email) {
        await denyAndSignOut(UNAUTHORIZED_MSG);
        return;
      }

      const fullName =
        attributes.name ??
        null;

      let profile = await findProfileByEmail(email);

      if (!profile) {
        if (cognitoAdmin) {
          profile = await createBootstrapAdminProfile(
            email,
            fullName
          );
        }

        if (!profile) {
          await denyAndSignOut(UNAUTHORIZED_MSG);
          return;
        }
      }

      profile = await touchProfileName(profile, fullName);

      setUser({
        userId: currentUser.userId,
        username: currentUser.username,
        email: normalizeEmail(email),
        fullName,
      });

      setProfile(profile);

      setIsAdmin(
        cognitoAdmin || profile.role === 'admin'
      );

      setAuthError(null);
    } catch {
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [denyAndSignOut]);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    await loadSession();
  }, [loadSession]);

  useEffect(() => {

    loadSession();

    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          setLoading(true);
          loadSession();
          break;

        case "signedOut":
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setLoading(false);
          break;
      }
    });

    return unsubscribe;

  }, [loadSession]);

  const signInUser = async (
    email: string,
    password: string
  ) => {
    try {
      setAuthError(null);

      const result = await signIn({
        username: normalizeEmail(email),
        password,
      });

      if (!result.isSignedIn) {
        return {
          error: "Đăng nhập thất bại.",
        };
      }

      await loadSession();

      return {
        error: null,
      };
    } catch (err) {
      return {
        error:
          err instanceof Error
            ? err.message
            : "Đăng nhập thất bại.",
      };
    }
  };

  const forgotPassword = async (
    email: string
  ) => {
    try {

      await resetPassword({
        username: normalizeEmail(email),
      });

      return {
        error: null,
      };

    } catch (err) {

      return {
        error:
          err instanceof Error
            ? err.message
            : "Không gửi được mã xác nhận.",
      };
    }
  };

  const confirmForgotPassword = async (
    email: string,
    code: string,
    newPassword: string
  ) => {

    try {

      await confirmResetPassword({

        username: normalizeEmail(email),

        confirmationCode: code,

        newPassword,
      });

      return {
        error: null,
      };

    } catch (err) {

      return {
        error:
          err instanceof Error
            ? err.message
            : "Đổi mật khẩu thất bại.",
      };
    }
  };

  const signOut = async () => {
    await amplifySignOut({
      global: true,
    });

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

        signIn: signInUser,

        signOut,

        forgotPassword,

        confirmForgotPassword,

        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}