import { Alert, Button, Col, Row, Segmented, Space } from 'antd';
import {
  Card,
  Loader,
  PageHeader,
  ProjectsCard,
  ProjectsTable,
  RevenueCard,
} from '../../components';
import { Column } from '@ant-design/charts';
import { Events, Projects } from '../../types';
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
import { MyEventsTable } from '../../components/dashboard/events/MyEventTable';


const EVENT_TABS = [
  {
    key: 'all',
    label: 'All events',
  },
  {
    key: 'OnGoing',
    label: 'Active',
  },
  {
    key: 'Postponed',
    label: 'Delaying',
  },
];

export const MyEventDashboardPage = () => {

  const {
    data: eventsData,
    error: eventsDataError,
    loading: eventsDataLoading,
  } = useFetchData('../mocks/MyEvents.json');

  const [eventTabKey, setEventTabKey] = useState<string>('all');

  const EVENT_TABS_CONTENT: Record<string, React.ReactNode> = {
    all: <MyEventsTable key="all-projects-table" data={eventsData} />,
    OnGoing: (
      <MyEventsTable
        key="in-progress-projects-table"
        data={eventsData.filter((_: Events) => _.status === 'On Going')}
      />
    ),
    Postponed: (
      <MyEventsTable
        key="on-hold-projects-table"
        data={eventsData.filter((_: Events) => _.status === 'Postponed')}
      />
    ),
  };

  const onEventTabChange = (key: string) => {
    setEventTabKey(key);
  };

  return (
    <div>
      <Helmet>
        <title>My Events | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="your event dashboard"
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
        {/* <Col xs={24} sm={12} lg={6}>
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
        </Col> */}
        <Col span={24}>
          <Card
            title="Recently added events"
            // extra={<Button>View all projects</Button>}
          >
            {eventsDataError ? (
              <Alert
                message="Error"
                description={eventsDataError}
                type="error"
                showIcon
              />
            ) : eventsDataLoading ? (
              <Loader />
            ) : (
              <Row gutter={[16, 16]}>
                {eventsData.slice(0, 4).map((o: Events) => {
                  return (
                    <Col xs={24} sm={12} xl={6} key={o.event_id}>
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
        <Col span={24}>
          <Card
            title="Your Events"
            extra={
              <Space>
                <Button icon={<CloudUploadOutlined />}>Import</Button>
                <Button icon={<PlusOutlined />}>New Event</Button>
              </Space>
            }
            tabList={EVENT_TABS}
            activeTabKey={eventTabKey}
            onTabChange={onEventTabChange}
          >
            {EVENT_TABS_CONTENT[eventTabKey]}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
