// src\pages\authentication\SignIn.tsx
// src\pages\authentication\SignInPage.tsx
import { useState, useEffect } from 'react';
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
  useLocation,
  useNavigate,
} from 'react-router-dom';
import authService from '../../services/authService';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../../redux/userSlice';
import GoogleLoginButton from '../../components/GoogleLoginButton';
import { PATH_AUTH } from '../../constants';
import { useMediaQuery } from 'react-responsive';
import { Logo } from '../../components';
import { RootState } from '../../redux/store';

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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const useDispatchHook = useDispatch();
  const user = useSelector((state: RootState) => state.user);

  // useEffect hook to redirect if already logged in
  useEffect(() => {
    if (user && user.id) {
      navigate('/dashboards/general', { replace: true });
    }
  }, [user, navigate]);


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
        error?: string
      };

      if (response.statusCode === 200) {
        message.success(response.message);

        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        useDispatchHook(setUser(response.data.user));

        setTimeout(() => {
          const from = location.state?.from || '/dashboards/general'; // Lấy URL đầy đủ từ state.from
          navigate(from, { replace: true }); // Redirect đến URL đầy đủ hoặc dashboard
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
          <Logo color="white" />
          <Title level={2} className="text-white">
            Welcome back to Event Management
          </Title>
          <Text className="text-white" style={{ fontSize: 18 }}>
            Sign in page
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
            <GoogleLoginButton />
          </Flex>
        </Flex>
      </Col>
    </Row>
  );
};
