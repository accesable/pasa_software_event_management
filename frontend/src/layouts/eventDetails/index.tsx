// src\layouts\eventDetails\index.tsx
import { AppLayout } from '../index.ts';
import { Col, Row, message, Spin, Typography, Card, Tag, Form, Rate, Input, Alert, Button } from 'antd';
import { useLocation, useParams, Outlet } from 'react-router-dom';
import { CiLocationOn, CiUser, CiCalendar } from "react-icons/ci";
import { PageHeader, Loader, BackBtn } from '../../components';
import { HomeOutlined, IdcardOutlined } from '@ant-design/icons';
import { useStylesContext } from '../../context';
import { useEffect, useState } from 'react';
import authService from '../../services/authService.ts';
import dayjs from 'dayjs';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';

const { Text } = Typography;

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
  const [form] = Form.useForm(); // Using Form.useForm to control the form programmatically

  useEffect(() => {
    const fetchEventDetail = async () => {
      setLoadingEvent(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventDetails(eventId) as { statusCode: number; data: any; message?: string };
        if (response.statusCode === 200 && response.data) {
          setEventDetail(response.data.event);
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
          if (response.data.feedback) {
            setRatingValue(response.data.feedback.rating);
            setCommentValue(response.data.feedback.comment);
            form.setFieldsValue({ // Update form fields with fetched feedback
              rating: response.data.feedback.rating,
              comment: response.data.feedback.comment,
            });
          }
        } else if (response.statusCode === 400 && response.data?.error === "Feedback not found") {
          setFeedback(null);
          form.resetFields(); // Reset form if no feedback found
          setRatingValue(undefined);
          setCommentValue('');
        }
         else {
          setFeedbackError(response?.message || 'Failed to load feedback');
          message.error(response?.message || 'Failed to load feedback');
        }
      } catch (error: any) {
        setFeedbackError(error.message || 'Failed to load feedback');
        message.error(error.message || 'Failed to load feedback');
      } finally {
        setFeedbackLoading(false);
      }
    };


    if (eventId) {
      fetchEventDetail();
      fetchUserFeedback();
    }
  }, [eventId, form]); // Added form to dependency array

  const handleFeedbackSubmit = async (values: any) => {
    setFeedbackLoading(true);
    setFeedbackError(null);
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

      let response: { statusCode: number; message: string; error?: string, data: { feedback: any } };
      if (feedback) {
        // Update feedback
        response = await authService.patchEventFeedback(eventId!, feedbackData, accessToken) as { statusCode: number; message: string; error?: string, data: { feedback: any } };
      } else {
        // Submit new feedback
        response = await authService.postEventFeedback(eventId!, feedbackData, accessToken) as { statusCode: number; message: string; error?: string, data: { feedback: any } };
      }

      if (response.statusCode === 201 || response.statusCode === 200) {
        message.success(response.message);
        setFeedback(response.data.feedback);
        setRatingValue(response.data.feedback.rating);
        setCommentValue(response.data.feedback.comment);
        form.setFieldsValue({ // Update form fields after successful submission
          rating: response.data.feedback.rating,
          comment: response.data.feedback.comment,
        });
      } else {
        setFeedbackError(response.error || 'Failed to submit feedback');
        message.error(response.error || 'Failed to submit feedback');
      }
    } catch (error: any) {
      setFeedbackError(error.message || 'Failed to submit feedback');
      message.error(error.message || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };


  return (
    <>
      {/*@ts-ignore*/}
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
        />
        <Row {...stylesContext?.rowProps}>
          <Col xs={24} md={16} xl={18}>
            <Outlet context={{ eventId, eventDetail }} /> {/* Truyền eventId và eventDetail qua context */}
          </Col>
          <Col xs={24} md={8} xl={6}>
            <Row {...stylesContext?.rowProps}>
              <Col span={24}>
                <Card title="Event Info">
                  {loadingEvent ? (
                    <div style={{ textAlign: 'center' }}>
                      <Spin tip="Loading event info..." />
                    </div>
                  ) : (
                    // Sử dụng div với display flex để bố trí các mục thông tin
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>Name:</Text>
                        <Text>{eventDetail?.name || 'N/A'}</Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text strong>Status:</Text>
                        <Tag color={eventDetail?.status === 'SCHEDULED' ? 'blue' : eventDetail?.status === 'CANCELED' ? 'red' : 'green'}>{eventDetail?.status}</Tag>
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
               {eventDetail?.status === 'FINISHED' && (
                <Col span={24} style={{marginTop: "24px"}}>
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
                        form={form} // Integrate form instance
                        layout="vertical"
                        onFinish={handleFeedbackSubmit}
                        initialValues={{ // initialValues are still useful for resetting form
                          rating: feedback?.rating,
                          comment: feedback?.comment,
                        }}
                      >
                        <Form.Item
                          label="Rating"
                          name="rating"
                        >
                          <Rate
                            allowHalf
                            value={ratingValue} // Use ratingValue state for controlled component
                            onChange={(value) => setRatingValue(value)} // Update ratingValue state on change
                          />
                        </Form.Item>
                        <Form.Item
                          label="Comment"
                          name="comment"
                        >
                          <Input.TextArea
                            rows={4}
                            placeholder="Your feedback here"
                            value={commentValue} // Use commentValue state for controlled component
                            onChange={(e) => setCommentValue(e.target.value)} // Update commentValue state on change
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button type="primary" htmlType="submit" loading={feedbackLoading}>
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
    </>
  );
};

export default EventDetailLayout;
