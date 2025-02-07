// src\components\GoogleLoginButton.tsx
import React from 'react';
import { Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { Account, Client, ID, OAuthProvider } from 'appwrite';

interface GoogleLoginButtonProps {
    redirectUri: string;
    clientId: string;
    scope: string;
    onLoginSuccess: (accessToken: string, user: any) => void;
    onLoginFailure: (error: string) => void;
    projectId: string; // **ĐẢM BẢO PROP NÀY CÓ TỒN TẠI**
    endpoint: string;  // **ĐẢM BẢO PROP NÀY CÓ TỒN TẠI**
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
    clientId,
    redirectUri,
    scope,
    onLoginSuccess,
    onLoginFailure,
    projectId, // **ĐẢM BẢO PROP NÀY ĐƯỢC SỬ DỤNG**
    endpoint, // **ĐẢM BẢO PROP NÀY ĐƯỢC SỬ DỤNG**
}) => {
    const handleGoogleLogin = async () => {
        try {
            const client = new Client()
                .setEndpoint(endpoint) // Sử dụng prop endpoint
                .setProject(projectId); // Sử dụng prop projectId

            const account = new Account(client);

            await account.createOAuth2Session(
                'google' as OAuthProvider,
                redirectUri,
                scope
            );

        } catch (error: any) {
            console.error("Error during Google login initiation:", error);
            onLoginFailure(error.message || 'Failed to initiate Google login');
        }
    };

    return (
        <Button icon={<GoogleOutlined />} onClick={handleGoogleLogin}>
            Sign in with Google (Appwrite)
        </Button>
    );
};

export default GoogleLoginButton;