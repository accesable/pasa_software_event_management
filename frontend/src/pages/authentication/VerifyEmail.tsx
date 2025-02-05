// src/pages/authentication/VerifyEmail.tsx
import { Button, Flex, Typography, message } from 'antd';
import { Logo } from '../../components';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../constants';
import { useState, useEffect } from 'react';

const { Title, Text } = Typography;

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleVerify = async () => {
    if (!token) {
      message.error("Missing verification token");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        throw new Error("Email verification failed");
      }
      message.success("Email verified successfully");
      navigate(PATH_DASHBOARD.default);
    } catch (error: any) {
      message.error(error.message || "Verification error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optionally auto-trigger verification on load
    // handleVerify();
  }, [token]);

  return (
    <Flex vertical gap="large" align="center" justify="center" style={{ height: '80vh' }}>
      <Logo color="blue" />
      <Title level={2} className="m-0">Verify Your Email</Title>
      <Text style={{ fontSize: 18 }}>
        Click the button below to verify your email.
      </Text>
      <Button type="primary" onClick={handleVerify} loading={loading}>
        Verify Email
      </Button>
      <Flex gap={2}>
        <Text>Didn't receive an email?</Text>
        <Link onClick={handleVerify} to={''}>Resend</Link>
      </Flex>
    </Flex>
  );
};
