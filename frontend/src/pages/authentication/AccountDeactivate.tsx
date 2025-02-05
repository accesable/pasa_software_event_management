// src/pages/authentication/AccountDeactivate.tsx
import { Button, Flex, Typography, message } from 'antd';
import { Logo } from '../../components';
import { Link, useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../constants';
import { useState } from 'react';

const { Title, Text } = Typography;

export const AccountDeactivePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/auth/account-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error("Account deactivation failed");
      }
      message.success("Account deactivated successfully");
      navigate(PATH_DASHBOARD.default);
    } catch (error: any) {
      message.error(error.message || "Deactivation error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex vertical gap="large" align="center" justify="center" style={{ height: '80vh' }}>
      <Logo color="blue" />
      <Title level={2} className="m-0">Deactivated Account</Title>
      <Text style={{ fontSize: 18 }}>
        Your account has been deactivated.
      </Text>
      <Button type="primary" onClick={handleDeactivate} loading={loading}>
        Reactivate Account
      </Button>
      <Link to={PATH_DASHBOARD.default}>
        <Button type="default">Go to Homepage</Button>
      </Link>
    </Flex>
  );
};
