import { useState } from 'react';
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
  GoogleOutlined,
} from '@ant-design/icons';
import { Logo } from '../../components';
import { useMediaQuery } from 'react-responsive';
import { PATH_AUTH } from '../../constants';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

type FieldType = {
  name?: string;
  email?: string;
  password?: string;
  remember?: boolean;
};

export const SignUpPage = () => {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const isMobile = useMediaQuery({ maxWidth: 769 });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (_values: FieldType) => {
    setLoading(true);
    try {
      message.success('Registration successful, please login.');
      setTimeout(() => {
        navigate(PATH_AUTH.signin);
      }, 1000); // chuyển hướng đến trang đăng nhập sau 1s
    } catch (error: any) {
      console.error('Registration failed:', error);
      message.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
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
            Sign up page
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
          <Title className="m-0">Create an account</Title>
          <Flex gap={4}>
            <Text>Already have an account?</Text>
            <Link href={PATH_AUTH.signin}>Sign in here</Link>
          </Flex>
          <Flex
            vertical={isMobile}
            gap="small"
            wrap="wrap"
            style={{ width: '100%' }}
          >
            <Button icon={<GoogleOutlined />}>Sign up with Google</Button>
          </Flex>
          <Divider className="m-0">or</Divider>
          <Form
            name="sign-up-form"
            layout="vertical"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            requiredMark={false}
          >
            <Row gutter={[8, 0]}>
              <Col xs={24}>
                <Form.Item<FieldType>
                  label="User name"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your name!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
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
                  <Input.Password />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="middle"
                loading={loading}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </Col>
    </Row>
  );
};
