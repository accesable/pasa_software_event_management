// src\pages\details\ParticipatedEventDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useOutletContext } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  List,
  message,
  Row,
  Space,
  Table,
  Typography,
  Checkbox,
  Spin,
  Rate,
} from 'antd';
import { HomeOutlined, PieChartOutlined, DownloadOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { PageHeader, BackBtn } from '../../components';
import dayjs from 'dayjs';
import authService from '../../services/authService';
import { Events, TicketType } from '../../types';
import { EventParticipantsTable } from '../dashboards/EventParticipantsTable';
import { Helmet } from 'react-helmet-async';
import { EventScheduleItem } from '../../types/schedule';
import jsPDF from 'jspdf';
import TicketDetailsModal from '../../components/TicketDetailsModal';
import EventDiscussion from '../../components/EventDiscussion';

const { Title, Text } = Typography;

const ParticipatedEventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [eventDetails, setEventDetails] = useState<Events | null>(null);
  const [loading, setLoading] = useState(false);
  const [] = useState<string | null>(null);
  const navigate = useNavigate();
  const [ticketData, setTicketData] = useState<TicketType | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]); // State quản lý sessions đã chọn
  const [participation, setParticipation] = useState<any | null>(null); // State lưu thông tin participation
  const [updatingSessions, setUpdatingSessions] = useState<boolean>(false); // State loading cho update session
  const [isTicketModalVisible, setIsTicketModalVisible] = useState<boolean>(false); // State for ticket modal visibility
  const { eventId } = useOutletContext<{ eventId: string }>();
  const [feedbackSummaryLoading] = useState(false);
  const [feedbackSummary] = useState<{
    averageRating: number;
    totalFeedbacks: number;
    ratingDistribution: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const fetchEventDetailsAndParticipation = async () => {
      setLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const eventResponse = await authService.getEventDetails(id, accessToken || undefined) as { statusCode: number; data: { event: Events }; message: string; error?: string };
        if (eventResponse && eventResponse.statusCode === 200) {
          setEventDetails(eventResponse.data.event);

          const participationResponse = await authService.getParticipantData(id, accessToken || undefined) as any;
          if (participationResponse && participationResponse.statusCode === 200 && participationResponse.data.participation) {
            setParticipation(participationResponse.data.participation);
            setSelectedSessionIds(participationResponse.data.participation.sessionIds || []); // Khởi tạo selectedSessionIds từ participation data
          }
        } else {
          message.error(eventResponse?.error);
        }
      } catch (error: any) {
        message.error(error.error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetailsAndParticipation();
  }, [id, navigate]);

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

  const handleDownloadPdf = handleDownloadPdfFunction(setLoading, message, authService, dayjs, eventId);


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
      responsive: ['md']
    },
    {
      title: 'Select Session',
      key: 'select',
      render: (_: any, record: EventScheduleItem) => (
        <Checkbox
          value={record.id}
          checked={selectedSessionIds.includes(record.id)} // Kiểm tra xem session ID có trong selectedSessionIds không
          onChange={(e) => handleSessionCheckboxChange(e.target.checked, record.id)}
        />
      ),
    }
  ];


  const handleUpdateSessions = async () => {
    setUpdatingSessions(true); // Set loading state cho button update session
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error("No access token found. Please login again.");
        navigate('/auth/signin');
        return;
      }

      const response = await authService.updateParticipantSessions(eventDetails!.id, { sessionIds: selectedSessionIds }, accessToken) as any;
      if (response && response.statusCode === 200) {
        message.success(response.message || 'Sessions updated successfully');
        setParticipation({ ...participation, sessionIds: selectedSessionIds });
      } else {
        message.error(response.message || 'Failed to update sessions');
      }
    } catch (error: any) {
      console.error('Error updating sessions:', error);
      message.error(error.message || 'Failed to update sessions');
    } finally {
      setUpdatingSessions(false); // Reset loading state
    }
  };

  const handleSessionCheckboxChange = (checked: boolean, sessionId: string) => {
    if (checked) {
      setSelectedSessionIds([...selectedSessionIds, sessionId]);
    } else {
      setSelectedSessionIds(selectedSessionIds.filter(id => id !== sessionId));
    }
  };

  const showTicketModal = async () => {
    setIsTicketModalVisible(true);
    setLoading(true);
    try {
      if (!eventDetails?.id) {
        message.error("Missing user or event information.");
        return;
      }

      const participantIdResponse = await authService.getParticipantIdByUserIdEventId(eventDetails.id, localStorage.getItem('accessToken') || undefined) as any;
      const participantId = participantIdResponse.data.participantId;

      const response = await authService.getTicketByParticipantId(participantId, localStorage.getItem('accessToken') || undefined) as { statusCode: number; data: { ticket: TicketType }; message: string, error?: string };
      if (response && response.statusCode === 200 && response.data.ticket) {
        setTicketData(response.data.ticket);
      } else {
        message.error(response?.error || 'Failed to load ticket details');
        setTicketData(null);
      }
    } catch (error: any) {
      console.error('Error fetching ticket details:', error);
      message.error(error.error || 'Failed to load ticket details');
      setTicketData(null);
    } finally {
      setLoading(false);
    }
  };

  const hideTicketModal = () => {
    setIsTicketModalVisible(false);
  };

  const renderScheduleTable = (eventDetails: Events | null, scheduleColumns: any) => {
    return eventDetails?.schedule && eventDetails.schedule.length > 0 ? (
      <Table
        rowKey="id"
        dataSource={eventDetails.schedule}
        columns={scheduleColumns}
        pagination={false}
        scroll={{ x: 'max-content'}}
      />
    ) : (
      <Alert message="No schedule available for this event." type="info" showIcon />
    );
  };

  return (
    <div>
      <Helmet>
        <title>Event Details</title>
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
            title: 'Participated Event Details',
          },
        ]}
        btnBack={<BackBtn />}
      />
      <BackBtn />

      <Card title={<Title level={3}>{eventDetails?.name}</Title>}
        extra={
          <Space>
            <Button type="primary" onClick={showTicketModal} >
              View Ticket
            </Button>
            <Button type="primary" onClick={handleUpdateSessions} loading={updatingSessions}>
              Update Sessions
            </Button>
          </Space>
        }
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
              {renderScheduleTable(eventDetails, scheduleColumns)}
            </Card>
          </Col>
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
                    <Button
                      type="primary"
                      size="middle"
                      onClick={() => { window.location.href = `/feedbacks/events/${eventId}`; }}
                    >
                      View All Feedbacks
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
      <TicketDetailsModal
        visible={isTicketModalVisible}
        onCancel={hideTicketModal}
        ticket={ticketData}
      />
    </div>
  );
};

export default ParticipatedEventDetailsPage;
