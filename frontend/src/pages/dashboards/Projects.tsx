// src\pages\dashboards\Projects.tsx
import { Alert, Button, Col, Row, Segmented, Space, Typography } from 'antd';
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
import { useState } from 'react';
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

    /** set color */
    // color: ['#1ca9e6', '#f88c24'],

    /** Set spacing */
    // marginRatio: 0.1,
    label: {
      // Label data label position can be manually configured
      position: 'middle',
      // 'top', 'middle', 'bottom'
      // Configurable additional layout method
      layout: [
        // Column chart data label position automatically adjusted
        {
          type: 'interval-adjust-position',
        }, // Data label anti-obstruction
        {
          type: 'interval-hide-overlap',
        }, // Data label text color automatically adjusted
        {
          type: 'adjust-color',
        },
      ],
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

export const ProjectsDashboardPage = () => {
  const {
    data: projectsData,
    error: projectsDataError,
    loading: projectsDataLoading,
  } = useFetchData('../mocks/Projects.json');
  const {
    data: clientsData, // rename to topClientsData to avoid confusion
    error: topClientsError, // rename to topClientsError
    loading: topClientsLoading, // rename to topClientsLoading
  } = useFetchTopClients(5); // use useFetchTopClients hook to fetch top clients
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
          <RevenueCard title="Total revenue" value={1556.3} diff={280} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <RevenueCard title="Spent this week" value={1806.3} diff={180} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <RevenueCard title="Worked this week" value="35:12" diff={-10.0} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <RevenueCard title="Worked today" value="05:30:00" diff={-20.1} />
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
