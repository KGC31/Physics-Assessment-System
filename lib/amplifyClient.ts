'use client';

import { Amplify } from '@aws-amplify/core';
import { GraphQLAPI, graphqlOperation } from '@aws-amplify/api-graphql';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs, { ssr: true });

const baseDataClient = generateClient<Schema>();

type CreateUserInput = {
  email: string;
  password: string;
  fullName?: string;
  role: 'user' | 'admin';
};

const createUserMutation = `
  mutation CreateAdminUser($email: String!, $password: String!, $fullName: String, $role: String!) {
    createUser(email: $email, password: $password, fullName: $fullName, role: $role) {
      success
      message
    }
  }
`;

async function createUser(input: CreateUserInput) {
  const response = await GraphQLAPI.graphql(
    Amplify,
    graphqlOperation(createUserMutation, {
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      role: input.role,
    })
  ) as any;

  const result = response?.data?.createUser;

  if (!result?.success) {
    throw new Error(result?.message ?? 'Không tạo được tài khoản.');
  }

  return result;
}

export const dataClient = Object.assign(baseDataClient, {
  mutations: {
    createUser,
  },
});
