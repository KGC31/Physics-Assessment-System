import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { createUserFunction } from '../functions/create-user/resource';
import { deleteUserFunction } from '../functions/delete-user/resource';

/**
 * Survey + profile storage: Amplify Data (AppSync + DynamoDB).
 * Profile.email is the primary key (unique). Users are admin-created in Cognito.
 */
const schema = a.schema({
  Profile: a
    .model({
      email: a.email().required(),
      fullName: a.string(),
      role: a.enum(['user', 'admin']),
    })
    .identifier(['email'])
    .authorization((allow) => [
      allow.group('ADMIN').to(['create', 'read', 'update', 'delete']),
      allow.authenticated().to(['read']),
      allow.owner().to(['read', 'update']),
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

  CreateUserResult: a.customType({
    success: a.boolean().required(),
    message: a.string(),
  }),

  DeleteUserResult: a.customType({
    success: a.boolean().required(),
    message: a.string(),
  }),

  createUser: a
    .mutation()
    .arguments({
      email: a.email().required(),
      password: a.string().required(),
      fullName: a.string(),
      role: a.enum(['user', 'admin']),
    })
    .returns(a.ref('CreateUserResult'))
    .authorization((allow) => [allow.group('ADMIN')])
    .handler(a.handler.function(createUserFunction)),

  deleteUser: a
    .mutation()
    .arguments({
      email: a.email().required(),
    })
    .returns(a.ref('DeleteUserResult'))
    .authorization((allow) => [allow.group('ADMIN')])
    .handler(a.handler.function(deleteUserFunction)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
