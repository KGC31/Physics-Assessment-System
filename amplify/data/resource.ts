import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Survey + profile storage: Amplify Data (AppSync + DynamoDB).
 * Better fit than S3 for structured records with Cognito owner/group auth.
 */
const schema = a.schema({
  Profile: a
    .model({
      email: a.email().required(),
      fullName: a.string(),
      role: a.enum(['user', 'admin']),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('ADMIN').to(['read', 'update', 'delete']),
    ]),

  SurveyRecord: a
    .model({
      patientName: a.string().required(),
      birthYear: a.integer().required(),
      address: a.string(),
      gender: a.string().required(),
      answers: a.json().required(),
      results: a.json().required(),
      ownerEmail: a.string(),
      ownerName: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group('ADMIN').to(['read', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
