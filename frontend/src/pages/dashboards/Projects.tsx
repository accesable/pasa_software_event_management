// src\pages\dashboards\Projects.tsx
import {
  Card,
  ClientsTable,
  Loader,
  PageHeader,
  ProjectsCard,
  ProjectsTable,
  RevenueCard,
} from '../../components';
import { Column } from '@ant-design/charts';
import { Events, Projects, User } from '../../types';
import {
  CloudUploadOutlined,
  HomeOutlined,
  PieChartOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useFetchData } from '../../hooks';
import { EventsCard } from '../../components/dashboard/shared';
import useFetchOrganizedEventsData from '../../hooks/useFetchOrganizedEventsData';
import useFetchTopClients from '../../hooks/useFetchTopClients'; // Import useFetchTopClients
import { Row, Col, Alert, Segmented } from 'antd';
import { useState, useEffect } from 'react';

const RevenueColumnChart = () => {
  const data = [
    {
      name: 'Income',
      period: 'Mon',
      value: 18.9,
    },
    {
      name: 'Income',
      period: 'Tue',
      value: 28.8,
    },
    {
      name: 'Income',
      period: 'Wed',
      value: 39.3,
    },
    {
      name: 'Income',
      period: 'Thur',
      value: 81.4,
    },
    {
      name: 'Income',
      period: 'Fri',
      value: 47,
    },
    {
      name: 'Income',
      period: 'Sat',
      value: 20.3,
    },
    {
      name: 'Income',
      period: 'Sun',
      value: 24,
    },
    {
      name: 'Spent',
      period: 'Mon',
      value: 12.4,
    },
    {
      name: 'Spent',
      period: 'Tue',
      value: 23.2,
    },
    {
      name: 'Spent',
      period: 'Wed',
      value: 34.5,
    },
    {
      name: 'Spent',
      period: 'Thur',
      value: 99.7,
    },
    {
      name: 'Spent',
      period: 'Fri',
      value: 52.6,
    },
    {
      name: 'Spent',
      period: 'Sat',
      value: 35.5,
    },
    {
      name: 'Spent',
      period: 'Sun',
      value: 37.4,
    },
  ];
  const config = {
    data,
    isGroup: true,
    xField: 'period',
    yField: 'value',
    seriesField: 'name',
    label: {
      position: 'top',
    },
  };
  // @ts-ignore
  return <Column {...config} />;
};

const PROJECT_TABS = [
  {
    key: 'all',
    label: 'All projects',
  },
  {
    key: 'inProgress',
    label: 'Active',
  },
  {
    key: 'onHold',
    label: 'On Hold',
  },
];

const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)));
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};


const useFetchUserProfile = () => {
    const { data, error, loading } = useFetchData(
        'http://localhost:8080/api/v1/users/profile',
        localStorage.getItem('accessToken') || undefined
    );
    return { userData: data?.data?.user, userError: error, userLoading: loading };
};


export const ProjectsDashboardPage = () => {
  const {
    data: projectsData,
    error: projectsDataError,
    loading: projectsDataLoading,
  } = useFetchData('../mocks/Projects.json');
  const {
    data: clientsData,
    error: topClientsError,
    loading: topClientsLoading,
  } = useFetchTopClients(5);
  const [projectTabsKey, setProjectsTabKey] = useState<string>('all');
  const { data: eventsData, error: eventsError, loading: eventsLoading, fetchData } = useFetchOrganizedEventsData();
  const getFilteredEvents = (status?: string) => {
    return (eventsData || []).filter((event: Events) => status ? event.status === status : true);
  };

  const PROJECT_TABS_CONTENT: Record<string, React.ReactNode> = {
    all: <ProjectsTable key="all-projects-table" data={projectsData} />,
    inProgress: (
      <ProjectsTable
        key="in-progress-projects-table"
        data={projectsData.filter((_: Projects) => _.status === 'in progress')}
      />
    ),
    onHold: (
      <ProjectsTable
        key="on-hold-projects-table"
        data={projectsData.filter((_: Projects) => _.status === 'on hold')}
      />
    ),
  };

  const onProjectsTabChange = (key: string) => {
    setProjectsTabKey(key);
  };

  const { data: dashboardStats, error: dashboardStatsError, loading: dashboardStatsLoading } = useFetchData(
    'http://localhost:8080/api/v1/events/dashboard-stats',
    localStorage.getItem('accessToken') || undefined
  );

  const { userData, userError, userLoading: profileLoading } = useFetchUserProfile();
  const [onlineTime, setOnlineTime] = useState<string>('00:00:00');

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (userData?.lastLoginAt) {
      const lastLogin = new Date(userData.lastLoginAt).getTime();
      intervalId = setInterval(() => {
        const now = Date.now();
        const diff = now - lastLogin;
        setOnlineTime(() => formatTime(diff));
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userData?.lastLoginAt]);


  return (
    <div>
      <Helmet>
        <title>Projects | Dashboard</title>
      </Helmet>
      <PageHeader
        title="projects dashboard"
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
                <span>dashboards</span>
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
            title: 'projects',
          },
        ]}
      />
      <Row
        gutter={[
          { xs: 8, sm: 16, md: 24, lg: 32 },
          { xs: 8, sm: 16, md: 24, lg: 32 },
        ]}
      >
        <Col xs={24} sm={12} lg={6}>
          <RevenueCard
            title="Total Events"
            value={dashboardStats?.data?.totalEventsCount || 0}
            diff={280}
            loading={dashboardStatsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <RevenueCard
            title="Events Created"
            value={dashboardStats?.data?.organizedEventsCount || 0}
            diff={180}
            loading={dashboardStatsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <RevenueCard
            title="Total Categories"
            value={dashboardStats?.data?.totalEventCategoriesCount || 0}
            diff={0}
            loading={dashboardStatsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <RevenueCard
            title="Online Time"
            value={onlineTime}
            diff={0}  
            loading={profileLoading}
          />
        </Col>
        <Col span={24}>
          <Card
            title="Recently added events"
          >
            {eventsError && (
              <Alert
                message="No events participated yet."
                type="info"
                showIcon
              />
            )}
            {eventsLoading ? (
              <Loader />
            ) : (
              <Row gutter={[16, 16]}>
                {getFilteredEvents().slice(0, 4).map((o: Events) => {
                  return (
                    <Col xs={24} sm={12} xl={6} key={o.id}>
                      <EventsCard
                        event={o}
                        type="inner"
                        style={{ height: '100%' }}
                      />
                    </Col>
                  );
                })}
              </Row>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={16}>
          <Card
            title="Project stats"
            extra={
              <Segmented
                options={['Daily', 'Monthly', 'Yearly']}
              />
            }
          >
            <RevenueColumnChart />
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <Card title="Top clients">
            {topClientsError ? ( // use topClientsError
              <Alert
                message="Error"
                description={topClientsError.toString()} // use topClientsError
                type="error"
                showIcon
              />
            ) : topClientsLoading ? ( // use topClientsLoading
              <Loader />
            ) : (
              <ClientsTable data={clientsData} /> // use clientsData (fetched from useFetchTopClients)
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
