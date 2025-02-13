import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import authService from '../services/authService';

interface CreateSpeakerModalProps {
  visible: boolean;
  onCancel: () => void;
  onCreated: (newSpeaker: any) => void; // Callback khi speaker được tạo thành công
}

const CreateSpeakerModal: React.FC<CreateSpeakerModalProps> = ({ visible, onCancel, onCreated }) => {
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
      const response: any = await authService.createSpeaker(values, accessToken);
      if (response.statusCode === 201 && response.data.speaker) {
        message.success('Speaker created successfully!');
        onCreated(response.data.speaker); // Gọi callback và truyền speaker mới
        handleCancel(); // Đóng modal và reset form
      } else {
        message.error(response.message || 'Failed to create speaker');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to create speaker');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
  };

  return (
    <Modal
      title="Create New Speaker"
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="create-speaker-form"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        requiredMark={false}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input speaker name!' }]}
        >
          <Input placeholder="Speaker Name" />
        </Form.Item>
        <Form.Item
          label="Job Title"
          name="jobTitle"
          rules={[{ required: true, message: 'Please input job title!' }]}
        >
          <Input placeholder="Job Title" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please input Email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          label="Bio"
          name="bio"
          rules={[]}> {/* Make Bio field optional */}
          <Input.TextArea rows={4} placeholder="Bio (Optional)" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateSpeakerModal;
