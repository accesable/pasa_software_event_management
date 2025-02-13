// src\pages\authentication\ResetPasswordConfirmPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Row,
  theme,
  Typography,
  Alert,
  Spin,
} from 'antd';
import { Logo } from '../../components';
import { useMediaQuery } from 'react-responsive';
import { PATH_AUTH } from '../../constants';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const { Title, Text } = Typography;

type FieldType = {
  newPassword?: string;
  confirmPassword?: string;
};

const ResetPasswordConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null); // null: initial, true: valid, false: invalid
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const isMobile = useMediaQuery({ maxWidth: 769 });
  const [form] = Form.useForm<FieldType>();

  useEffect(() => {
    const validateToken = async () => {
      setLoading(true);
      setError(null);
      if (!token) {
        setError("Invalid token.");
        setTokenValid(false);
        setLoading(false);
        return;
      }
      try {
        const response = await axiosInstance.get(`/auth/validate-reset-token?token=${token}`);
        if (response.status === 200) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error: any) {
        setTokenValid(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const onFinish = async (values: FieldType) => {
    if (!token) {
      message.error("Invalid token, please retry from reset password email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        token: token,
        newPassword: values.newPassword,
      });
      if (response.status === 200) {
        message.success("Password reset successful!"); // Generic success message
        setTimeout(() => {
          navigate(PATH_AUTH.signin);
        }, 1500);
      } else {
        setError("Password reset failed. Please try again."); // Generic error message
      }
    } catch (error: any) {
      setError("Password reset failed. Please try again."); // Generic error message
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Validating Token..." />
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <Row style={{ minHeight: isMobile ? 'auto' : '100vh', overflow: 'hidden' }}>
        <Col xs={24} lg={12}>
          <Flex
            vertical
            align="center"
            justify="center"
            className="text-center"
            style={{ background: colorPrimary, height: '100%', padding: '1rem' }}
          >
            <Logo color="white" />
            <Title level={2} className="text-white">
              Reset Password
            </Title>
          </Flex>
        </Col>
        <Col xs={24} lg={12}>
          <Flex
            vertical
            align={isMobile ? 'center' : 'flex-start'}
            justify="center"
            gap="middle"
            style={{ height: '100%', width: '100%', padding: '2rem' }}
          >
            <Title className="m-0">Reset password</Title>
            {error && <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError(null)} />}
            <Alert
              message="Invalid Token"
              description="Password reset link is invalid or has expired. Please try the forgot password process again."
              type="error"
              showIcon
              closable
            />
            <Button type="primary" onClick={() => navigate(PATH_AUTH.passwordReset)}>
              Back to Forgot Password
            </Button>
          </Flex>
        </Col>
      </Row>
    );
  }

  return (
    <Row style={{ minHeight: isMobile ? 'auto' : '100vh', overflow: 'hidden' }}>
      <Col xs={24} lg={12}>
        <Flex
          vertical
          align="center"
          justify="center"
          className="text-center"
          style={{ background: colorPrimary, height: '100%', padding: '1rem' }}
        >
          <Logo color="white" />
          <Title level={2} className="text-white">
            Reset Password
          </Title>
          <Text className="text-white" style={{ fontSize: 18 }}>
            Enter your new password.
          </Text>
        </Flex>
      </Col>
      <Col xs={24} lg={12}>
        <Flex
          vertical
          align={isMobile ? 'center' : 'flex-start'}
          justify="center"
          gap="middle"
          style={{ height: '100%', width: '100%', padding: '2rem' }}
        >
          <Title className="m-0">Enter new password</Title>
          {error && <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError(null)} />}
          <Form
            form={form}
            name="reset-password-confirm-form"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            requiredMark={false}
            style={{ width: '100%' }}
          >
            <Form.Item<FieldType>
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please input your new password' },
                { min: 6, message: 'Password must be at least 6 characters long' },
              ]}
            >
              <Input.Password placeholder="New Password" />
            </Form.Item>

            <Form.Item<FieldType>
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_: any, value: string) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('The confirm password that you entered do not match!');
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm Password" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" size="middle" loading={loading}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </Col>
    </Row>
  );
};

export default ResetPasswordConfirmPage;
