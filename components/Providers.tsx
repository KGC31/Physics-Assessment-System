'use client';

import { Amplify } from 'aws-amplify';
import { amplifyOutputs } from '@/lib/amplifyConfig';
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

Amplify.configure(amplifyOutputs, { ssr: true });

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="p-8 m-8 bg-rose-50 border-2 border-rose-200 rounded-2xl">
      <h2 className="text-xl font-bold text-rose-800 mb-4">Đã xảy ra lỗi (Crash)</h2>
      <pre className="text-sm text-rose-600 bg-white p-4 rounded-lg overflow-auto mb-4 border border-rose-100">
        {message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold"
      >
        Thử lại
      </button>
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>{children}</AuthProvider>
    </ErrorBoundary>
  );
}
