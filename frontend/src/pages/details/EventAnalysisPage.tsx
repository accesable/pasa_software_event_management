import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, Spin, Alert, message } from 'antd';
import { PageHeader, BackBtn, Loader } from '../../components';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import authService from '../../services/authService';
import InvitationSummaryChart from './components/InvitationSummaryChart'; // Import các components biểu đồ
import DetailedParticipantsTable from './components/DetailedParticipantsTable';
import CheckInOutStatsChart from './components/CheckInOutStatsCard';
import EventComparisonChart from './components/EventComparisonChart';

const { Title } = Typography;

const EventAnalysisPage: React.FC = () => {
  const { id: eventId } = useParams<{ id: string }>();
  const [invitationData, setInvitationData] = useState<any>(null);
  const [checkInOutStats, setCheckInOutStats] = useState<any>(null);
  const [detailedParticipants, setDetailedParticipants] = useState<any>(null);
  const [eventComparisonData, setEventComparisonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparisonError, setComparisonError] = useState<string | null>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        console.log('eventId', eventId);
        const invitationResponse = await authService.getEventInvitationReport(eventId, accessToken as string);
        setInvitationData((invitationResponse as any).data);

        const checkInOutResponse = await authService.getCheckInOutStats(eventId, accessToken as string);
        setCheckInOutStats((checkInOutResponse as any).data.checkInOutStats);

        const comparisonResponse = await authService.getEventComparisonData(accessToken as string);
        setEventComparisonData((comparisonResponse as any).data.eventComparisonDataList);

        const detailedParticipantsResponse = await authService.getDetailedParticipantList(eventId, accessToken as string) as any;
        setDetailedParticipants(detailedParticipantsResponse.data);

      } catch (error: any) {
        setError(error.message || 'Failed to fetch analysis data');
        message.error(error.message || 'Failed to fetch analysis data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }


  return (
    <div>
      <Helmet>
        <title>Event Analysis</title>
      </Helmet>
      <PageHeader
        title="Event Analysis"
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
            title: 'Event Analysis',
          },
        ]}
        btnBack={<BackBtn />}
      />
      <BackBtn />

      <Card>
        <Title level={4}>Event Analysis Dashboard</Title>
        <Row gutter={[24, 24]}>
          <Col span={12}>
            <Card title="Invitation Summary">
              {invitationData ? (
                <InvitationSummaryChart invitationSummary={invitationData.invitationSummary} />
              ) : (
                <Alert message="No invitation data available" type="info" showIcon />
              )}
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Check-in/Check-out Stats">
              {checkInOutStats ? (
                <CheckInOutStatsChart checkInOutStats={checkInOutStats} />
              ) : (
                <Alert message="No check-in/check-out stats available" type="info" showIcon />
              )}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Detailed Participants List">
              {loading ? (
                <Spin tip="Loading participants data..." />
              ) : error ? (
                <Alert message="Error loading participants" description={error} type="error" showIcon />
              ) : detailedParticipants ? (
                <DetailedParticipantsTable
                  detailedParticipants={detailedParticipants.detailedParticipants || []}
                  meta={detailedParticipants.meta || { totalItems: 0, page: 1, limit: 10, totalPages: 0, count: 0 }}
                />
              ) : (
                <Alert message="No participants data available" type="info" showIcon />
              )}
            </Card>
          </Col>
          <Col span={24}>
            <Card title="Event Comparison">
              <EventComparisonChart
                eventComparisonDataList={eventComparisonData}
                loading={comparisonLoading}
                error={comparisonError}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EventAnalysisPage;
