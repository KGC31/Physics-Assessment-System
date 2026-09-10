import type { ResourcesConfig } from 'aws-amplify';

/**
 * Amplify generates amplify_outputs.json when the backend is deployed.
 * Keep a valid fallback for local previews created from the frontend repo alone.
 */
export const amplifyOutputs: ResourcesConfig = {};
