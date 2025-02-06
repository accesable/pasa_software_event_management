// src\pages\details\EventDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Alert,
    Button,
    Card,
    Col,
    Descriptions,
    Flex,
    Image,
    List,
    message,
    Row,
    Space,
    Table,
    Tag,
    Typography,
    Checkbox,
} from 'antd';
import { HomeOutlined, PieChartOutlined, UserAddOutlined, DownloadOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { PageHeader, Loader } from '../../components';
import { useFetchData } from '../../hooks';
import dayjs from 'dayjs';
import authService from '../../services/authService';
import { Events, TicketType } from '../../types';

import { EventParticipantsTable } from '../dashboards/EventParticipantsTable';
import jsPDF from 'jspdf';
import { Helmet } from 'react-helmet-async';
import { EventScheduleItem } from '../../types/schedule';
import TicketDetailsModal from '../../components/TicketDetailsModal'; // Import the modal component

const { Title, Text, Paragraph } = Typography;

const EventDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [eventDetails, setEventDetails] = useState<Events | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
    const [isParticipatedEvent, setIsParticipatedEvent] = useState(true); // Placeholder, replace with actual check
    const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
    const [ticketData, setTicketData] = useState<any | null>(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await authService.getEventDetails(id, accessToken || undefined) as { statusCode: number; data: { event: Events }; message: string };
                if (response && response.statusCode === 200) {
                    setEventDetails(response.data.event);
                    setIsParticipatedEvent(true); // Placeholder, replace with actual check
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
    }, [id, navigate]);

    const handleRegisterEvent = async () => {
        setLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error("No access token found. Please login again.");
                navigate('/auth/signin');
                return;
            }

            if (!eventDetails?.id) {
                message.error("Event ID is missing.");
                return;
            }

            const response = await authService.registerEvent(eventDetails.id, selectedSessionIds, accessToken) as { statusCode: number; message: string; error?: string };
            if (response && response.statusCode === 201) {
                message.success(response.message);
                setIsParticipatedEvent(true);
            } else {
                message.error(response?.error || 'Failed to register for event');
            }
        } catch (error: any) {
            console.error('Error registering for event:', error);
            message.error(error?.error || 'Failed to register for event');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        message.info("Download PDF function is not implemented yet for general events.");
    };

    const onSessionSelectChange = (selectedKeys: React.Key[]) => {
        setSelectedSessionIds(selectedKeys as string[]);
    };

    const scheduleColumns = [
        {
            title: 'Title',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Start Time',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: 'End Time',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description'
        },
        {
            title: 'Select Session',
            key: 'select',
            render: (_: any, record: EventScheduleItem) => (
                <Checkbox value={record.id} />
            ),
        }
    ];

    const showTicketModal = async () => {
        setIsTicketModalVisible(true);
        setLoading(true);
        setError(null);
        try {
            if (!eventDetails?.id) {
                message.error("Missing user or event information.");
                return;
            }

            // 1. Fetch participantId using eventId -  No userId needed here now
            const participantIdResponse = await authService.getParticipantIdByUserIdEventId(eventDetails.id, localStorage.getItem('accessToken') || undefined) as any; // Removed userId param from function call
            const participantId = participantIdResponse.data.participantId;


            // 2. Fetch ticket using participantId
            const response = await authService.getTicketByParticipantId(participantId, localStorage.getItem('accessToken') || undefined) as { statusCode: number; data: { ticket: TicketType }; message: string };
            if (response && response.statusCode === 200 && response.data.ticket) {
                setTicketData(response.data.ticket);
            } else {
                setError(response?.message || 'Failed to load ticket details');
                message.error(response?.message || 'Failed to load ticket details');
                setTicketData(null);
            }
        } catch (error: any) {
            console.error('Error fetching ticket details:', error);
            setError(error.message || 'Failed to load ticket details');
            message.error(error.message || 'Failed to load ticket details');
            setTicketData(null);
        } finally {
            setLoading(false);
        }
    };

    const hideTicketModal = () => {
        setIsTicketModalVisible(false);
    };

    const handleUpdateSessionsForTicket = async (sessionIds: string[]) => {
        setLoading(true);
        setError(null);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error("No access token found. Please login again.");
                navigate('/auth/signin');
                return;
            }

            // Assuming you have a function in authService to update participant sessions
            const response = await authService.updateParticipantSessions(ticketData?.participantId, { sessionIds }, accessToken) as any; // Replace ticketData?.participantId with actual participant ID source
            if (response && response.statusCode === 200) {
                message.success(response.message || 'Sessions updated successfully');
                // Optionally refresh ticket data or just close the modal
                setIsTicketModalVisible(false);
            } else {
                message.error(response.message || 'Failed to update sessions');
            }
        } catch (error: any) {
            console.error('Error updating sessions:', error);
            message.error(error.message || 'Failed to update sessions');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            {/* ... Helmet, PageHeader ... */}

            <Card title={<Title level={3}>{eventDetails?.name}</Title>} // Use optional chaining here
                extra={
                    <Space>
                        <Button type="primary" icon={<UserAddOutlined />} onClick={handleRegisterEvent} loading={loading} >Register Event</Button>
                        <Button type="primary" onClick={showTicketModal} >
                            View Ticket / Update Sessions
                        </Button>
                    </Space>
                }
            >
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Image src={eventDetails?.banner || "https://placehold.co/1920x1080"} alt="Event Banner" style={{ width: '100%', borderRadius: '10px' }} fallback="https://placehold.co/1920x1080" />
                    </Col>
                    <Col span={24}>
                        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 3 }}>
                            <Descriptions.Item label="Name">{eventDetails?.name}</Descriptions.Item>
                            <Descriptions.Item label="Category">{eventDetails?.categoryId}</Descriptions.Item>
                            <Descriptions.Item label="Location">{eventDetails?.location}</Descriptions.Item>
                            <Descriptions.Item label="Start Date">
                                {dayjs(eventDetails?.startDate).format('YYYY-MM-DD HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label="End Date">
                                {dayjs(eventDetails?.endDate).format('YYYY-MM-DD HH:mm:ss')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Status"><Tag color={eventDetails?.status === 'SCHEDULED' ? 'blue' : eventDetails?.status === 'CANCELED' ? 'red' : 'green'}>{eventDetails?.status}</Tag></Descriptions.Item>
                            <Descriptions.Item label="Max Participants">{eventDetails?.maxParticipants || 'Unlimited'}</Descriptions.Item>
                            <Descriptions.Item span={3} label="Description">
                                {eventDetails?.description || "No description provided."}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                    <Col span={24}>
                        <Card title="Schedule">
                            {eventDetails?.schedule && eventDetails.schedule.length > 0 ? (
                                <Table
                                    rowKey="id"
                                    dataSource={eventDetails?.schedule}
                                    columns={scheduleColumns}
                                    pagination={false}
                                    rowSelection={{
                                        columnWidth: 80,
                                        onChange: onSessionSelectChange,
                                    }}
                                />
                            ) : (
                                <Alert message="No schedule available for this event." type="info" showIcon />
                            )}
                        </Card>
                    </Col>
                    {eventDetails?.videoIntro && (
                        <Col span={24}>
                            <Card title="Video Introduction">
                                <iframe
                                    width="100%"
                                    height="480"
                                    src={eventDetails?.videoIntro}
                                    title="Event Introduction Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                />
                            </Card>
                        </Col>
                    )}
                    {eventDetails?.documents && eventDetails.documents.length > 0 && (
                        <Col span={24}>
                            <Card title="Event Documents">
                                <List
                                    dataSource={eventDetails?.documents}
                                    renderItem={item => (
                                        <List.Item>
                                            <Typography.Link href={item} target="_blank">
                                                {item}
                                            </Typography.Link>
                                        </List.Item>
                                    )}
                                />
                            </Card>
                        </Col>
                    )}
                    {eventDetails?.status === 'FINISHED' && (
                        <Col span={24}>
                            <Card title="Participants Check-in/Check-out List"
                                extra={<Button icon={<DownloadOutlined />} onClick={handleDownloadPdf} loading={loading} disabled={true}>
                                    Download PDF
                                </Button>}
                            >
                                <EventParticipantsTable eventId={id || ''} />
                            </Card>
                        </Col>
                    )}
                </Row>
            </Card>
            <TicketDetailsModal
                visible={isTicketModalVisible}
                onCancel={hideTicketModal}
                ticket={ticketData}
                onSessionsChange={handleUpdateSessionsForTicket}
                eventSchedule={eventDetails?.schedule || []} // Optional chaining here too
            />
        </div>
    );
};

export default EventDetailsPage;