import { defineFunction } from '@aws-amplify/backend';

/**
 * Admin-only: create Cognito email/password users (no self sign-up).
 * COGNITO_USER_POOL_ID is set from amplify/backend.ts via addEnvironment().
 */
export const createUserFunction = defineFunction({
  name: 'create-user',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    COGNITO_USER_POOL_ID: '',
  },
});
