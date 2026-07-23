import type { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

/**
 * Assign every newly confirmed user (including first Google SSO login) to the USER group.
 * Promote to ADMIN manually in the Cognito console (User pool → Users → Groups).
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  await client.send(
    new AdminAddUserToGroupCommand({
      GroupName: 'USER',
      Username: event.userName,
      UserPoolId: event.userPoolId,
    })
  );
  return event;
};
