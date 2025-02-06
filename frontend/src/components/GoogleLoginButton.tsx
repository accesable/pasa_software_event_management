// src\components\GoogleLoginButton.tsx
import React from 'react';
import { Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { generateCodeChallenge, generateCodeVerifier } from './oauth2-pkce';

interface GoogleLoginButtonProps {
  clientId: string;
  redirectUri: string;
  scope: string;
  onLoginSuccess: (accessToken: string, user: any) => void;
  onLoginFailure: (error: string) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  clientId,
  redirectUri,
  scope,
  onLoginSuccess,
  onLoginFailure,
}) => {
  const handleGoogleLogin = async () => {
    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      localStorage.setItem('google_code_verifier', codeVerifier); // Lưu codeVerifier vào localStorage

      const authorizationUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;

      window.location.href = authorizationUrl; // Redirect đến trang đăng nhập Google
    } catch (error: any) {
      console.error("Error during Google login initiation:", error);
      onLoginFailure(error.message || 'Failed to initiate Google login');
    }
  };

  return (
    <Button icon={<GoogleOutlined />} onClick={handleGoogleLogin}>
      Sign in with Google (Frontend)
    </Button>
  );
};

export default GoogleLoginButton;