// src\pages\authentication\SignInPage.tsx
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
  Link,
  useNavigate,
} from 'react-router-dom';
import authService from '../../services/authService';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import { PATH_AUTH } from '../../constants';
import { useMediaQuery } from 'react-responsive';

const { Title, Text } = Typography;

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
  const useDispatchHook = useDispatch();

  const onFinish = async (values: FieldType) => {
    setLoading(true);
    try {
      const response = await authService.login(values) as unknown as {
        statusCode: number,
        message: string,
        data: {
          accessToken: string,
          user: any
        },
        error? : string
      };

      if (response.statusCode === 200) {
        message.success(response.message);

        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        useDispatchHook(setUser(response.data.user));

        setTimeout(() => {
          navigate('/dashboards/default');
        }, 1000);
      } else {
        message.error(response.error || 'Login failed');
      }
    } catch (error: any) {
      message.error(error.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
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
            <Link to={PATH_AUTH.signup}>Create an account here</Link>
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
                <Link to={PATH_AUTH.passwordReset}>Forgot password?</Link>
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
            <GoogleLoginButton
              projectId='123456789abc'
              endpoint='https://cloud.appwrite.io/v1'
              clientId="752824572639-0nbbmbqgqj28oue1bsi2ouee2923oloj.apps.googleusercontent.com"
              redirectUri="http://localhost:5173/auth/google/callback"
              scope="email profile openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
              onLoginSuccess={() => { /* Optional success handler */ }}
              onLoginFailure={() => { /* Optional failure handler */ }}
            />
          </Flex>
        </Flex>
      </Col>
    </Row>
  );
};