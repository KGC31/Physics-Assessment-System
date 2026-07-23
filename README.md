# Physics Assessment

Next.js app for constitutional-type / physics assessment surveys, backed by **AWS Amplify Gen 2** (Cognito + AppSync/DynamoDB). Sign-in is **Google SSO only** via Cognito.

## Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **Auth:** Amazon Cognito (Google OAuth), groups `USER` and `ADMIN`
- **Data:** Amplify Data → AppSync + DynamoDB (`Profile`, `SurveyRecord`)
- **Backend tooling:** Amplify Gen 2 (`ampx` sandbox / pipeline deploy)

## Prerequisites

| Tool | Notes |
|------|--------|
| Node.js 18+ | Matches Next.js 14 |
| npm | Used by project scripts |
| AWS account | For Amplify sandbox / hosting |
| [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) | Configure credentials locally |
| Google Cloud OAuth client | Web application client ID + secret |

## Environment overview

This app does **not** load Google OAuth credentials from a local `.env` file.

| Kind | Where it lives | Used for |
|------|----------------|----------|
| Amplify sandbox secrets | AWS SSM Parameter Store (via `ampx sandbox secret`) | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` in Cognito |
| Generated client config | `amplify_outputs.json` (gitignored) | Frontend Amplify configure after sandbox/deploy |
| Optional local env files | `.env`, `.env.local` | Not required for core auth/data today; see [`.env.example`](.env.example) |

Copy the example file if you want a local placeholder:

```bash
cp .env.example .env
```

`.env` / `.env.local` are for future app-level variables if you add them. Do **not** put Google client secrets in `.env` — Cognito reads them from Amplify secrets via `secret('GOOGLE_CLIENT_ID')` / `secret('GOOGLE_CLIENT_SECRET')` in `amplify/auth/resource.ts`.

## Configure AWS

### 1. Create credentials

Create an IAM user (or use IAM Identity Center / SSO) with permissions to deploy Amplify Gen 2 sandboxes (CloudFormation, Cognito, AppSync, DynamoDB, Lambda, SSM, etc.). For local work, an access key pair is typical.

### 2. Configure the AWS CLI

```bash
aws configure
```

You will be prompted for:

- **AWS Access Key ID**
- **AWS Secret Access Key**
- **Default region** (e.g. `ap-southeast-1`)
- **Default output format** (e.g. `json`)

Verify:

```bash
aws sts get-caller-identity
```

### 3. Named profiles (optional)

If you use multiple accounts:

```bash
aws configure --profile physics-assessment
```

Then pass the profile to Amplify commands:

```bash
npx ampx sandbox --profile physics-assessment
npx ampx sandbox secret set GOOGLE_CLIENT_ID --profile physics-assessment
```

### 4. CDK bootstrap (first time per account/region)

Amplify Gen 2 uses CDK. If sandbox fails with “account/region has not been bootstrapped”:

```bash
npx aws-cdk@latest bootstrap aws://ACCOUNT_ID/REGION
```

Replace `ACCOUNT_ID` and `REGION` with values from `aws sts get-caller-identity` and your configured region.

## Google OAuth (Amplify secrets, not `.env`)

1. In [Google Cloud Console](https://console.cloud.google.com/), create an **OAuth 2.0 Client ID** (Web application).
2. Add authorized redirect URIs for Cognito’s hosted UI / IdP callback (Amplify prints Cognito domain details after sandbox starts; also check the Cognito console).
3. Set sandbox secrets (values are prompted interactively):

```bash
npx ampx sandbox secret set GOOGLE_CLIENT_ID
npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
```

List / remove secrets:

```bash
npx ampx sandbox secret list
npx ampx sandbox secret remove GOOGLE_CLIENT_ID
```

For **Amplify Hosting** branch deploys, set the same secret names in the Amplify console (**Hosting → Secrets**). Sandbox secrets do not appear there; they live in SSM under the `/amplify` prefix.

Local callback/logout URLs currently configured in `amplify/auth/resource.ts`:

- `http://localhost:3000`
- `http://localhost:3000/`

Add production URLs there (and in Google Cloud) before deploying a live site.

## Local development

```bash
npm install
```

Start the Amplify cloud sandbox (writes `amplify_outputs.json`):

```bash
npx ampx sandbox
```

In another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npx ampx sandbox` | Deploy/watch local backend sandbox |

## Roles (ADMIN)

New users are placed in the Cognito `USER` group (post-confirmation trigger). To grant admin access, add the user to the Cognito `ADMIN` group in the AWS Console.

## Hosting note

`amplify.yml` runs `npx ampx pipeline-deploy` using Amplify-provided `AWS_BRANCH` and `AWS_APP_ID`. Ensure branch secrets for Google OAuth are configured in the Amplify console before relying on Google sign-in in deployed environments.
