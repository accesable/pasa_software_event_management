// src\pages\authentication\GoogleAppwriteCallbackPage.tsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, Spin } from 'antd';
import { Account, Client, OAuthProvider } from 'appwrite';
import { setUser } from '../../redux/userSlice';
import { useDispatch } from 'react-redux';

interface GoogleAppwriteCallbackPageProps {
    redirectUri: string;
    onLoginSuccess: (user: any) => void;
    onLoginFailure: (error: string) => void;
    projectId: string;
    endpoint: string;
}

const GoogleAppwriteCallbackPage: React.FC<GoogleAppwriteCallbackPageProps> = ({
    redirectUri,
    onLoginSuccess,
    onLoginFailure,
}) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            createAppwriteSession(code);
        } else {
            const error = searchParams.get('error');
            if (error) {
                console.error("Google OAuth error:", error);
                message.error(`Google login error: ${error}`);
                onLoginFailure?.(error);
                navigate('/auth/signin');
            }
        }
    }, [searchParams, navigate, onLoginFailure, onLoginSuccess, redirectUri]);

    const createAppwriteSession = async (code: string) => {
        try {
            const client = new Client()
                .setEndpoint('https://cloud.appwrite.io/v1')
                .setProject('123456789abc');

            const account = new Account(client);

            await account.createOAuth2Session(
                'google' as OAuthProvider,
                redirectUri,
                undefined,
                [code]
            );

            const user = await account.get();

            dispatch(setUser({
                id: user.$id,
                email: user.email,
                name: user.name,
                avatar: `https://gravatar.com/avatar/${user.prefs.avatar}?d=robohash&r=g&s=100`,
            }));

            localStorage.setItem('user', JSON.stringify({
                id: user.$id,
                email: user.email,
                name: user.name,
                avatar: `https://gravatar.com/avatar/${user.prefs.avatar}?d=robohash&r=g&s=100`,
            }));

            message.success('Google login successful!');
            onLoginSuccess?.(user);
            navigate('/dashboards/default');
        } catch (error: any) {
            console.error("Error creating Appwrite session from Google code:", error);
            message.error('Google login failed. Please try again.');
            onLoginFailure?.(error.message || 'Failed to create Appwrite session');
            navigate('/auth/signin');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" tip="Đang xử lý đăng nhập Google..." />
        </div>
    );
};

export default GoogleAppwriteCallbackPage;