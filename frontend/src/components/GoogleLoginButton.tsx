// src/components/GoogleLoginButton.tsx
import React from 'react';
import { Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

const GoogleLoginButton: React.FC<any> = ({
}) => {
  const handleGoogleLogin = async () => {
    // Chuyển hướng người dùng đến backend endpoint login google
    window.location.href = 'http://localhost:8080/api/v1/auth/google/login';
  };

  return (
    <Button icon={<GoogleOutlined />} onClick={handleGoogleLogin}>
      Sign in with Google
    </Button>
  );
};

export default GoogleLoginButton;
