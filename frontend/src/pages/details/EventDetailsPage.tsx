// src\pages\details\EventDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  List,
  message,
  Rate,
  Row,
  Spin,
  Table,
  Typography,
} from 'antd';
import { HomeOutlined, PieChartOutlined, UserAddOutlined, DownloadOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { PageHeader, Loader, BackBtn } from '../../components';
import dayjs from 'dayjs';
import authService from '../../services/authService';
import { Events } from '../../types';
import { EventParticipantsTable } from '../dashboards/EventParticipantsTable';
import { Helmet } from 'react-helmet-async';
import EventDiscussion from '../../components/EventDiscussion';
import jsPDF from 'jspdf';
import { EventScheduleItem } from '../../types/schedule';

const { Text } = Typography;

export const EventDetailsPage: React.FC = () => {
  // Lấy eventId từ outlet context (hoặc từ useParams nếu cần)
  const { id } = useParams<{ id: string }>();
  const { eventId } = useOutletContext<{ eventId: string }>();
  // Lấy token từ query string (nếu có)
  const [searchParams] = useSearchParams();

  const [eventDetails, setEventDetails] = useState<Events | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<{
    averageRating: number;
    totalFeedbacks: number;
    ratingDistribution: Record<string, number>;
  } | null>(null);
  const [feedbackSummaryLoading, setFeedbackSummaryLoading] = useState(false);

  // State để đảm bảo API accept được gọi 1 lần duy nhất
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleSessionCheckboxChange = (checked: boolean, sessionId: string) => {
    if (checked) {
      setSelectedSessionIds([...selectedSessionIds, sessionId]);
    } else {
      setSelectedSessionIds(selectedSessionIds.filter(id => id !== sessionId));
    }
  };

  // Fetch chi tiết sự kiện (sử dụng eventId từ outlet context)
  useEffect(() => {
    console.log("EventDetailsPage useEffect is running, eventId:", eventId);
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventDetails(eventId, accessToken || undefined) as { statusCode: number; data: { event: Events }; message: string; error?: string };
        if (response && response.statusCode === 200) {
          setEventDetails(response.data.event);
        } else {
          setError(response?.message || 'Failed to load event details');
          message.error(response?.error);
        }
      } catch (error: any) {
        console.error('Error fetching event details:', error);
        setError(error.message || 'Failed to load event details');
        message.error(error.error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEventFeedbackSummary = async () => {
      if (!eventId) return;
      setFeedbackSummaryLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventFeedbackSummary(eventId, accessToken || undefined) as any;
        if (response.statusCode === 200 && response.data) {
          setFeedbackSummary(response.data.data);
        } else {
          console.error('Failed to fetch feedback summary:', response.message);
        }
      } catch (error: any) {
        console.error('Error fetching feedback summary:', error);
      } finally {
        setFeedbackSummaryLoading(false);
      }
    };

    fetchEventDetails();
    fetchEventFeedbackSummary();
  }, [eventId, navigate]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token && eventDetails && !hasAccepted) {
      const acceptEvent = async () => {
        try {
          const response = await authService.acceptEvent(eventDetails.id, token) as { statusCode: number; message: string; error?: string };
          if (response && response.statusCode === 200) {
            message.success(response.message || 'You have successfully accepted the invitation.');
            setHasAccepted(true);
          } else {
            message.error(response.error || 'Failed to accept invitation.');
          }
        } catch (error: any) {
          console.error('Error accepting event:', error);
          message.error(error.message || 'Failed to accept invitation.');
        }
      };
      acceptEvent();
    }
  }, [searchParams, eventDetails, hasAccepted]);

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
      } else {
        message.error(response?.error || 'Failed to register for event');
      }
    } catch (error: any) {
      message.error(error.error || 'Failed to register for event');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdfFunction = (setLoading: React.Dispatch<React.SetStateAction<boolean>>, message: any, authService: any, dayjs: any, eventId: string | undefined) => async () => {
    try {
      setLoading(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error("No access token found. Please login again.");
        return;
      }
      // Gọi API lấy danh sách participant
      const response = await authService.getEventParticipants(eventId, accessToken) as any;
      const participants = response.data || [];
      if (!participants || participants.length === 0) {
        message.error("No participants data available.");
        return;
      }

      // Khởi tạo jsPDF
      const doc = new jsPDF();
      // Tiêu đề của PDF
      doc.setFontSize(16);
      doc.text("Participants Check-in/Check-out List", 14, 20);

      // Định nghĩa cột và dữ liệu của bảng
      const columns = ["No", "Name", "Email", "Check-In", "Check-Out"];
      const rows = participants.map((p: any, index: number) => [
        index + 1,
        p.name,
        p.email,
        p.checkInAt ? dayjs(p.checkInAt).format("YYYY-MM-DD HH:mm:ss") : "",
        p.checkOutAt ? dayjs(p.checkOutAt).format("YYYY-MM-DD HH:mm:ss") : ""
      ]);

      // Dùng autoTable để tạo bảng
      (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 30,
        theme: 'grid'
      });

      // Lưu file PDF
      doc.save("participants.pdf");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      message.error("List check-in/check-out is empty.");
    } finally {
      setLoading(false);
    }
  };

  const onSessionSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedSessionIds(selectedKeys as string[]);
  };

  const handleDownloadPdf = handleDownloadPdfFunction(setLoading, message, authService, dayjs, eventId);

  const renderScheduleTable = (eventDetails: Events | null, scheduleColumns: any) => {
    return eventDetails?.schedule && eventDetails.schedule.length > 0 ? (
      <Table
        rowKey="id"
        dataSource={eventDetails.schedule}
        columns={scheduleColumns}
        pagination={false}
        scroll={{ x: 'max-content'}} 
        rowSelection={{
          onChange: (selectedRowKeys, selectedRows) => {
            onSessionSelectChange(selectedRowKeys as string[]);
          },
        }}
        size="small"
      />
    ) : (
      <Alert message="No schedule available for this event." type="info" showIcon />
    );
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
        btnBack={<BackBtn />}
      />
      <BackBtn />

      <Card
        title={<Typography.Title level={3}>{eventDetails.name}</Typography.Title>}
        extra={
          <Flex
            wrap="wrap"
            align="center"
            justify="flex-end"
            gap="small"
          >
            {
              eventDetails?.status === 'SCHEDULED' && (
                <Button type="primary" icon={<UserAddOutlined />} onClick={handleRegisterEvent} loading={loading}>
                  Register
                </Button>
              )
            }
          </Flex>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {eventDetails.videoIntro ? (
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
            ) : eventDetails.banner ? (
              <Card title="Event Banner">
                <img
                  src={eventDetails.banner}
                  alt="Event Banner"
                  style={{ width: "100%", height: "480px", objectFit: "cover" }}
                />
              </Card>
            ) : (
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
          <Col xs={24} sm={24} md={24} lg={24}>
            <Card title="Schedule">
              {renderScheduleTable(eventDetails, scheduleColumns)}
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
          {eventDetails?.status === 'FINISHED' && (
            <Col span={24} >
              <Card title="Feedback Summary">
                {feedbackSummaryLoading ? (
                  <Spin tip="Loading feedback summary..." />
                ) : feedbackSummary ? (
                  <Flex vertical gap="middle">
                    <Flex align="center" gap="middle">
                      <Rate allowHalf value={feedbackSummary.averageRating} disabled />
                      <Typography.Text>
                        {feedbackSummary.averageRating.toFixed(1)}/5 ({feedbackSummary.totalFeedbacks} reviews)
                      </Typography.Text>
                    </Flex>
                    <Flex vertical gap="small">
                      {/* Hiển thị rating distribution */}
                      <Flex justify="space-between">
                        <Text>5 stars:</Text>
                        <Text>{feedbackSummary.ratingDistribution["5"] || 0} feedbacks</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>4 stars:</Text>
                        <Text>{feedbackSummary.ratingDistribution["4"] || 0} feedbacks</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>3 stars:</Text>
                        <Text>{feedbackSummary.ratingDistribution["3"] || 0} feedbacks</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>2 stars:</Text>
                        <Text>{feedbackSummary.ratingDistribution["2"] || 0} feedbacks</Text>

                      </Flex>
                      <Flex justify="space-between">
                        <Text>1 star:</Text>
                        <Text>{feedbackSummary.ratingDistribution["1"] || 0} feedbacks</Text>
                      </Flex>
                    </Flex>
                    <Button type="primary" size="small" >
                      <Link to={`/feedbacks/events/${eventId}`}>View All Feedbacks</Link>
                    </Button>
                  </Flex>
                ) : (
                  <Alert message="No feedback summary available for this event yet." type="info" showIcon />
                )}

              </Card>
            </Col>
          )}
          {eventDetails?.status === 'FINISHED' && (
            <Col span={24}>
              <Card title="Participants Check-in/Check-out List"
                extra={<Button icon={<DownloadOutlined />} onClick={handleDownloadPdf} loading={loading}>
                  Download PDF
                </Button>}
              >
                <EventParticipantsTable eventId={eventId || ''} />
              </Card>
            </Col>
          )}
          <Col span={24}>
            <EventDiscussion
              eventId={id || ''}
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
