// src\pages\edit\EditEventPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Alert,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Typography,
    message,
} from 'antd';
import { HomeOutlined, PieChartOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { PageHeader, Loader } from '../../components';
import { Events } from '../../types';
import authService from '../../services/authService';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet-async';

const EditEventPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [eventDetails, setEventDetails] = useState<Events | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await authService.getEventDetails(id, accessToken || undefined) as { statusCode: number; data: { event: Events }; message: string };
                if (response.statusCode === 200 && response.data.event) {
                    setEventDetails(response.data.event);
                    form.setFieldsValue({
                        name: response.data.event.name,
                        description: response.data.event.description,
                        startDate: dayjs(response.data.event.startDate),
                        endDate: dayjs(response.data.event.endDate),
                        location: response.data.event.location,
                        categoryId: response.data.event.categoryId,
                        maxParticipants: response.data.event.maxParticipants,
                        banner: response.data.event.banner,
                        videoIntro: response.data.event.videoIntro,
                        status: response.data.event.status, // Pre-fill status field
                    });
                } else {
                    setError(response?.message || 'Failed to load event details');
                    message.error(response?.message || 'Failed to load event details');
                }
            } catch (error: any) {
                console.error('Error fetching event details:', error);
                setError(error.message || 'Failed to load event details');
                message.error(error.message || 'Failed to load event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id, form, navigate]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error("No access token found. Please login again.");
                navigate('/auth/signin');
                return;
            }

            const eventData = { ...values, startDate: values.startDate.toISOString(), endDate: values.endDate.toISOString() };
            const response = await authService.updateEvent(id!, eventData, accessToken) as { statusCode: number; message: string };
            if (response.statusCode === 200) {
                message.success(response.message);
                setTimeout(() => {
                    navigate('/dashboards/my-events');
                }, 1000);
            } else {
                message.error(response.message || 'Failed to update event');
            }
        } catch (error: any) {
            console.error('Error updating event:', error);
            message.error(error.message || 'Failed to update event');
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    if (loading && !eventDetails) {
        return <Loader />;
    }

    if (error) {
        return <Alert message="Error" description={error} type="error" showIcon />;
    }


    return (
        <div>
            <Helmet>
                <title>Edit Event | Antd Dashboard</title>
            </Helmet>
            <PageHeader
                title="Edit Event"
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
                        title: 'Edit Event',
                    },
                ]}
            />

            <Card title={`Edit Event: ${eventDetails?.name}`} extra={<Button onClick={() => navigate(-1)} icon={<ArrowLeftOutlined />}>Cancel</Button>}>
                <Form
                    form={form}
                    name="edit-event-form"
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    requiredMark={false}
                >
                    <Row gutter={[16, 0]}>
                        <Col sm={24} lg={24}>
                            <Form.Item<any>
                                label="Event's Name"
                                name="name"
                                rules={[{ required: true, message: 'Please input your event name!' }]}
                            >
                                <Input placeholder='Tech Conference 2026' />
                            </Form.Item>
                        </Col>
                        <Col sm={24} lg={24}>
                            <Form.Item<any>
                                label="Event's Description"
                                name="description"
                                rules={[{ required: false }]}
                            >
                                <Input.TextArea rows={3} placeholder='A major event about technology and innovation (optional)' />
                            </Form.Item>
                        </Col>
                        <Col sm={24} lg={8}>
                            <Form.Item<any>
                                label="Event's Capacity"
                                name="maxParticipants"
                                rules={[{ required: false, message: 'Please input event capacity!' }]}
                            >
                                <InputNumber style={{ width: "100%" }} min={0} placeholder="Unlimited if empty" />
                            </Form.Item>
                        </Col>
                        <Col sm={24} lg={8}>
                            <Form.Item<any>
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
                            <Form.Item<any>
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
                            <Form.Item<any>
                                label="Location"
                                name="location"
                                rules={[{ required: true, message: 'Please input event location!' }]}
                            >
                                <Input placeholder="Hall A, University Campus" />
                            </Form.Item>
                        </Col>
                        <Col sm={24} lg={12}>
                            <Form.Item<any>
                                label="Event Type"
                                name="categoryId"
                                rules={[
                                    { required: true, message: 'Please input your event type!' },
                                ]}
                            >
                                <Select
                                    options={[
                                        { value: '678a2141f8a1c0593de58562', label: 'IT' }, // Replace with actual categories from API later
                                        { value: '676b9128c0ea46752f9a5c89', label: 'Technology' },
                                    ]}
                                    placeholder="Select Event Type"
                                />
                            </Form.Item>
                        </Col>
                        <Col sm={24} lg={12}>
                            <Form.Item<any>
                                label="Banner URL (Optional)"
                                name="banner"
                                rules={[{ required: false }]}
                            >
                                <Input placeholder="https://example.com/banner.jpg" />
                            </Form.Item>
                        </Col>
                        <Col sm={24} lg={12}>
                            <Form.Item<any>
                                label="Video Intro URL (Optional)"
                                name="videoIntro"
                                rules={[{ required: false }]}
                            >
                                <Input placeholder="https://example.com/video.mp4" />
                            </Form.Item>
                        </Col>
                        <Col span={24} lg={12}>
                            <Form.Item<any>
                                label="Status"
                                name="status"
                                rules={[{ required: true, message: 'Please select event status!' }]}
                            >
                                <Select
                                    options={[
                                        { value: 'SCHEDULED', label: 'Scheduled' },
                                        { value: 'CANCELED', label: 'Canceled' },
                                        { value: 'FINISHED', label: 'Finished' },
                                    ]}
                                    placeholder="Select Event Status"
                                />
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
        </div>
    );
};

export default EditEventPage;