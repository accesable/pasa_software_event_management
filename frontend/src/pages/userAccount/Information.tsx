// src\pages\userAccount\Information.tsx
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
} from 'antd';
import { SaveOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../redux/userSlice';
import dayjs from 'dayjs';
import authService from '../../services/authService';

const SOCIALS = [
  'Facebook',
  'Instagram',
  'Twitter',
  'LinkedIn',
  'Mastodon',
  'Threads',
  'YouTube',
  'WhatsApp',
  'Tiktok',
  'Telegram',
  'QQ',
  'WeChat',
];

interface FieldType {
  name?: string;
  phoneNumber?: string;
  country?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  preferred?: boolean;
  dob?: dayjs.Dayjs;
  socialLinks?: { social?: string; username?: string }[];
}

type BirthdayFieldType = {
  dob?: string;
};

export const UserProfileInformationPage = () => {
  const [form] = Form.useForm<FieldType>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken') || undefined;
        const response = await authService.getUserProfile(accessToken) as any;
        if (response.statusCode === 200 && response.data.user) {
          form.setFieldsValue({
            name: response.data.user.name,
            phoneNumber: response.data.user.phoneNumber,
            country: 'Kenya', // Giá trị mặc định, bạn có thể thay đổi hoặc lấy từ API nếu có
            addressLine1: '828, 18282 ABC Drive, XYZ Rd', // Giá trị mặc định
            city: 'Nairobi', // Giá trị mặc định
            postalCode: '00100', // Giá trị mặc định
            preferred: true, // Giá trị mặc định
            dob: dayjs('1996/04/27'), // Giá trị mặc định
            socialLinks: [], // Giá trị mặc định
          });
        } else {
          setError(response?.message || 'Failed to load user profile');
          message.error(response?.message || 'Failed to load user profile');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load user profile');
        message.error(error.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [form, dispatch]);

  const onFinish = async (values: FieldType) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken') || '';
      // Chỉ gửi 2 field: name và phoneNumber
      const payload = {
        name: values.name,
        phoneNumber: values.phoneNumber,
      };
      const response = await authService.updateUserProfile(payload, accessToken) as any;
      if (response.statusCode === 200 && response.data.user) {
        message.success(response.message);
        dispatch(updateUserProfile({ name: response.data.user.name, phoneNumber: response.data.user.phoneNumber })); // Update Redux
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Update localStorage
      } else {
        setError(response?.message || 'Failed to update user profile');
        message.error(response?.message || 'Failed to update user profile');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update user profile');
      message.error(error.message || 'Failed to update user profile');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div>
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

      <Card title="Personal Information">
        <Flex gap="large" vertical>
          <Form
            form={form}
            name="user-profile-info-form"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            requiredMark={false}
          >
            <Row gutter={[16, 0]}>
              <Col sm={24} lg={12}>
                <Form.Item<FieldType>
                  label="Name"
                  name="name"
                  rules={[{ required: true, message: 'Please input your name!' }]}
                >
                  <Input placeholder="Your Name" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={12}>
                <Form.Item<FieldType>
                  label="Phone Number"
                  name="phoneNumber"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="Your Phone Number (Optional)" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={12}>
                <Form.Item<FieldType>
                  label="Country"
                  name="country"
                  rules={[{ required: false, message: 'Please select your country or region!' }]}
                >
                  <Select options={[]} placeholder="Country" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={12}>
                <Form.Item<FieldType>
                  label="City"
                  name="city"
                  rules={[{ required: false, message: 'Please enter your city!' }]}
                >
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={12}>
                <Form.Item<FieldType>
                  label="Address line 1"
                  name="addressLine1"
                  rules={[{ required: false, message: 'Please enter your address line!' }]}
                >
                  <Input.TextArea placeholder="Address line 1" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={12}>
                <Form.Item<FieldType>
                  label="Address line 2"
                  name="addressLine2"
                  rules={[{ required: false, message: 'Please enter your address line!' }]}
                >
                  <Input.TextArea placeholder="Address line 2" />
                </Form.Item>
              </Col>
              <Col sm={24} lg={8}>
                <Form.Item<BirthdayFieldType>
                  label="Birth date"
                  name="dob"
                  rules={[{ required: false, message: 'Please select your birthday!' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                Save changes
              </Button>
            </Form.Item>
          </Form>
        </Flex>
      </Card>

      <Card title="Social links" style={{ marginTop: 24 }}>
        {/* Phần Social links vẫn hiển thị nhưng không ảnh hưởng đến patch update */}
        <Form
          name="user-profile-social-form"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.List name="socialLinks">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Flex
                    key={key}
                    align="baseline"
                    gap="small"
                    style={{ marginBottom: 8 }}
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'social']}
                      rules={[{ required: true, message: 'Missing social' }]}
                      style={{ width: 200 }}
                    >
                      <Select
                        placeholder="social"
                        options={SOCIALS.map((s) => ({ value: s, label: s }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'username']}
                      rules={[{ required: true, message: 'Missing username' }]}
                    >
                      <Input placeholder="username" />
                    </Form.Item>
                    <Button
                      type="text"
                      icon={<MinusCircleOutlined />}
                      onClick={() => remove(name)}
                    ></Button>
                  </Flex>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add link
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Save changes
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
