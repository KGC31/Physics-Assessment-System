import { defineBackend } from "@aws-amplify/backend";

import { auth } from "./auth/resource";
import { data } from "./data/resource";

const backend = defineBackend({
  auth,
  data,
});

// Disable self sign-up
const { cfnUserPool } = backend.auth.resources.cfnResources;

cfnUserPool.adminCreateUserConfig = {
  allowAdminCreateUserOnly: true,
};