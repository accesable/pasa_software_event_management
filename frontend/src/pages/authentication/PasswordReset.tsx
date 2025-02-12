// src\pages\authentication\PasswordReset.tsx
import { useState } from 'react';
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
  Alert, // Import Alert
} from 'antd';
import { Logo } from '../../components';
import { useMediaQuery } from 'react-responsive';
import { PATH_AUTH } from '../../constants';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService'; // Import authService

const { Title, Text } = Typography;

type FieldType = {
  email?: string;
};

export const PasswordResetPage = () => {
  const {
    token: { colorPrimary },
  } = theme.useToken();
  const isMobile = useMediaQuery({ maxWidth: 769 });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State error

  const onFinish = async (values: FieldType) => {
    setLoading(true);
    setError(null); // Reset error khi bắt đầu submit
    try {
      const response = await authService.forgotPassword(values.email as string) as { message: string }; // Gọi authService.forgotPassword
      message.success(response.message);
      setTimeout(() => {
        navigate(PATH_AUTH.signin); // Redirect về trang signin sau khi thành công
      }, 3000); // Giảm thời gian redirect xuống 3 giây
    } catch (error: any) {
      setError(error.message || "Password reset failed!"); // Set error message
      // message.error(error.message || "Password reset failed!"); // Không cần message.error ở đây, Alert sẽ hiển thị lỗi
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
          <Logo color="white" />
          <Title level={2} className="text-white">
            Forgot Password
          </Title>
          <Text className="text-white" style={{ fontSize: 18 }}>
            Enter your email to reset your password.
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
          <Title className="m-0">Forgot password</Title>
          {error && <Alert message="Error" description={error} type="error" showIcon closable onClose={() => setError(null)} />} {/* Hiển thị Alert lỗi */}
          <Form
            name="password-reset-form" // Đổi tên form
            layout="vertical"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            initialValues={{}} // Loại bỏ remember: true
            onFinish={onFinish}
            autoComplete="off"
            requiredMark={false}
            style={{ width: '100%' }}
          >
            <Form.Item<FieldType>
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please input your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <Input placeholder="Your email address" />
            </Form.Item>
            <Form.Item>
              <Flex align="center" gap="small">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="middle"
                  loading={loading}
                >
                  Submit
                </Button>
                <Button type="text" size="middle" loading={loading} onClick={() => navigate(PATH_AUTH.signin)}> {/* Thêm onClick handler để cancel */}
                  Cancel
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </Flex>
      </Col>
    </Row >
  );
};
