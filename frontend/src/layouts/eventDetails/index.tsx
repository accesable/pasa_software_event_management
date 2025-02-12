// src/layouts/eventDetails/index.tsx
import React, { useEffect, useState } from 'react';
import { AppLayout } from '../index';
import {
  Col,
  Row,
  message,
  Spin,
  Typography,
  Card,
  Tag,
  Form,
  Rate,
  Input,
  Alert,
  Button,
} from 'antd';
import { useLocation, useParams, Outlet } from 'react-router-dom';
import { CiLocationOn, CiUser, CiCalendar } from 'react-icons/ci';
import { HomeOutlined, PieChartOutlined, IdcardOutlined, SendOutlined } from '@ant-design/icons';
import { PageHeader, BackBtn } from '../../components';
import { useStylesContext } from '../../context';
import authService from '../../services/authService';
import dayjs from 'dayjs';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import TicketDetailsModal from '../../components/TicketDetailsModal';

const { Title, Text } = Typography;

export const EventDetailLayout: React.FC = () => {
  const { pathname } = useLocation();
  const { id: eventId } = useParams<{ id: string }>();
  const stylesContext = useStylesContext();
  const user = useSelector((state: RootState) => state.user);

  const [eventDetail, setEventDetail] = useState<any>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState<number | undefined>(undefined);
  const [commentValue, setCommentValue] = useState<string>('');
  const [form] = Form.useForm();
  const [ticketData, setTicketData] = useState<any>(null);
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [isParticipant, setIsParticipant] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      setLoadingEvent(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventDetails(eventId) as {
          statusCode: number;
          data: { event: any };
          message?: string;
        };
        if (response.statusCode === 200 && response.data) {
          setEventDetail(response.data.event);
          if(eventDetail?.status === 'FINISHED') {
            const checkParticipant = await authService.getParticipantData(eventId, accessToken || '') as any;
            if(checkParticipant.statusCode === 200) {
              setIsParticipant(true);
            } else {
              setIsParticipant(false);
            }
          }
        } else {
          message.error(response.message || 'Failed to load event details');
        }
      } catch (error: any) {
        message.error(error.message || 'Error fetching event details');
      } finally {
        setLoadingEvent(false);
      }
    };

    const fetchUserFeedback = async () => {
      if (!eventId) return;
      setFeedbackLoading(true);
      setFeedbackError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventFeedbackByUser(eventId, accessToken || undefined) as any;
        if (response.statusCode === 200 && response.data.feedback) {
          setFeedback(response.data.feedback);
          setRatingValue(response.data.feedback.rating);
          setCommentValue(response.data.feedback.comment);
          form.setFieldsValue({
            rating: response.data.feedback.rating,
            comment: response.data.feedback.comment,
          });
        } else if (response.statusCode === 400 && response.data?.error === "Feedback not found") {
          setFeedback(null);
          form.resetFields();
          setRatingValue(undefined);
          setCommentValue('');
        } else {
        }
      } catch (error: any) {
      } finally {
        setFeedbackLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetail();
      fetchUserFeedback();
    }
  }, [eventId, form]);

  const handleDownloadPdf = async () => {
    try {
      setLoadingEvent(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error("No access token found. Please login again.");
        return;
      }
      const response = await authService.getEventParticipants(eventId, accessToken) as any;
      const participants = response.data || [];
      if (!participants || participants.length === 0) {
        message.error("No participants data available.");
        return;
      }
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Participants Check-in/Check-out List", 14, 20);
      const columns = ["No", "Name", "Email", "Check-In", "Check-Out"];
      const rows = participants.map((p: any, index: number) => [
        index + 1,
        p.name,
        p.email,
        p.checkInAt ? dayjs(p.checkInAt).format("YYYY-MM-DD HH:mm:ss") : "",
        p.checkOutAt ? dayjs(p.checkOutAt).format("YYYY-MM-DD HH:mm:ss") : ""
      ]);
      (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 30,
        theme: 'grid'
      });
      doc.save("participants.pdf");
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      message.error("List check-in/check-out is empty.");
    } finally {
      setLoadingEvent(false);
    }
  };

  const scheduleColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const hideTicketModal = () => {
    setIsTicketModalVisible(false);
  };

  const handleFeedbackSubmit = async (values: any) => {
    setFeedbackLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error("No access token found. Please login again.");
        return;
      }
      const feedbackData = {
        rating: values.rating,
        comment: values.comment,
      };
      let response: any;
      if (feedback) {
        // Update feedback
        response = await authService.patchEventFeedback(eventId!, feedbackData, accessToken);
      } else {
        // Submit new feedback
        response = await authService.postEventFeedback(eventId!, feedbackData, accessToken);
      }
      if (response.statusCode === 200 || response.statusCode === 201) {
        message.success(response.message);
        setFeedback(response.data.feedback);
        setRatingValue(response.data.feedback.rating);
        setCommentValue(response.data.feedback.comment);
        form.setFieldsValue({
          rating: response.data.feedback.rating,
          comment: response.data.feedback.comment,
        });
      } else {
        message.error(response.error || 'Failed to submit feedback');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Event Details</title>
      </Helmet>
      <AppLayout>
        <PageHeader
          title="Event Details"
          breadcrumbs={[
            {
              title: (
                <>
                  <HomeOutlined />
                  <span>home</span>
                </>
              ),
              path: '/',
            },
            {
              title: (
                <>
                  <IdcardOutlined />
                  <span>event</span>
                </>
              ),
            },
            {
              title: pathname.split('/')[pathname.split('/').length - 1] || '',
            },
          ]}
          btnBack={<BackBtn />}
        />
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16} xl={18}>
            <Outlet context={{ eventId, eventDetail }} />
          </Col>
          <Col xs={24} md={8} xl={6}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Event Info">
                  {loadingEvent ? (
                    <div style={{ textAlign: 'center' }}>
                      <Spin tip="Loading event info..." />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>Name:</Text>
                        <Text>{eventDetail?.name || 'N/A'}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>Status:</Text>
                        <Tag color={
                          eventDetail?.status === 'SCHEDULED'
                            ? 'blue'
                            : eventDetail?.status === 'CANCELED'
                              ? 'red'
                              : eventDetail?.status === 'FINISHED'
                                ? 'green'
                                : 'default'
                        }>
                          {eventDetail?.status}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CiLocationOn />
                        <Text strong>Location:</Text>
                        <Text>{eventDetail?.location || 'N/A'}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CiUser />
                        <Text strong>Capacity:</Text>
                        <Text>{eventDetail?.maxParticipants || 'Unlimited'}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CiCalendar />
                        <Text strong>Start Date:</Text>
                        <Text>
                          {eventDetail?.startDate ? dayjs(eventDetail.startDate).format('YYYY-MM-DD HH:mm') : 'N/A'}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CiCalendar />
                        <Text strong>End Date:</Text>
                        <Text>
                          {eventDetail?.endDate ? dayjs(eventDetail.endDate).format('YYYY-MM-DD HH:mm') : 'N/A'}
                        </Text>
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
              {eventDetail?.status === 'FINISHED' && isParticipant && (
                <Col span={24} style={{ marginTop: "24px" }}>
                  <Card title="Feedback">
                    {feedbackError && (
                      <Alert
                        message="Error"
                        description={feedbackError}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setFeedbackError(null)}
                        style={{ marginBottom: 16 }}
                      />
                    )}
                    {feedbackLoading ? (
                      <Spin tip="Loading feedback..." />
                    ) : (
                      <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleFeedbackSubmit}
                        initialValues={{
                          rating: feedback?.rating,
                          comment: feedback?.comment,
                        }}
                      >
                        <Form.Item label="Rating" name="rating">
                          <Rate
                            allowHalf
                            value={ratingValue}
                            onChange={(value) => setRatingValue(value)}
                          />
                        </Form.Item>
                        <Form.Item label="Comment" name="comment">
                          <Input.TextArea
                            rows={4}
                            placeholder="Your feedback here"
                            value={commentValue}
                            onChange={(e) => setCommentValue(e.target.value)}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button type="primary" htmlType="submit" loading={feedbackLoading} icon={<SendOutlined />}>
                            Submit Feedback
                          </Button>
                        </Form.Item>
                      </Form>
                    )}
                  </Card>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
      </AppLayout>
      <TicketDetailsModal
        visible={isTicketModalVisible}
        onCancel={hideTicketModal}
        ticket={ticketData}
      />
    </>
  );
};

export default EventDetailLayout;
