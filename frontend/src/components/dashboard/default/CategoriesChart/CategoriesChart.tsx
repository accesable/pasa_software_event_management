import { CardProps, Spin, Alert, Empty } from 'antd';
import { Pie } from '@ant-design/charts';
import { Card } from '../../../index.ts';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import authService from '../../../../services/authService.ts';

type Props = CardProps;

const CategoriesChartComponent: React.FC<Props> = ({ ...others }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0); // State for total events

  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.getEventCategoryDistribution();
        const data = response as { data: { categoryDistribution: any[], totalEvents: number } };
        setData(data.data.categoryDistribution);
        setTotalEvents(data.data.totalEvents);
      } catch (error: any) {
        setError(error.error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, []);

  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    innerRadius: 0.5,
    label: {
      type: 'inner',
      offset: '-50%',
      content: ({ percent }: any) => `${(percent * 100).toFixed(0)}%`,
      style: {
        textAlign: 'center',
        fontSize: 16,
      },
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: 18,
        },
        // Use totalEvents in the statistic content
        content: `${totalEvents} Events\nTotal`,
      },
    },
  };

  // Handle the case when there are no categories or events
  if (totalEvents === 0) {
    return (
      <Card title="Categories" {...others}>
        <Empty description="No events available" />
      </Card>
    );
  }

  return (
    <Card title="Categories" {...others}>
      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <Spin tip="Loading Categories..." />
        </div>
      ) : (
        // @ts-ignore
        <Pie {...config} />
      )}
    </Card>
  );
};

export const CategoriesChart = CategoriesChartComponent;
