// src\pages\dashboards\SpeakerGuestManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Button,
    Card,
    message,
    Popconfirm,
    Space,
    Table,
    Modal,
    Form,
    Input,
    Typography,
    Alert,
    Tabs,
} from 'antd';
import {
    HomeOutlined,
    PieChartOutlined,
    EditOutlined,
    PlusOutlined,
    SaveOutlined,
    DeleteOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader, Loader } from '../../components';
import { ColumnsType } from 'antd/es/table';
import { Speaker, Guest, SpeakerGuestData } from '../../types'; // Import both Speaker and Guest types
import axiosInstance from '../../api/axiosInstance';


const SpeakerGuestManagementPage: React.FC = () => {
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingItemId, setEditingItemId] = useState<string | null>(null); // Could be speakerId or guestId
    const [activeTabKey, setActiveTabKey] = useState<'speakers' | 'guests'>('speakers'); // Tab state


    const fetchSpeakers = useCallback(async () => { // Fetch speakers (same as before)
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/speakers');
            setSpeakers((response.data as { data: { speakers: Speaker[] } }).data.speakers);
        } catch (error: any) {
            setError(error.message || 'Failed to load speakers');
            message.error(error.message || 'Failed to load speakers');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchGuests = useCallback(async () => { // Fetch guests (similar to fetchSpeakers)
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get('/guests');
            setGuests((response.data as { data: { guests: Guest[] } }).data.guests);
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

    const handleCreateItem = () => { // Generic create handler
        setEditingItemId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditItem = (id: string, entityType: 'speaker' | 'guest') => { // Generic edit handler
        setEditingItemId(id);
        const itemToEdit = entityType === 'speaker'
            ? speakers.find(speaker => speaker.id === id)
            : guests.find(guest => guest.id === id);

        if (itemToEdit) {
            form.setFieldsValue({ ...itemToEdit, entityType }); // Include entityType in form values
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
            let response;
            const isSpeaker = values.entityType === 'speaker';
            const endpoint = isSpeaker ? '/speakers' : '/guests';
            const idToEdit = editingItemId;

            if (idToEdit) {
                response = await axiosInstance.patch(`${endpoint}/${idToEdit}`, values); // Generic update endpoint
                message.success(`${isSpeaker ? 'Speaker' : 'Guest'} updated successfully`);
            } else {
                response = await axiosInstance.post(endpoint, values); // Generic create endpoint
                message.success(`${isSpeaker ? 'Speaker' : 'Guest'} created successfully`);
            }

            if (isSpeaker) {
                fetchSpeakers(); // Refresh speaker or guest list based on tab
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
        console.log('Failed:', errorInfo);
    };


    const speakerColumns: ColumnsType<SpeakerGuestData> = [ // Columns for Speakers
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Job Title',
            dataIndex: 'jobTitle',
            key: 'jobTitle',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
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

    const guestColumns: ColumnsType<SpeakerGuestData> = [ // Columns for Guests
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Job Title',
            dataIndex: 'jobTitle',
            key: 'jobTitle',
        },
        {
            title: 'Organization',
            dataIndex: 'organization',
            key: 'organization',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
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
                tabList={[ // Tabs for Speakers and Guests
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
                <Table
                    columns={activeTabKey === 'speakers' ? speakerColumns : guestColumns} // Conditional columns
                    dataSource={activeTabKey === 'speakers'
                        ? speakers.map(speaker => ({ ...speaker, entityType: 'speaker' })) // Add entityType to dataSource
                        : guests.map(guest => ({ ...guest, entityType: 'guest' }))}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            <Modal
                title={editingItemId ? `Edit ${form.getFieldValue('entityType') === 'speaker' ? 'Speaker' : 'Guest'}` : "Create New Speaker/Guest"} // Dynamic modal title
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
                    initialValues={{ entityType: 'speaker' }} // Default entity type to speaker
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