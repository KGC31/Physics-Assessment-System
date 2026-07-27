import {
  CognitoIdentityProviderClient,
  AdminDeleteUserCommand,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';

const cognito = new CognitoIdentityProviderClient();

type DeleteUserEvent = {
  arguments: {
    email: string;
  };
};

export const handler = async (event: DeleteUserEvent) => {
  try {
    const email = String(event.arguments.email ?? '').trim().toLowerCase();
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    if (!userPoolId) {
      return {
        success: false,
        message: 'Missing COGNITO_USER_POOL_ID in function environment.',
      };
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: 'Email không hợp lệ.' };
    }

    try {
      await cognito.send(
        new AdminDeleteUserCommand({
          UserPoolId: userPoolId,
          Username: email,
        })
      );
    } catch (err) {
      // Already gone in Cognito — still treat as success so Profile can be removed.
      if (!(err instanceof UserNotFoundException)) {
        throw err;
      }
    }

    return {
      success: true,
      message: 'Đã xóa tài khoản Cognito.',
    };
  } catch (error) {
    console.error('delete-user handler error:', error);
    const message =
      error instanceof Error ? error.message : 'Không xóa được tài khoản Cognito.';
    return { success: false, message };
  }
};
