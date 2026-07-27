'use client';

import { Amplify } from 'aws-amplify';
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

async function createUser(input: CreateUserInput) {
  const response = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? 'Không tạo được tài khoản.');
  }

  return result;
}

export const dataClient = Object.assign(baseDataClient, {
  mutations: {
    createUser,
  },
});
