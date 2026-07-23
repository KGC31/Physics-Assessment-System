import { defineAuth, secret } from "@aws-amplify/backend";
import { postConfirmation } from "./post-confirmation/resource";

export const auth = defineAuth({
  loginWith: {
    externalProviders: {
      google: {
        clientId: secret("GOOGLE_CLIENT_ID"),
        clientSecret: secret("GOOGLE_CLIENT_SECRET"),
        scopes: ["email", "profile", "openid"],
        attributeMapping: {
          email: "email",
          givenName: "given_name",
          familyName: "family_name",
        },
      },
      callbackUrls: [
        "http://localhost:3000",
        "https://main.dxx5r5cdz3z14.amplifyapp.com",
      ],
      logoutUrls: [
        "http://localhost:3000",
        "https://main.dxx5r5cdz3z14.amplifyapp.com",
      ],
    },
  },
  groups: ["USER", "ADMIN"],
  triggers: {
    postConfirmation,
  },
  access: (allow) => [
    allow.resource(postConfirmation).to(["addUserToGroup"]),
  ],
});