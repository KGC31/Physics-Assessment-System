import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { createUserFunction } from './functions/create-user/resource';

/**
 * Amplify Gen2 backend.
 * Auth: Cognito email/password (admin-created users only).
 * Data: AppSync + DynamoDB.
 */
const backend = defineBackend({
  auth,
  data,
  createUserFunction,
});

// Disable public self sign-up; admins create users via createUser mutation.
const { cfnUserPool } = backend.auth.resources.cfnResources;
cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};

const userPool = backend.auth.resources.userPool;

// Amplify Function factory API (not IFunction / Lambda L2).
backend.createUserFunction.addEnvironment(
  'COGNITO_USER_POOL_ID',
  userPool.userPoolId
);

backend.createUserFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'cognito-idp:AdminCreateUser',
      'cognito-idp:AdminSetUserPassword',
      'cognito-idp:AdminAddUserToGroup',
    ],
    resources: [userPool.userPoolArn],
  })
);
