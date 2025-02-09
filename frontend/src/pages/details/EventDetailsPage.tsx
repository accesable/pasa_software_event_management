// src\pages\details\EventDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
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
import { Events } from '../../types';

import { EventParticipantsTable } from '../dashboards/EventParticipantsTable';
import jsPDF from 'jspdf';
import { Helmet } from 'react-helmet-async';
import { EventScheduleItem } from '../../types/schedule';
import EventDiscussion from '../../components/EventDiscussion';

const { Title, Text, Paragraph } = Typography;

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [eventDetails, setEventDetails] = useState<Events | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const { eventId } = useOutletContext<{ eventId: string }>();

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventDetails(eventId, accessToken || undefined) as { statusCode: number; data: { event: Events }; message: string }; // Sử dụng eventId lấy từ context
        if (response && response.statusCode === 200) {
          setEventDetails(response.data.event);
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
  }, [eventId, navigate]);

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
        // Optionally redirect or update UI after successful registration
      } else {
        message.error(response?.error || 'Failed to register for event');
      }
    } catch (error: any) {
      message.error(error.error || 'Failed to register for event');
    } finally {
      setLoading(false);
    }
  };

  const onSessionSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedSessionIds(selectedKeys as string[]);
  };

  const scheduleColumns = [
    {
      title: 'Title',
      dataIndex: 'title', 
      key: 'title'
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
    // {
    //   title: 'Select Session',
    //   key: 'select',
    //   render: (_: any, record: EventScheduleItem) => (
    //     <Checkbox value={record.id} />
    //   ),
    // }
  ];


  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  if (!eventDetails) {
    return <Alert message="Event not found" description="Could not load event details" type="warning" showIcon />;
  }


  return (
    <div>
      <Helmet>
        <title>{eventDetails.name} | Event Details</title>
      </Helmet>
      <PageHeader
        title="Event Details"
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
            title: 'Event Details',
          },
        ]}
      />

      <Card title={<Title level={3}>{eventDetails?.name}</Title>}
        extra={<Button type="primary" icon={<UserAddOutlined />} onClick={handleRegisterEvent} loading={loading}>Register Event</Button>}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {eventDetails?.videoIntro ? (
              // Nếu có video, hiển thị video
              <Card title="Video Introduction">
                <iframe
                  width="100%"
                  height="480"
                  src={eventDetails.videoIntro}
                  title="Event Introduction Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </Card>
            ) : eventDetails?.banner ? (
              // Nếu không có video mà có banner, hiển thị banner dưới dạng hình ảnh
              <Card title="Event Banner">
                <img
                  src={eventDetails.banner}
                  alt="Event Banner"
                  style={{ width: "100%", height: "480px", objectFit: "cover" }}
                />
              </Card>
            ) : (
              // Nếu không có cả video lẫn banner, hiển thị link mặc định mà bạn để sẵn
              <Card title="Event Introduction">
                <iframe
                  width="100%"
                  height="480"
                  src="https://www.youtube.com/embed/iTJJC2Hlmu0"
                  title="Event Introduction Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </Card>
            )}
          </Col>
          <Col span={24}>
            <Card title="Schedule">
              {eventDetails.schedule && eventDetails.schedule.length > 0 ? (
                <Table
                  rowKey="id"
                  dataSource={eventDetails.schedule}
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
          {eventDetails.documents && eventDetails.documents.length > 0 && (
            <Col span={24}>
              <Card title="Event Documents">
                <List
                  dataSource={eventDetails.documents}
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
          {/* {eventDetails?.status === 'FINISHED' && (
            <Col span={24}>
              <Card title="Participants Check-in/Check-out List"
                extra={<Button icon={<DownloadOutlined />} onClick={handleDownloadPdf} loading={loading} disabled={true}>
                  Download PDF
                </Button>}
              >
                <EventParticipantsTable eventId={id || ''} />
              </Card>
            </Col>
          )} */}
          <Col span={24}>
            <EventDiscussion
              eventId={eventId}
              questions={questions}
              setQuestions={setQuestions}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EventDetailsPage;
