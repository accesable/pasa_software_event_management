// src\pages\dashboards\ParticipationStats.tsx
import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Table } from 'antd';
import { PageHeader } from '../../components';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axiosInstance from '../../api/axiosInstance';

interface ParticipationData {
    eventId: string;
    registeredCount: number;
    checkInCount: number;
    checkOutCount: number;
}

const columns = [
  {
    title: 'Event ID',
    dataIndex: 'eventId',
    key: 'eventId',
  },
  {
    title: 'Registered Count',
    dataIndex: 'registeredCount',
    key: 'registeredCount',
  },
  {
    title: 'Check-in Count',
    dataIndex: 'checkInCount',
    key: 'checkInCount',
  },
  {
    title: 'Check-out Count',
    dataIndex: 'checkOutCount',
    key: 'checkOutCount',
  },
];

export const ParticipationStatsPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<ParticipationData | null>(null);

  useEffect(() => {
    const fetchParticipationStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<any>(`/reports/participation-stats`); // call api here
        setStatsData(response.data.data);
      } catch (e: any) {
        setError(e.message);
        setStatsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipationStats();
  }, []);

  return (
    <div>
      <Helmet>
        <title>Participation Stats | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="Participation Statistics"
        breadcrumbs={[
          {
            title: (
              <>
                <HomeOutlined />
                <span>home</span>
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
            title: 'Participation Stats',
          },
        ]}
      />
      <Card>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {loading ? (
          <Spin tip="Loading timeline report..." />
        ) : (
          <Table
            dataSource={statsData ? [statsData] : []}
            columns={columns}
            pagination={false}
            rowKey="eventId"
          />
        )}
      </Card>
    </div>
  );
};
