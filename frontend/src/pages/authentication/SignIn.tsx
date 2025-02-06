// src\pages\authentication\SignIn.tsx
import React, { useState } from 'react';
import {
  Button,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Row,
  theme,
  Typography,
} from 'antd';
import {
  FacebookFilled,
  GoogleOutlined,
  TwitterOutlined,
} from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';
import { PATH_AUTH, PATH_DASHBOARD } from '../../constants';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';

const { Title, Text, Link } = Typography;

type FieldType = {
  email?: string;
  password?: string;
};

export const SignInPage = () => {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const isMobile = useMediaQuery({ maxWidth: 769 });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const onFinish = async (values: FieldType) => {
    setLoading(true);
    try {
      const response = await authService.login(values) as unknown as {
        statusCode: number,
        message: string,
        data: {
          accessToken: string,
          user: any
        }
      };

      if (response.statusCode === 200) {
        message.success(response.message);

        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        dispatch(setUser(response.data.user));

        setTimeout(() => {
          navigate(PATH_DASHBOARD.default);
        }, 1000);
      } else {
        message.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      message.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const response = await authService.googleLogin() as unknown as {
        statusCode: number,
        message: string,
        data: { url: string }
      };

      if (response.statusCode === 200) {
        window.location.href = response.data.url;
      } else {
        message.error(response.message || 'Google Login failed');
      }
    } catch (error: any) {
      console.error('Google Login failed:', error);
      message.error(error.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

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
          <Title level={2} className="text-white">
            Welcome back to Event Management
          </Title>
          <Text className="text-white" style={{ fontSize: 18 }}>
            A Solution For Managing Your Event
          </Text>
        </Flex>
      </Col>
      <Col xs={24} lg={12}>
        <Flex
          vertical
          align={isMobile ? 'center' : 'flex-start'}
          justify="center"
          gap="middle"
          style={{ height: '100%', padding: '2rem' }}
        >
          <Title className="m-0">Login</Title>
          <Flex gap={4}>
            <Text>Don't have an account?</Text>
            <Link href={PATH_AUTH.signup}>Create an account here</Link>
          </Flex>
          <Form
            name="sign-in-form"
            layout="vertical"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValues={{}}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            requiredMark={false}
          >
            <Row gutter={[8, 0]}>
              <Col xs={24}>
                <Form.Item<FieldType>
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email' },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item<FieldType>
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: 'Please input your password!' },
                  ]}
                >
                  <Input.Password autoComplete="current-password" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Flex align="center" justify="space-between">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  loading={loading}
                >
                  Continue
                </Button>
                <Link href={PATH_AUTH.passwordReset}>Forgot password?</Link>
              </Flex>
            </Form.Item>
          </Form>
          <Divider className="m-0">or</Divider>
          <Flex
            vertical={isMobile}
            gap="small"
            wrap="wrap"
            style={{ width: '100%' }}
          >
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={loading}
            >
              Sign in with Google
            </Button>
            {/* You can add Facebook, Twitter login buttons here if needed */}
          </Flex>
        </Flex>
      </Col>
    </Row>
  );
};