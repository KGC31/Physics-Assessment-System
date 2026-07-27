import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const region = process.env.APP_REGION || process.env.AWS_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;

const cognito = new CognitoIdentityProviderClient({ region });

async function createCognitoUser({ email, password, fullName, role }: {
  email: string;
  password: string;
  fullName?: string;
  role: 'user' | 'admin';
}) {
  if (!userPoolId) {
    throw new Error('Missing Cognito user pool ID in function environment.');
  }

  await cognito.send(
    new AdminCreateUserCommand({
      UserPoolId: userPoolId,
      Username: email.toLowerCase(),
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        { Name: 'email', Value: email.toLowerCase() },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: fullName ?? '' },
      ],
    })
  );

  await cognito.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: email.toLowerCase(),
      Password: password,
      Permanent: true,
    })
  );

  await cognito.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: email.toLowerCase(),
      GroupName: role === 'admin' ? 'ADMIN' : 'USER',
    })
  );
}

export async function handler(event: any) {
  try {
    const input = event?.arguments?.input ?? event?.input ?? {};
    const email = String(input.email ?? '').trim().toLowerCase();
    const password = String(input.password ?? '');
    const fullName = input.fullName ? String(input.fullName) : undefined;
    const role = input.role === 'admin' ? 'admin' : 'user';

    if (!email || !password || password.length < 8) {
      return {
        success: false,
        message: 'Email and password are required. Password must be at least 8 characters.',
      };
    }

    await createCognitoUser({ email, password, fullName, role });

    return {
      success: true,
      message: 'User created successfully.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message ?? 'Failed to create user.',
    };
  }
}
