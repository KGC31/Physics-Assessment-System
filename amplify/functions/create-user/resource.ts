import { defineFunction } from '@aws-amplify/backend-function';

export const createUserFunction = defineFunction({
  name: 'create-user',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 15,
  memoryMB: 512,
  environment: {
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID ?? '',
    APP_REGION: process.env.APP_REGION ?? process.env.AWS_REGION ?? 'ap-southeast-1',
  },
});
