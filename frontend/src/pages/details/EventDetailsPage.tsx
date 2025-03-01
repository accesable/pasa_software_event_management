// src\pages\details\EventDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
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
import { PageHeader, Loader, BackBtn, UserAvatar } from '../../components';
import dayjs from 'dayjs';
import authService from '../../services/authService';
import { Events } from '../../types';
import { EventParticipantsTable } from '../dashboards/EventParticipantsTable';
import { Helmet } from 'react-helmet-async';
import EventDiscussion from '../../components/EventDiscussion';
import jsPDF from 'jspdf';

const { Text } = Typography;

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { eventId } = useOutletContext<{ eventId: string }>();
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
  const [guestInfos, setGuestInfos] = useState<Record<string, any>>({});
  const [speakerInfos, setSpeakerInfos] = useState<Record<string, any>>({});
  // State để đảm bảo API accept được gọi 1 lần duy nhất
  const [hasAccepted, setHasAccepted] = useState(false);

  // Fetch chi tiết sự kiện (sử dụng eventId từ outlet context)
  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventDetails(eventId, accessToken || undefined) as { statusCode: number; data: { event: Events }; message: string; error?: string };
        if (response && response.statusCode === 200) {
          setEventDetails(response.data.event);
          const speakerIds = response.data.event.schedule.flatMap((session: any) => session.speakerIds);
          if(speakerIds.length > 0) {
            fetchSpeakerInfos(speakerIds);
          }
          const guestIds = response.data.event.guestIds;
          if(guestIds.length > 0) {
            fetchGuestInfos(guestIds);
          }
        }
      } catch (error: any) {
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
        if (response.statusCode === 200 && response.data.ratingDistribution) {
          setFeedbackSummary(response.data);
        }
      } catch (error: any) {
      } finally {
        setFeedbackSummaryLoading(false);
      }
    };

    fetchEventDetails();
    fetchEventFeedbackSummary();
  }, [eventId, navigate]);

  const fetchSpeakerInfos = async (speakerIds: string[]) => {
    const speakerInfoMap: Record<string, any> = {};
    for (const speakerId of speakerIds) {
      try {
        const response = await authService.getSpeakerById(speakerId) as any;
        if (response.statusCode === 200 && response.data) {
          speakerInfoMap[speakerId] = response.data.speaker;
        }
      } catch (error: any) {
        console.error(`Error fetching speaker info for ${speakerId}`, error);
      }
    }
    setSpeakerInfos(speakerInfoMap);
  };

  const fetchGuestInfos = async (guestIds: string[]) => {
    const guestInfoMap: Record<string, any> = {};
    for (const guestId of guestIds) {
      try {
        const response = await authService.getGuestById(guestId) as any;
        if (response.statusCode === 200 && response.data) {
          guestInfoMap[guestId] = response.data.guest;
        }
      } catch (error) {
        console.error(`Error fetching guest info for ${guestId}`, error);
      }
    }
    setGuestInfos(guestInfoMap);
  };

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
          message.error(error.error || 'Failed to accept invitation.');
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
      const response = await authService.getEventParticipants(eventId, accessToken);
      const participants = response.data.participants || [];
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
      console.error(error);
      message.error("List check-in/check-out is empty.");
    } finally {
      setLoading(false);
    }
  };

  const onSessionSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedSessionIds(selectedKeys as string[]);
  };

  const renderGuestList = (eventDetails: Events | null) => { // Function render Guest List
    return eventDetails?.guestIds && eventDetails.guestIds.length > 0 ? (
      <List
        dataSource={eventDetails.guestIds}
        renderItem={(guestId) => (
          <List.Item>
            <Flex gap="small" align="center">
              <Flex vertical>
                <Text strong>{guestInfos[guestId]?.name || 'Unknown Guest'}</Text>
                <Text type="secondary">Job Title: {guestInfos[guestId]?.jobTitle || 'N/A'}</Text>
                <Text type="secondary">Organization: {guestInfos[guestId]?.organization || 'N/A'}</Text>
              </Flex>
            </Flex>
          </List.Item>
        )}
        loading={loading} // Thêm loading prop nếu cần
      />
    ) : (
      <Alert message="No guests available for this event." type="info" showIcon />
    );
  };

  const handleDownloadPdf = handleDownloadPdfFunction(setLoading, message, authService, dayjs, eventId);

  const renderScheduleTable = (eventDetails: Events | null, scheduleColumns: any) => {
    return eventDetails?.schedule && eventDetails.schedule.length > 0 ? (
      <Table
        rowKey="id"
        dataSource={eventDetails.schedule}
        columns={scheduleColumns}
        pagination={false}
        scroll={{ x: 'true'}}
        rowSelection={{
          onChange: (selectedRowKeys) => {
            onSessionSelectChange(selectedRowKeys as string[]);
          },
        }}
        size="small"
        expandable={{
          expandedRowRender: (record) => (
            <Row gutter={[16, 16]}> {/* Sử dụng Row để tạo layout grid cho speakers */}
              {record.speakerIds.map((speakerId: string) => (
                <Col key={speakerId} xs={24} sm={12} md={8} lg={6}> {/* Responsive columns */}
                  <Card>
                    <Flex vertical gap="small">
                      <Flex gap="middle" align="center">
                        <UserAvatar fullName={speakerInfos[speakerId]?.name || 'Unknown Speaker'} avatarUrl={speakerInfos[speakerId]?.avatar} size="large" />

                      </Flex>
                      <div>
                        <Text type="secondary">Job Title: </Text>
                        <Text strong>{speakerInfos[speakerId]?.jobTitle || 'N/A'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Email: </Text>
                        <Text>{speakerInfos[speakerId]?.email || 'N/A'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Contact: </Text>
                        <Typography.Link href={speakerInfos[speakerId]?.linkFb || '#'}>
                          {speakerInfos[speakerId]?.linkFb || 'N/A'}
                        </Typography.Link>
                      </div>
                    </Flex>
                  </Card>
                </Col>
              ))}
            </Row>
          ),
          rowExpandable: (record) => record.speakerIds?.length > 0,
        }}
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
      key: 'description',
      responsive: ['md'],
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
          <Col span={24}>
            <Card title="Schedule">
              {renderScheduleTable(eventDetails, scheduleColumns)}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Guests"> {/* Card hiển thị Guest List */}
              {renderGuestList(eventDetails)} {/* Gọi renderGuestList function */}
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
                        <Text>{feedbackSummary.ratingDistribution["5.0"] || 0} feedbacks</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>4 stars:</Text>
                        <Text>{feedbackSummary.ratingDistribution["4.0"] || 0} feedbacks</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>3 stars:</Text>
                        <Text>{feedbackSummary.ratingDistribution["3.0"] || 0} feedbacks</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text>2 stars:</Text>
                        <Text>{feedbackSummary.ratingDistribution["2.0"] || 0} feedbacks</Text>

                      </Flex>
                      <Flex justify="space-between">
                        <Text>1 star:</Text>
                        <Text>{feedbackSummary.ratingDistribution["1.0"] || 0} feedbacks</Text>
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
