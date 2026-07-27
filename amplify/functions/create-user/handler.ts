import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
  UsernameExistsException,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient();

type CreateUserEvent = {
  arguments: {
    email: string;
    password: string;
    fullName?: string | null;
    role?: 'user' | 'admin' | null;
  };
};

async function createCognitoUser({
  email,
  password,
  fullName,
  role,
}: {
  email: string;
  password: string;
  fullName?: string;
  role: 'user' | 'admin';
}) {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  if (!userPoolId) {
    throw new Error('Missing COGNITO_USER_POOL_ID in function environment.');
  }

  const username = email.toLowerCase();
  const groupName = role === 'admin' ? 'ADMIN' : 'USER';

  try {
    await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: username,
        MessageAction: 'SUPPRESS',
        TemporaryPassword: password,
        UserAttributes: [
          { Name: 'email', Value: username },
          { Name: 'email_verified', Value: 'true' },
          ...(fullName ? [{ Name: 'name', Value: fullName }] : []),
        ],
      })
    );
  } catch (err) {
    if (!(err instanceof UsernameExistsException)) {
      throw err;
    }
    // User already exists — still refresh password + group below.
  }

  await cognito.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: true,
    })
  );

  await cognito.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: username,
      GroupName: groupName,
    })
  );
}

export const handler = async (event: CreateUserEvent) => {
  try {
    const email = String(event.arguments.email ?? '').trim().toLowerCase();
    const password = String(event.arguments.password ?? '');
    const fullName = event.arguments.fullName
      ? String(event.arguments.fullName).trim()
      : undefined;
    const role = event.arguments.role === 'admin' ? 'admin' : 'user';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Email không hợp lệ.' };
    }

    if (password.length < 8) {
      return { success: false, message: 'Mật khẩu tối thiểu 8 ký tự.' };
    }

    await createCognitoUser({ email, password, fullName, role });

    return {
      success: true,
      message: 'Tạo tài khoản Cognito thành công.',
    };
  } catch (error) {
    console.error('create-user handler error:', error);
    const message =
      error instanceof Error ? error.message : 'Không tạo được tài khoản.';
    return { success: false, message };
  }
};
