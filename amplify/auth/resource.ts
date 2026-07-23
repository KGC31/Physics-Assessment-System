import { defineAuth, secret } from '@aws-amplify/backend';
import { postConfirmation } from './post-confirmation/resource';

/**
 * Cognito auth: Google SSO only (UI). Email attribute is mapped from Google.
 * Roles via Cognito groups: USER (default) and ADMIN (assign in Cognito console).
 */
export const auth = defineAuth({
  loginWith: {
    // Required by Cognito for the email attribute Google returns; password UI is not exposed.
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: 'email',
          givenName: 'given_name',
          familyName: 'family_name',
        },
      },
      callbackUrls: [
        'http://localhost:3000/',
        'http://localhost:3000',
      ],
      logoutUrls: [
        'http://localhost:3000/',
        'http://localhost:3000',
      ],
    },
  },
  groups: ['USER', 'ADMIN'],
  triggers: {
    postConfirmation,
  },
  access: (allow) => [allow.resource(postConfirmation).to(['addUserToGroup'])],
});
