// src\pages\authentication\GoogleCallbackPage.tsx
import React, { useEffect, useCallback } from 'react'; // Import useCallback
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, Spin } from 'antd';
import axios from 'axios';
import { setUser } from '../../redux/userSlice';
import { useDispatch } from 'react-redux';

interface GoogleCallbackPageProps {
    clientId: string;
    redirectUri: string;
    scope: string;
    backendTokenEndpoint: string;
    onLoginSuccess: (accessToken: string, user: any) => void;
    onLoginFailure: (error: string) => void;
}

const GoogleCallbackPage: React.FC<GoogleCallbackPageProps> = ({
    clientId,
    redirectUri,
    scope,
    backendTokenEndpoint,
    onLoginSuccess,
    onLoginFailure,
}) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // **Định nghĩa exchangeCodeForToken trước useEffect**
    const exchangeCodeForToken = useCallback(async (code: string) => { // Thêm useCallback
        try {
            const codeVerifier = localStorage.getItem('google_code_verifier');
            if (!codeVerifier) {
                throw new Error("Code verifier not found in localStorage");
            }
            localStorage.removeItem('google_code_verifier');

            const tokenResponse = await axios.post(backendTokenEndpoint, {
                code,
                clientId,
                redirectUri,
                codeVerifier,
                grantType: 'authorization_code',
            });

            const { accessToken, user } = tokenResponse.data as { accessToken: string, user: any };

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            dispatch(setUser(user));
            onLoginSuccess(accessToken, user);
            message.success('Google login successful!');
            navigate('/dashboards/general');
        } catch (error: any) {
            console.error("Error exchanging code for token:", error);
            onLoginFailure(error.message || 'Failed to exchange code for token');
            message.error('Google login failed. Please try again.');
            navigate('/auth/signin');
        }
    }, [backendTokenEndpoint, clientId, dispatch, navigate, onLoginFailure, onLoginSuccess, redirectUri]); // Thêm dependencies cho useCallback

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            exchangeCodeForToken(code);
        } else {
            const error = searchParams.get('error');
            if (error) {
                onLoginFailure(`Google login error: ${error}`);
                message.error(`Google login error: ${error}`);
                navigate('/auth/signin');
            }
        }
    }, [searchParams, navigate, exchangeCodeForToken, onLoginFailure]); // Giữ exchangeCodeForToken trong dependencies

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin size="large" tip="Đang xử lý đăng nhập Google..." />
        </div>
    );
};

export default GoogleCallbackPage;
