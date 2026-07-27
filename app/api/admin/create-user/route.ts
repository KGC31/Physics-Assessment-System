import { NextResponse } from "next/server";

import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoConfig: any = {
    region: process.env.APP_REGION || process.env.AWS_REGION,
};

if (process.env.APP_ACCESS_KEY_ID && process.env.APP_SECRET_ACCESS_KEY) {
    cognitoConfig.credentials = {
        accessKeyId: process.env.APP_ACCESS_KEY_ID,
        secretAccessKey: process.env.APP_SECRET_ACCESS_KEY,
    };
}

const cognito = new CognitoIdentityProviderClient(cognitoConfig);

export async function POST(req: Request) {
    try {
        const {
            email,
            password,
            fullName,
            role,
        } = await req.json();

        const userPoolId = process.env.COGNITO_USER_POOL_ID || process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;

        console.log('create-user route env: COGNITO_USER_POOL_ID=', process.env.COGNITO_USER_POOL_ID);
        console.log('create-user route env: NEXT_PUBLIC_COGNITO_USER_POOL_ID=', process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID);
        console.log('create-user route env: APP_REGION=', process.env.APP_REGION);
        console.log('create-user route env: AWS_REGION=', process.env.AWS_REGION);
        console.log('create-user route env: APP_ACCESS_KEY_ID=', !!process.env.APP_ACCESS_KEY_ID);
        console.log('create-user route env: APP_SECRET_ACCESS_KEY=', !!process.env.APP_SECRET_ACCESS_KEY);

        if (!userPoolId) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing Cognito user pool ID in environment variables.',
                },
                { status: 500 }
            );
        }

        if (!cognitoConfig.region) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Missing AWS region in environment variables.',
                },
                { status: 500 }
            );
        }

        await cognito.send(
            new AdminCreateUserCommand({
                UserPoolId: userPoolId,
                Username: email.toLowerCase(),
                MessageAction: "SUPPRESS",
                UserAttributes: [
                    {
                        Name: "email",
                        Value: email.toLowerCase(),
                    },
                    {
                        Name: "email_verified",
                        Value: "true",
                    },
                    {
                        Name: "name",
                        Value: fullName,
                    },
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
                GroupName: role === "admin"
                    ? "ADMIN"
                    : "USER",
            })
        );

        return NextResponse.json({
            success: true,
        });
    } catch (err: any) {
        console.error(err);

        return NextResponse.json(
            {
                success: false,
                message: err.message,
            },
            {
                status: 500,
            }
        );
    }
}