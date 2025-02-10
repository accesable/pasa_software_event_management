// src\pages\feedbacks\EventFeedbacksPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Button, Card, List, Spin, Typography, Rate, message } from 'antd';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { PageHeader, BackBtn, Loader } from '../../components';
import { Helmet } from 'react-helmet-async';
import authService from '../../services/authService';

const { Title, Text, Paragraph } = Typography;

const EventFeedbacksPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventFeedbacks(eventId, accessToken || undefined) as any;
        if (response.statusCode === 200 && response.data.feedbacks) {
          setFeedbacks(response.data.feedbacks);
        } else {
          setError(response?.message || 'Failed to load event feedbacks');
          message.error(response?.message || 'Failed to load event feedbacks');
        }
      } catch (error: any) {
        console.error('Error fetching event feedbacks:', error);
        setError(error.message || 'Failed to load event feedbacks');
        message.error(error.message || 'Failed to load event feedbacks');
      } finally {
        setLoading(false);
      }
    };

    fetchEventFeedbacks();
  }, [eventId]);

  return (
    <div>
      <Helmet>
        <title>Event Feedbacks</title>
      </Helmet>
      <PageHeader
        title="Event Feedbacks"
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
            title: 'Event Feedbacks',
          },
        ]}
        btnBack={<BackBtn />}
      />

      <Card title={<Title level={3}>User Feedbacks for Event ID: {eventId}</Title>}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        )}
        {loading ? (
          <Loader />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={feedbacks}
            renderItem={(feedback) => (
              <List.Item>
                <List.Item.Meta
                  title={`Rating: ${feedback.rating} stars`}
                  description={<Rate disabled allowHalf value={feedback.rating} />}
                />
                <Paragraph>{feedback.comment}</Paragraph>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default EventFeedbacksPage;
