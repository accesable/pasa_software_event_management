// src\pages\details\MyEventPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link, useOutletContext, useSearchParams } from 'react-router-dom';
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
  Rate,
  Spin,
} from 'antd';
import { HomeOutlined, PieChartOutlined, UserAddOutlined, DownloadOutlined, QuestionOutlined, BarChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { PageHeader, Loader, UserAvatar, BackBtn } from '../../components';
import { useFetchData } from '../../hooks';
import dayjs from 'dayjs';
import authService from '../../services/authService';
import { Events, TicketType, User } from '../../types';
import { EventParticipantsTable } from '../dashboards/EventParticipantsTable';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Helmet } from 'react-helmet-async';
import { EventScheduleItem } from '../../types/schedule';
import TicketDetailsModal from '../../components/TicketDetailsModal';
import InviteUsersModal from '../../components/InviteUsersModal';
import { useDispatch } from 'react-redux';
import EventDiscussion from '../../components/EventDiscussion';

const { Title, Text, Paragraph } = Typography;

export interface ParticipantData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  checkInAt: string | null;
  checkOutAt: string | null;
}


const DetailMyEventPage: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const [eventDetails, setEventDetails] = useState<Events | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [ticketData, setTicketData] = useState<TicketType | null>(null); // Declare ticketData here
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const dispatch = useDispatch();
  const [questions, setQuestions] = useState<any[]>([]);
  const [feedbackSummaryLoading, setFeedbackSummaryLoading] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState<{
    averageRating: number;
    totalFeedbacks: number;
    ratingDistribution: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventDetails(eventId, accessToken || undefined) as { statusCode: number; data: { event: Events }; message: string; error?: string };
        if (response && response.statusCode === 200) {
          setEventDetails(response.data.event);
        } else {
          setError(response?.error || 'Failed to load event details');
          message.error(response?.error);
        }
      } catch (error: any) {
        console.error('Error fetching event details:', error);
        setError(error.error || 'Failed to load event details');
        message.error(error.error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEventFeedbackSummary = async () => { // Fetch feedback summary
      if (!eventId) return;
      setFeedbackSummaryLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventFeedbackSummary(eventId, accessToken || undefined) as any;
        console.log('Feedback summary:', response);
        if (response.statusCode === 200 && response.data) {
          setFeedbackSummary(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching feedback summary:', error);
      } finally {
        setFeedbackSummaryLoading(false);
      }
    };

    fetchEventDetails();
    eventDetails?.status === 'FINISHED' && fetchEventFeedbackSummary(); // Fetch feedback only if event finished
  }, [eventId, navigate, eventDetails?.status]); // Fetch feedback summary when event status changes to finished


  const handleDownloadPdf = handleDownloadPdfFunction(setLoading, message, authService, dayjs, eventId);

  const onSessionSelectChange = (selectedKeys: React.Key[]) => {
    setSelectedSessionIds(selectedKeys as string[]);
  };

  const scheduleColumns = getScheduleColumns();

  const hideTicketModal = () => {
    setIsTicketModalVisible(false);
  };
  const showInviteModal = () => {
    setIsInviteModalVisible(true);
  };

  const hideInviteModal = () => {
    setIsInviteModalVisible(false);
  };


  const handleUpdateSessionsForTicket = handleUpdateSessionsForTicketFunction(setLoading, message, navigate, localStorage, authService, setIsTicketModalVisible, setTicketData, ticketData);


  return (
    <div>
      <Helmet>
        <title>Details | Dashboard</title>
      </Helmet>
      <PageHeader
        title="Event Details"
        breadcrumbs={breadcrumbs}
        btnBack={<BackBtn />}
      />
      <BackBtn />

      <Card title={<Title level={3}>{eventDetails?.name}</Title>}
        extra={
          <Space>
            {eventDetails?.status === 'SCHEDULED' && (
              <><Button type="primary" icon={<UserAddOutlined />} onClick={showInviteModal}>Invite Users</Button><Button
                type="primary"
                onClick={() => navigate(`/dashboards/check-in-out/${eventId}`)} // Navigate to QR scanner page
              >
                Check-in/Check-out
              </Button></>
            )}
            <Button
              type="primary"
              icon={<BarChartOutlined />} // Use the new icon
              onClick={() => navigate(`/dashboards/events/${eventId}/analysis`)} // Navigate to analysis page
            >
              Analysis
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            {renderEventIntroduction(eventDetails)}
          </Col>
          <Col span={24}>
            <Card title="Schedule">
              {renderScheduleTable(eventDetails, scheduleColumns)}
            </Card>
          </Col>
          {renderEventDocuments(eventDetails)}
          {eventDetails?.status === 'FINISHED' && (
            <Col span={24} >
              <Card title="Feedback Summary">
                {renderFeedbackSummary(feedbackSummaryLoading, feedbackSummary, eventId)}
              </Card>
            </Col>
          )}
          <Col span={24}>
            <Card title="Participants Check-in/Check-out List"
              extra={<Button icon={<DownloadOutlined />} onClick={handleDownloadPdf} loading={loading}>
                Download PDF
              </Button>}
            >
              <EventParticipantsTable eventId={eventId || ''} />
            </Card>
          </Col>

          <Col span={24}>
            <EventDiscussion
              eventId={eventId || ''}
              questions={questions}
              setQuestions={setQuestions}
            />
          </Col>
        </Row>
      </Card>
      <InviteUsersModal
        visible={isInviteModalVisible}
        onCancel={hideInviteModal}
        eventId={eventId || ''}
        onInvitationsSent={() => { }} // Example callback
      />
      <TicketDetailsModal
        visible={isTicketModalVisible}
        onCancel={hideTicketModal}
        ticket={ticketData}
      />
    </div>
  );
};


export default DetailMyEventPage;


// Các hàm helper để render UI và xử lý logic (giữ code sạch hơn trong component chính)
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

const handleUpdateSessionsForTicketFunction = (setLoading: React.Dispatch<React.SetStateAction<boolean>>, message: any, navigate: any, localStorage: any, authService: any, setIsTicketModalVisible: React.Dispatch<React.SetStateAction<boolean>>, setTicketData: React.Dispatch<React.SetStateAction<TicketType | null>>, ticketData: TicketType | null) => async (sessionIds: string[]) => {
  setLoading(true);
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      message.error("No access token found. Please login again.");
      navigate('/auth/signin');
      return;
    }

    const response = await authService.updateParticipantSessions(ticketData?.participantId, { sessionIds }, accessToken) as any;
    if (response && response.statusCode === 200) {
      message.success(response.message || 'Sessions updated successfully');
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

const renderEventIntroduction = (eventDetails: Events | null) => {
  if (eventDetails?.videoIntro) {
    return (
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
    );
  } else if (eventDetails?.banner) {
    return (
      <Card title="Event Banner">
        <Image
          src={eventDetails.banner}
          alt="Event Banner"
          style={{ width: "100%", height: "480px", objectFit: "cover" }}
        />
      </Card>
    );
  } else {
    return (
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
    );
  }
};

const renderScheduleTable = (eventDetails: Events | null, scheduleColumns: any) => {
  return eventDetails?.schedule && eventDetails.schedule.length > 0 ? (
    <Table
      rowKey="id"
      dataSource={eventDetails.schedule}
      columns={scheduleColumns}
      pagination={false}
    />
  ) : (
    <Alert message="No schedule available for this event." type="info" showIcon />
  );
};

const renderEventDocuments = (eventDetails: Events | null) => {
  return eventDetails?.documents && eventDetails.documents.length > 0 ? (
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
  ) : null;
};
const renderFeedbackSummary = (feedbackSummaryLoading: boolean, feedbackSummary: { averageRating: number; totalFeedbacks: number; ratingDistribution: Record<string, number>; } | null, eventId: string | undefined) => {
  return feedbackSummaryLoading ? (
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
        {feedbackSummary.ratingDistribution && ( // Thêm kiểm tra ratingDistribution tồn tại
          <>
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
          </>
        )}
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
  );
};


const breadcrumbs = [
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
    title: 'My Event Details', // Đổi breadcrumb title
  },
];

const getScheduleColumns = () => {
  return [
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
};
