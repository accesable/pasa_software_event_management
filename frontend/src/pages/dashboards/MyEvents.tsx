import { Alert, Button, Col, Row, Segmented, Space } from 'antd';
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
import { Projects } from '../../types';
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

export const MyEventDashboardPage = () => {
  const {
    data: projectsData,
    error: projectsDataError,
    loading: projectsDataLoading,
  } = useFetchData('../mocks/Projects.json');


  const [projectTabsKey, setProjectsTabKey] = useState<string>('all');

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
            {projectsDataError ? (
              <Alert
                message="Error"
                description={projectsDataError.toString()}
                type="error"
                showIcon
              />
            ) : projectsDataLoading ? (
              <Loader />
            ) : (
              <Row gutter={[16, 16]}>
                {projectsData.slice(0, 4).map((o: Projects) => {
                  return (
                    <Col xs={24} sm={12} xl={6} key={o.project_id}>
                      <ProjectsCard
                        project={o}
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
            title="Projects"
            extra={
              <Space>
                <Button icon={<CloudUploadOutlined />}>Import</Button>
                <Button icon={<PlusOutlined />}>New project</Button>
              </Space>
            }
            tabList={PROJECT_TABS}
            activeTabKey={projectTabsKey}
            onTabChange={onProjectsTabChange}
          >
            {PROJECT_TABS_CONTENT[projectTabsKey]}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
