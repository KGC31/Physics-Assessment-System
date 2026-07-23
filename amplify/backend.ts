import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

/**
 * Amplify Gen2 backend.
 * Storage for surveys/profiles: Amplify Data → Amazon DynamoDB (via AppSync).
 * Auth: Amazon Cognito User Pool with Google as the only SSO provider exposed in the UI.
 */
const backend = defineBackend({
  auth,
  data,
});

// Block native email/password self-signup; Google federated sign-in still works.
const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};
