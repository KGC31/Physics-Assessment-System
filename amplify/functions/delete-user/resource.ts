import { defineFunction } from '@aws-amplify/backend';

/**
 * Admin-only: delete Cognito email/password users.
 * COGNITO_USER_POOL_ID is set from amplify/backend.ts via addEnvironment().
 */
export const deleteUserFunction = defineFunction({
  name: 'delete-user',
  entry: './handler.ts',
  timeoutSeconds: 30,
  environment: {
    COGNITO_USER_POOL_ID: '',
  },
});
