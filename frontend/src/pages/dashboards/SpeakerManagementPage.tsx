// src\pages\dashboards\SpeakerGuestManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Card,
  message,
  Space,
  Table,
  Modal,
  Form,
  Input,
  Alert,
  Flex, // Import Flex
  Typography, // Import Typography
} from 'antd';
import {
  HomeOutlined,
  PieChartOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from '../../components';
import { ColumnsType } from 'antd/es/table';
import { Speaker, Guest, SpeakerGuestData } from '../../types';
import axiosInstance from '../../api/axiosInstance';

const SpeakerGuestManagementPage: React.FC = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeTabKey, setActiveTabKey] = useState<'speakers' | 'guests'>('speakers');
  const [noSpeakersData, setNoSpeakersData] = useState<boolean>(false);
  const [noGuestsData, setNoGuestsData] = useState<boolean>(false);

  const fetchSpeakers = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoSpeakersData(false);
    try {
      const response = await axiosInstance.get('/speakers');
      const speakerData = (response.data as { data: { speakers: Speaker[]; meta: { totalItems: number } } }).data;
      setSpeakers(speakerData.speakers);
      if (speakerData.meta.totalItems === 0) {
        setNoSpeakersData(true);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load speakers');
      message.error(error.message || 'Failed to load speakers');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoGuestsData(false);
    try {
      const response = await axiosInstance.get('/guests');
      const guestData = (response.data as { data: { guests: Guest[]; meta: { totalItems: number } } }).data;
      setGuests(guestData.guests);
      if (guestData.meta.totalItems === 0) {
        setNoGuestsData(true);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load guests');
      message.error(error.message || 'Failed to load guests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpeakers();
    fetchGuests();
  }, [fetchSpeakers, fetchGuests]);

  const handleCreateItem = () => {
    setEditingItemId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditItem = (id: string, entityType: 'speaker' | 'guest') => {
    setEditingItemId(id);
    const itemToEdit = entityType === 'speaker'
      ? speakers.find(speaker => speaker.id === id)
      : guests.find(guest => guest.id === id);

    if (itemToEdit) {
      form.setFieldsValue({ ...itemToEdit, entityType, ...itemToEdit });
      setIsModalOpen(true);
    }
  };

  const handleModalOk = () => {
    form.submit();
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
  };

  const onTabChange = (key: string) => {
    setActiveTabKey(key as 'speakers' | 'guests');
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const isSpeaker = values.entityType === 'speaker';
      const idToEdit = editingItemId;

      if (idToEdit) {
        message.success(`${isSpeaker ? 'Speaker' : 'Guest'} updated successfully`);
      } else {
        message.success(`${isSpeaker ? 'Speaker' : 'Guest'} created successfully`);
      }

      if (isSpeaker) {
        fetchSpeakers();
      } else {
        fetchGuests();
      }
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      setError(error.message || `Failed to save ${values.entityType}`);
      message.error(error.message || `Failed to save  ${values.entityType}`);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
  };

  const speakerColumns: ColumnsType<SpeakerGuestData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Typography.Paragraph ellipsis>{text}</Typography.Paragraph>, // Added ellipsis
    },
    {
      title: 'Job Title',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      responsive: ['md'], // Hide on smaller screens
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'], // Hide on smaller screens
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEditItem(record.id!, 'speaker')}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const guestColumns: ColumnsType<SpeakerGuestData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Typography.Paragraph ellipsis>{text}</Typography.Paragraph>, // Added ellipsis
    },
    {
      title: 'Job Title',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      responsive: ['md'], // Hide on smaller screens
    },
    {
      title: 'Organization',
      dataIndex: 'organization',
      key: 'organization',
      responsive: ['md'], // Hide on smaller screens
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'], // Hide on smaller screens
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEditItem(record.id!, 'guest')}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Speaker & Guest Management | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="Speaker & Guest Management"
        breadcrumbs={[
          {
            title: (
              <>
                <HomeOutlined />
                <span>Home</span>
              </>
            ),
            path: '/',
          },
          {
            title: (
              <>
                <PieChartOutlined />
                <span>Dashboards</span>
              </>
            ),
            menu: {
              items: DASHBOARD_ITEMS.map((d) => ({
                key: d.title,
                title: <Link to={d.path}>{d.title}</Link>,
              })),
            },
          },
          {
            title: 'Speaker & Guest Management',
          },
        ]}
      />

      <Card
        title="Speaker & Guest List"
        extra={
          <Button icon={<PlusOutlined />} type="primary" onClick={handleCreateItem}>
            Create
          </Button>
        }
        tabList={[
          { key: 'speakers', tab: 'Speakers' },
          { key: 'guests', tab: 'Guests' },
        ]}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
      >
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
        {activeTabKey === 'speakers' && noSpeakersData && !loading ? (
          <Alert message="No speakers available." type="info" showIcon />
        ) : activeTabKey === 'guests' && noGuestsData && !loading ? (
          <Alert message="No guests available." type="info" showIcon />
        ) : (
          <div className="table-responsive"> {/* Responsive table wrapper */}
            <Table
              columns={activeTabKey === 'speakers' ? speakerColumns : guestColumns}
              dataSource={activeTabKey === 'speakers'
                ? speakers.map(speaker => ({ ...speaker, entityType: 'speaker' }))
                : guests.map(guest => ({ ...guest, entityType: 'guest' }))}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 'max-content' }} // Horizontal scroll
            />
          </div>
        )}
      </Card>

      <Modal
        title={editingItemId ? `Edit ${form.getFieldValue('entityType') === 'speaker' ? 'Speaker' : 'Guest'}` : "Create New Speaker/Guest"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          name="speaker-guest-form"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          initialValues={{ entityType: 'speaker' }}
          requiredMark={false}
        >
          <Form.Item name="entityType" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input name!' }]}
          >
            <Input placeholder="Name" />
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
          {form.getFieldValue('entityType') === 'guest' && (
            <Form.Item
              label="Organization"
              name="organization"
              rules={[{ required: true, message: 'Please input organization!' }]}
            >
              <Input placeholder="Organization" />
            </Form.Item>
          )}
          {form.getFieldValue('entityType') === 'guest' && (
            <Form.Item
              label="Social Link"
              name="linkSocial"
            >
              <Input placeholder="Social Link" />
            </Form.Item>
          )}
          {form.getFieldValue('entityType') === 'speaker' && (
            <Form.Item
              label="Bio"
              name="bio"
            >
              <Input.TextArea rows={4} placeholder="Bio" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default SpeakerGuestManagementPage;
