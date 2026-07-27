import { defineBackend } from "@aws-amplify/backend";

import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { createUserFunction } from "./functions/create-user/resource";

const backend = defineBackend({
  auth,
  data,
  createUserFunction,
});

// Disable self sign-up
const { cfnUserPool } = backend.auth.resources.cfnResources;

cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};