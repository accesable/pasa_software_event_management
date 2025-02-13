// src\pages\feedbacks\EventFeedbacksPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Alert, Card, List, Typography, Rate, message, Avatar } from 'antd';
import { HomeOutlined, PieChartOutlined, UserOutlined } from '@ant-design/icons';
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
  const [userInfos, setUserInfos] = useState<Record<string, any>>({}); // State to store user info

  useEffect(() => {
    const fetchEventFeedbacks = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getEventFeedbacks(eventId, accessToken || undefined) as any;
        if (response.statusCode === 200 && response.data.feedbacks) {
          setFeedbacks(response.data.feedbacks);
          // Fetch user info for each feedback
          const userIds = response.data.feedbacks.map((feedback: any) => feedback.userId);
          fetchUsersInfo(userIds);
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

    const fetchUsersInfo = async (userIds: string[]) => {
      const usersInfoMap: Record<string, any> = {};
      for (const userId of userIds) {
        try {
          const response = await authService.getUserById(userId) as any;
          if (response.statusCode === 200 && response.data) {
            usersInfoMap[userId] = response.data;
          }
        } catch (error) {
          console.error(`Error fetching user info for ${userId}`, error);
        }
      }
      setUserInfos(usersInfoMap);
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
      <BackBtn />

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
                  avatar={<Avatar src={userInfos[feedback.userId]?.avatar} icon={<UserOutlined />} />}
                  title={<Text strong>{userInfos[feedback.userId]?.name || 'Unknown User'}</Text>}
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
