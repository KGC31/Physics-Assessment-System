'use client';

import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { amplifyOutputs } from '@/lib/amplifyConfig';

Amplify.configure(amplifyOutputs, { ssr: true });

export const dataClient = generateClient<Schema>();
