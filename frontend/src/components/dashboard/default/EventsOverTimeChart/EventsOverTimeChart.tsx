import React, { useState, useEffect } from 'react';
import { CardProps, Typography, Spin, Alert } from 'antd';
import { Area } from '@ant-design/charts';
import { Card } from '../../../index.ts';
import authService from '../../../../services/authService.ts';

type Props = CardProps;

const EventsOverTimeChartComponent: React.FC<Props> = ({ ...others }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getTotalEventsOverTime(accessToken || '') as any;
        if (response.statusCode === 200 && response.data) {
          const chartData: { month: string; type: string; count: number }[] = [];
          if (response.data.monthlyOrganizedEvents) {
            response.data.monthlyOrganizedEvents.forEach((item: any) => {
              chartData.push({ month: item.month, type: 'Organized', count: item.count });
            });
          }
          if (response.data.monthlyParticipatedEvents) {
            response.data.monthlyParticipatedEvents.forEach((item: any) => {
              chartData.push({ month: item.month, type: 'Participated', count: item.count });
            });
          }
          setData(chartData);
        } else {
          setError(response.message || 'Failed to load events over time data.');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load events over time data.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventsData();
  }, []);

  const maxCount = data.length ? Math.max(...data.map(item => item.count)) : 0;

  const config = {
    data,
    xField: 'month',
    yField: 'count',
    seriesField: 'type',
    legend: { position: 'top' },
    xAxis: {
      label: {
        formatter: (value: string) => {
          // Đảo vị trí tháng và năm nếu cần
          return value.split('-')[1] + '-' + value.split('-')[0];
        },
      },
    },
    yAxis: {
      min: 0,
      max: maxCount + 2,
    },
    tooltip: {
      formatter: (params: any) => {
        return {
          name: params.type,
          value: Number.isInteger(params.count) ? params.count : Math.round(params.count),
        };
      },
    },
  };

  return (
    <Card title="Total Events Over Time" {...others}>
      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <Spin tip="Loading Events Data..." />
        </div>
      ) : (
        // @ts-ignore
        <Area {...config} />
      )}
    </Card>
  );
};

export const EventsOverTimeChart = EventsOverTimeChartComponent;
