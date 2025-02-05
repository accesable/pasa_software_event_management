// src\pages\create\Events.tsx
import { Button, Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select, Typography, Checkbox, Alert } from 'antd';
import { Card, Loader } from '../../components';
import { SaveOutlined } from '@ant-design/icons';
import { Events } from '../../types';
import { useState, useEffect } from 'react';
import { useFetchData } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from '../../constants';
import authService from '../../services/authService'; // Import authService
import dayjs from 'dayjs';

type FieldType = {
    name: string;
    description?: string;
    startDate: any; // Date type from DatePicker is 'dayjs'
    endDate: any;   // Date type from DatePicker is 'dayjs'
    location: string;
    categoryId: string;
    maxParticipants?: number;
    isFree?: boolean;
    price?: number;
    banner?: string;
    videoIntro?: string;
};

export const CreateEventPage = () => {
    const { data: users } = useFetchData('../mocks/Users.json');

    const [loading, setLoading] = useState(false);
    // Modal State for create event type
    const [isCreateTypeModalOpen, setIsCreateTypeModalOpen] = useState<any>(false);
    const [types, setTypes] = useState<any>([]); // Initialize types as empty array
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);


    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEventCategories = async () => {
            setCategoriesLoading(true);
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    message.error("No access token found. Please login again.");
                    navigate(PATH_DASHBOARD.default);
                    return;
                }
                const response = await authService.getCategories(accessToken) as { statusCode: number; data: { categories: any[] } };
                if (response.statusCode === 200 && response.data.categories) {
                    setTypes(response.data.categories.map((category: any) => ({
                        value: category.id,
                        label: category.name,
                    })));
                } else {
                    setCategoriesError("Failed to load event categories.");
                    message.error("Failed to load event categories.");
                }
            } catch (error: any) {
                console.error("Failed to load event categories:", error);
                setCategoriesError("Failed to load event categories.");
                message.error("Failed to load event categories.");
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchEventCategories();
    }, [navigate]);


    const showCreateTypeModal = () => {
        setIsCreateTypeModalOpen(true);
    };

    const handleOkCreateType = () => {
        setIsCreateTypeModalOpen(false);
        form.submit()
    };

    const handleCancelCreateType = () => {
        setIsCreateTypeModalOpen(false);
    };


    const onFinish = async (values: FieldType) => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error("No access token found. Please login again.");
                navigate(PATH_DASHBOARD.default);
                return;
            }

            const eventData = {
                name: values.name,
                description: values.description,
                startDate: values.startDate.toISOString(), // Convert to ISO string
                endDate: values.endDate.toISOString(),     // Convert to ISO string
                location: values.location,
                categoryId: values.categoryId,
                maxParticipants: values.maxParticipants,
                isFree: values.isFree || false, // Default to false if not checked
                price: values.price,
                banner: values.banner,
                videoIntro: values.videoIntro,
                schedule: [], // Empty schedule for now
                guestIds: [],   // Empty guestIds for now
            };


            const response = await authService.createEvent(eventData, accessToken) as { statusCode: number; message: string };
            if (response && response.statusCode === 201) {
                message.success(response.message);
                setTimeout(() => {
                    navigate(PATH_DASHBOARD.my_events);
                }, 1000);
            } else {
                if (response && 'message' in response) {
                    message.error(response.message);
                } else {
                    message.error('Failed to create event');
                }
            }
        } catch (error: any) {
            console.error('Error creating event:', error);
            message.error(error.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    // Modal State for create user
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState<any>(false);

    const showCreateUserModal = () => {
        setIsCreateUserModalOpen(true);
    };

    const handleOkCreateUser = () => {
        setIsCreateUserModalOpen(false);
    };

    const handleCancelCreateUser = () => {
        setIsCreateUserModalOpen(false);
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onFinishType = async (values: any) => {
        setCategoriesLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error("No access token found. Please login again.");
                navigate(PATH_DASHBOARD.default);
                return;
            }
            const response = await authService.createCategory({ name: values.event_type, description: "" }, accessToken) as { statusCode: number; message: string; data: { category: { id: string; name: string } } };
            if (response && response.statusCode === 201) {
                message.success(response.message);
                // Update types with the new category
                setTypes([...types, { value: response.data.category.id, label: response.data.category.name }]);
                form.setFieldsValue({ categoryId: response.data.category.id }); // Optionally select the new category
                setIsCreateTypeModalOpen(false);
            } else {
                message.error(response?.message || 'Failed to create event type');
            }
        } catch (error: any) {
            console.error('Error creating event type:', error);
            message.error(error.message || 'Failed to create event type');
        } finally {
            setCategoriesLoading(false);
        }
    };

    return (
        <Card title="Create New Event">
             {categoriesError && (
                <Alert
                    message="Error"
                    description={categoriesError}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setCategoriesError(null)}
                    style={{ marginBottom: 10 }}
                />
            )}
            <Modal title="Create Event Type" open={isCreateTypeModalOpen} onOk={handleOkCreateType} onCancel={handleCancelCreateType}>
                <Form layout='vertical'
                    onFinish={onFinishType}
                    form={form}
                >
                    <Form.Item label="Event Type" name="event_type" rules={[{ required: true, message: 'Please input event type!' }]}>
                        <Input placeholder="Enter Event Type" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={categoriesLoading}>
                            Create Type
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title="Create Event User" open={isCreateUserModalOpen} onOk={handleOkCreateUser} onCancel={handleCancelCreateUser}>
                <Form layout='vertical'>
                    <Form.Item label="User's Email">
                        <Input placeholder="example@email.com" />
                    </Form.Item>
                    <Form.Item label="User's Full Name">
                        <Input placeholder="John Doe" />
                    </Form.Item>
                    <Form.Item label="User's Title">
                        <Input placeholder="Software Engineer" />
                    </Form.Item>
                </Form>
            </Modal>
            <Form
                name="create-event-form"
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                autoComplete="on"
                requiredMark={false}
            >
                <Row gutter={[16, 0]}>
                    <Col sm={24} lg={24}>
                        <Form.Item<FieldType>
                            label="Event's Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input your event name!' }]}
                        >
                            <Input
                                placeholder='Tech Conference 2026'
                            />
                        </Form.Item>
                    </Col>
                    <Col sm={24} lg={24}>
                        <Form.Item<FieldType>
                            label="Event's Description"
                            name="description"
                            rules={[{ required: false }]}
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder='A major event about technology and innovation (optional)'
                            />
                        </Form.Item>
                    </Col>
                    <Col sm={24} lg={8}>
                        <Form.Item<FieldType>
                            label="Event's Capacity"
                            name="maxParticipants"
                            rules={[{ required: false, message: 'Please input event capacity!' }]}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} placeholder="Unlimited if empty" />
                        </Form.Item>
                    </Col>
                    <Col sm={24} lg={8}>
                        <Form.Item<FieldType>
                            label="Start At"
                            name="startDate"
                            rules={[
                                { required: true, message: 'Please input your start of event' },
                            ]}
                        >
                            <DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm:ss" />
                        </Form.Item>
                    </Col>
                    <Col sm={24} lg={8}>
                        <Form.Item<FieldType>
                            label="End At"
                            name="endDate"
                            rules={[
                                { required: true, message: 'Please input your end of event' },
                            ]}
                        >
                            <DatePicker style={{ width: "100%" }} showTime format="YYYY-MM-DD HH:mm:ss" />
                        </Form.Item>
                    </Col>
                    <Col sm={24} lg={12}>
                        <Form.Item<FieldType>
                            label="Location"
                            name="location"
                            rules={[{ required: true, message: 'Please input event location!' }]}
                        >
                            <Input placeholder="Hall A, University Campus" />
                        </Form.Item>
                    </Col>
                    <Col sm={24} lg={12}>
                        <Form.Item<FieldType>
                            label="Event Type"
                            name="categoryId" // Using categoryId to match API request
                            rules={[
                                { required: true, message: 'Please input your event type!' },
                            ]}
                        >
                            <Select
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Button type="text" style={{ width: "100%" }} onClick={showCreateTypeModal} loading={categoriesLoading} >
                                            Create New Type
                                        </Button>
                                    </>
                                )}
                                options={types} // Use fetched categories here
                                placeholder="Select Event Type"
                                loading={categoriesLoading}
                            />
                        </Form.Item>
                    </Col>
                    <Col sm={24} lg={12}>
                        <Form.Item<FieldType>
                            label="Banner URL (Optional)"
                            name="banner"
                            rules={[{ required: false }]}
                        >
                            <Input placeholder="https://example.com/banner.jpg" />
                        </Form.Item>
                    </Col>
                    <Col sm={24} lg={12}>
                        <Form.Item<FieldType>
                            label="Video Intro URL (Optional)"
                            name="videoIntro"
                            rules={[{ required: false }]}
                        >
                            <Input placeholder="https://example.com/video.mp4" />
                        </Form.Item>
                    </Col>
                    

                </Row>

                <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} disabled={categoriesLoading}>
                        Create Event
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};