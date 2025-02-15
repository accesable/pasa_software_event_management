// src/pages/userAccount/Security.tsx
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  message,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useState } from 'react';
import authService from '../../services/authService';

type FieldType = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export const UserProfileSecurityPage = () => {
  const [form] = Form.useForm<FieldType>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: FieldType) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("New password and confirmation password do not match!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const passwordData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        message.error("Access token is missing.");
        setLoading(false);
        return;
      }
      const response = await authService.changePassword(passwordData, accessToken) as any;
      if (response.statusCode === 200) {
        message.success(response.message);
        form.resetFields();
      } else {
        setError(response?.error || "Failed to change password.");
        message.error(response?.error  || "Failed to change password.");
      }
    } catch (error: any) {
      setError(error.error || "Failed to change password.");
      message.error(error.error || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = () => {
  };

  return (
    <Card title="Change your password">
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form
        form={form}
        name="form-change-password"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        requiredMark={false}
      >
        <Row gutter={[16, 0]}>
          <Col span={24}>
            <Form.Item<FieldType>
              label="Current password"
              name="currentPassword"
              rules={[{ required: true, message: 'Please input your current password!' }]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<FieldType>
              label="New password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 6, message: 'Password must be at least 6 characters long!' },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<FieldType>
              label="Confirm password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please re-input your new password!' },
                ({ getFieldValue }) => ({
                  validator(_: any, value: string) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject('The two passwords that you entered do not match!');
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
            Save changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};
