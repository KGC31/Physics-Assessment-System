import { NextResponse } from "next/server";

import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({
    region: process.env.APP_REGION,
    credentials: {
        accessKeyId: process.env.APP_ACCESS_KEY_ID!,
        secretAccessKey: process.env.APP_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: Request) {
    try {
        const {
            email,
            password,
            fullName,
            role,
        } = await req.json();

        const userPoolId = process.env.COGNITO_USER_POOL_ID!;

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