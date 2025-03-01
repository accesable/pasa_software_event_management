// src\pages\details\MyEventPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Flex,
  Image,
  List,
  message,
  Row,
  Table,
  Typography,
  Rate,
  Spin,
} from 'antd';
import { HomeOutlined, PieChartOutlined, UserAddOutlined, DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { PageHeader, BackBtn, UserAvatar } from '../../components';
import dayjs from 'dayjs';
import authService from '../../services/authService';
import { Events, TicketType } from '../../types';
import { EventParticipantsTable } from '../dashboards/EventParticipantsTable';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Helmet } from 'react-helmet-async';
import TicketDetailsModal from '../../components/TicketDetailsModal';
import InviteUsersModal from '../../components/InviteUsersModal';
import EventDiscussion from '../../components/EventDiscussion';

const { Title, Text } = Typography;

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
  const [, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
  const [ticketData] = useState<TicketType | null>(null); // Declare ticketData here
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [feedbackSummaryLoading, setFeedbackSummaryLoading] = useState(false);
  const [feedbackSummary, setFeedbackSummary] = useState<{
    averageRating: number;
    totalFeedbacks: number;
    ratingDistribution: Record<string, number>;
  } | null>(null);
  const [guestInfos, setGuestInfos] = useState<Record<string, any>>({});
  const [speakerInfos, setSpeakerInfos] = useState<Record<string, any>>({});

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
          fetchSpeakerInfos(speakerIds);
          const guestIds = response.data.event.guestIds;
          fetchGuestInfos(guestIds);
        } else {
          setError(response?.error || 'Failed to load event details');
          message.error(response?.error);
        }
      } catch (error: any) {
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
        if (response.statusCode === 200 && response.data.ratingDistribution) {
          setFeedbackSummary(response.data);
        }
      } catch (error: any) {
        console.error('Error fetching feedback summary:', error);
      } finally {
        setFeedbackSummaryLoading(false);
      }
    };

    fetchEventDetails();
    eventDetails?.status === 'FINISHED' && fetchEventFeedbackSummary(); // Fetch feedback summary only if event finished
  }, [eventId, navigate, eventDetails?.status]); // Fetch feedback summary when event status changes to finished

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

  const handleDownloadPdf = handleDownloadPdfFunction(setLoading, message, authService, dayjs, eventId);

  const renderScheduleTable = (eventDetails: Events | null, scheduleColumns: any) => {
    return eventDetails?.schedule && eventDetails.schedule.length > 0 ? (
      <Table
        rowKey="id"
        dataSource={eventDetails.schedule}
        columns={scheduleColumns}
        pagination={false}
        size='small'
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

  const scheduleColumns = getScheduleColumns();

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

  const hideTicketModal = () => {
    setIsTicketModalVisible(false);
  };
  const showInviteModal = () => {
    setIsInviteModalVisible(true);
  };

  const hideInviteModal = () => {
    setIsInviteModalVisible(false);
  };

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
          <Flex wrap="wrap" gap="small" justify="flex-end" align="center"> {/* Thay Space bằng Flex */}
            {eventDetails?.status === 'SCHEDULED' && (
              <>
                <Button type="primary" icon={<UserAddOutlined />} onClick={showInviteModal}>Invite Users</Button>
                <Button
                  type="primary"
                  onClick={() => navigate(`/dashboards/check-in-out/${eventId}`)}
                >
                  Check-in/Check-out
                </Button>
              </>
            )}
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={() => navigate(`/dashboards/events/${eventId}/analysis`)}
            >
              Analysis
            </Button>
          </Flex>
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
          <Col span={24}>
            <Card title="Guests"> {/* Card hiển thị Guest List */}
              {renderGuestList(eventDetails)} {/* Gọi renderGuestList function */}
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
    console.error("Error generating PDF:", error);
    message.error("List check-in/check-out is empty.");
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
      key: 'title',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      // responsive: ['sm'], // Ẩn cột Start Time trên màn hình nhỏ hơn sm
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      // responsive: ['sm'], // Ẩn cột End Time trên màn hình nhỏ hơn sm
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      responsive: ['md'], // Ẩn cột Description trên màn hình nhỏ hơn md
    },
  ];
};
