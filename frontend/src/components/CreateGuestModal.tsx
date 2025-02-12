// src\components\CreateGuestModal.tsx
import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import authService from '../services/authService';

interface CreateGuestModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreated: (newGuest: any) => void; // Callback khi guest được tạo thành công
}

const CreateGuestModal: React.FC<CreateGuestModalProps> = ({ visible, onCancel, onCreated }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    onCancel();
    form.resetFields(); // Reset form khi cancel
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error('Bạn chưa đăng nhập.');
        return;
      }
      const response = await authService.createGuest(values, accessToken) as any;
      if (response.statusCode === 201 && response.data.guest) {
        message.success('Guest created successfully!');
        onCreated(response.data.guest); // Gọi callback và truyền guest mới
        handleCancel(); // Đóng modal và reset form
      } else {
        message.error(response.message || 'Failed to create guest');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to create guest');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Modal
      title="Create New Guest"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="create-guest-form"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input guest name!' }]}
        >
          <Input placeholder="Guest Name" />
        </Form.Item>
        <Form.Item
          label="Job Title"
          name="jobTitle"
          rules={[{ required: true, message: 'Please input job title!' }]}
        >
          <Input placeholder="Job Title" />
        </Form.Item>
        <Form.Item
          label="Organization"
          name="organization"
          rules={[{ required: true, message: 'Please input organization!' }]}
        >
          <Input placeholder="Organization" />
        </Form.Item>
        <Form.Item
          label="Social Link"
          name="linkSocial"
        >
          <Input placeholder="Social Link (Optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateGuestModal;
