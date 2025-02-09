// src/components/CustomerReviewsCard.tsx
import { useState, useEffect } from 'react';
import {
  Button,
  CardProps,
  Flex,
  Popover,
  Progress,
  ProgressProps,
  Rate,
  Typography,
} from 'antd';
import { green, lime, orange, red, yellow } from '@ant-design/colors';
import { QuestionOutlined } from '@ant-design/icons';
import { Card } from '../../../index.ts';
import authService from '../../../../services/authService';
// Giả sử bạn có service feedbackService với hàm getOrganizerEventFeedbackSummary

const { Title, Text } = Typography;

const PROGRESS_PROPS: ProgressProps = {
  style: {
    width: 200,
  },
};

type Props = CardProps;

export const CustomerReviewsCard = ({ ...others }: Props) => {
  const [feedbackData, setFeedbackData] = useState<{
    averageRating: number;
    ratingDistribution: { [key: string]: number };
    totalFeedbacks: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        // Lấy accessToken theo cách của bạn (ví dụ từ localStorage)
        const accessToken = localStorage.getItem('accessToken') || '';
        const res = await authService.getOrganizerEventFeedbackSummary(accessToken) as { statusCode: number; data: { averageRating: number; ratingDistribution: { [key: string]: number }; totalFeedbacks: number; }; message?: string; };
        if (res.statusCode === 200) {
          setFeedbackData(res.data);
        } else {
          setError(res.message || 'Error fetching feedback summary');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching feedback summary');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <Card title="Customer reviews" {...others}>
        <Text>Loading feedback summary...</Text>
      </Card>
    );
  }

  if (error || !feedbackData) {
    return (
      <Card title="Customer reviews" {...others}>
        <Text type="danger">{error || 'No feedback data available'}</Text>
      </Card>
    );
  }

  // Destructure data từ API
  const { averageRating, ratingDistribution, totalFeedbacks } = feedbackData;

  // Tính phần trăm cho từng hạng mục dựa trên tổng số feedback
  const distributionPercentages = {
    Excellent: Math.round(((ratingDistribution["4-5"] || 0) / totalFeedbacks) * 100),
    Good: Math.round(((ratingDistribution["3-4"] || 0) / totalFeedbacks) * 100),
    Average: Math.round(((ratingDistribution["2-3"] || 0) / totalFeedbacks) * 100),
    Poor: Math.round(((ratingDistribution["1-2"] || 0) / totalFeedbacks) * 100),
    Critical: Math.round(((ratingDistribution["0-1"] || 0) / totalFeedbacks) * 100),
  };

  return (
    <Card
      title="Customer reviews"
      extra={
        <Popover
          content={`Overall rating based on ${totalFeedbacks} reviews`}
          title="Review ratings"
        >
          <Button icon={<QuestionOutlined />} size="small" type="text" />
        </Popover>
      }
      actions={[<Button>See all customer reviews</Button>]}
      {...others}
    >
      <Flex vertical gap="middle">
        <Flex align="center" gap="middle" justify="center">
          <Rate allowHalf value={averageRating} disabled />
          <Title level={2} style={{ margin: 0 }}>
            {averageRating.toFixed(1)}/5
          </Title>
        </Flex>
        <Flex vertical gap="small">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Excellent</Text>
            <Progress
              percent={distributionPercentages.Excellent}
              strokeColor={lime[6]}
              {...PROGRESS_PROPS}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Good</Text>
            <Progress
              percent={distributionPercentages.Good}
              strokeColor={green[5]}
              {...PROGRESS_PROPS}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Average</Text>
            <Progress
              percent={distributionPercentages.Average}
              strokeColor={yellow[6]}
              {...PROGRESS_PROPS}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Poor</Text>
            <Progress
              percent={distributionPercentages.Poor}
              strokeColor={orange[5]}
              {...PROGRESS_PROPS}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Critical</Text>
            <Progress
              percent={distributionPercentages.Critical}
              strokeColor={red[6]}
              {...PROGRESS_PROPS}
            />
          </div>
        </Flex>
      </Flex>
    </Card>
  );
};

export default CustomerReviewsCard;
