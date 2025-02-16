// src/pages/dashboards/SpeakerGuestManagementPage.tsx
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  // Tab keys vẫn dùng dạng số nhiều để hiển thị giao diện, nhưng form sẽ nhận dạng bằng dạng số ít.
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
    // Đảm bảo entityType được set theo tab hiện tại (sử dụng dạng số ít)
    form.setFieldsValue({ entityType: activeTabKey === 'speakers' ? 'speaker' : 'guest' });
    setIsModalOpen(true);
  };

  const handleEditItem = (id: string, entityType: 'speaker' | 'guest') => {
    setEditingItemId(id);
    const itemToEdit = entityType === 'speaker'
      ? speakers.find(speaker => speaker.id === id)
      : guests.find(guest => guest.id === id);

    if (itemToEdit) {
      // Set entityType theo dạng số ít
      form.setFieldsValue({ ...itemToEdit, entityType });
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
    // Khi chuyển tab, cập nhật entityType trong form theo dạng số ít
    form.setFieldsValue({ entityType: key === 'speakers' ? 'speaker' : 'guest' });
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      // Sử dụng dạng số ít để kiểm tra loại entity
      const isSpeaker = values.entityType === 'speaker';
      const endpoint = isSpeaker ? '/speakers' : '/guests';
      const idToEdit = editingItemId;

      // Tạo payload theo đúng format backend yêu cầu
      const payload = isSpeaker
        ? {
            name: values.name,
            jobTitle: values.jobTitle,
            email: values.email,
            bio: values.bio,
          }
        : {
            name: values.name,
            jobTitle: values.jobTitle,
            organization: values.organization,
            linkSocial: values.linkSocial,
          };

      if (idToEdit) {
        response = await axiosInstance.patch(`${endpoint}/${idToEdit}`, payload);
        message.success(`${isSpeaker ? 'Speaker' : 'Guest'} updated successfully`);
      } else {
        response = await axiosInstance.post(endpoint, payload);
        message.success(`${isSpeaker ? 'Speaker' : 'Guest'} created successfully`);
      }

      if (response.status === 201 || response.status === 200) {
        if (isSpeaker) {
          fetchSpeakers();
        } else {
          fetchGuests();
        }
        setIsModalOpen(false);
        form.resetFields();
        setEditingItemId(null);
      } else {
        const respData = response.data as any;
        if (respData.message && Array.isArray(respData.message)) {
          respData.message.forEach((msg: string) => message.error(msg));
        } else {
          message.error(
            respData.error ||
              respData.message ||
              `Failed to ${idToEdit ? 'update' : 'create'} ${isSpeaker ? 'speaker' : 'guest'}`
          );
        }
      }
    } catch (error: any) {
      message.error(error.message || `Failed to ${editingItemId ? 'update' : 'create'} ${values.entityType}`);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const speakerColumns: ColumnsType<SpeakerGuestData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Job Title',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      responsive: ['md'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
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
    },
    {
      title: 'Job Title',
      dataIndex: 'jobTitle',
      key: 'jobTitle',
      responsive: ['md'],
    },
    {
      title: 'Organization',
      dataIndex: 'organization',
      key: 'organization',
      responsive: ['md'],
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
          <div className="table-responsive">
            <Table
              columns={activeTabKey === 'speakers' ? speakerColumns : guestColumns}
              dataSource={
                activeTabKey === 'speakers'
                  ? speakers.map(speaker => ({ ...speaker, entityType: 'speaker' }))
                  : guests.map(guest => ({ ...guest, entityType: 'guest' }))
              }
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 'scroll' }}
            />
          </div>
        )}
      </Card>

      <Modal
        title={
          editingItemId
            ? `Edit ${form.getFieldValue('entityType') === 'speaker' ? 'Speaker' : 'Guest'}`
            : `Create New ${activeTabKey === 'speakers' ? 'Speaker' : 'Guest'}`
        }
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
          // Thiết lập initialValues entityType theo dạng số ít dựa vào tab hiện tại
          initialValues={{ entityType: activeTabKey === 'speakers' ? 'speaker' : 'guest' }}
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
          {form.getFieldValue('entityType') === 'speaker' && (
            <>
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
              >
                <Input.TextArea rows={4} placeholder="Bio" />
              </Form.Item>
            </>
          )}
          {form.getFieldValue('entityType') === 'guest' && (
            <>
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
                <Input placeholder="Social Link" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default SpeakerGuestManagementPage;
