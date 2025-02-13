import {
  Button,
  ButtonProps,
  Col,
  Popover,
  Row,
} from 'antd';
import {
  Card,
  CustomerReviewsCard,
  PageHeader,
  RevenueCard,
} from '../../components';
import {
  HomeOutlined,
  PieChartOutlined,
  QuestionOutlined,
} from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStylesContext } from '../../context';
import { CSSProperties } from 'react';
import { useFetchData } from '../../hooks';
import { CategoriesChart, EventsOverTimeChart } from '../../components/dashboard/default';

const POPOVER_BUTTON_PROPS: ButtonProps = {
  type: 'text',
};

const cardStyles: CSSProperties = {
  height: '100%',
};

export const GeneralDashboardPage = () => {
  const stylesContext = useStylesContext();

  const { data: dashboardStats, loading: dashboardStatsLoading } = useFetchData(
    'http://localhost:8080/api/v1/events/dashboard-stats', // API URL
    localStorage.getItem('accessToken') || undefined // Access token
  );

  return (
    <div>
      <Helmet>
        <title>General | Dashboard</title>
      </Helmet>
      <PageHeader
        title="general dashboard"
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
            title: 'general',
          },
        ]}
      />
      <Row {...stylesContext?.rowProps}>
        <Col sm={24} lg={16}>
          <Row {...stylesContext?.rowProps}>
            {/* RevenueCard cho số sự kiện người đó đã tổ chức */}
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Organized Events"
                value={dashboardStats?.data?.organizedEventsCount || 0} // Use fetched data, default to 0 if loading/error
                diff={3.2} // Để giá trị mặc định hoặc tính toán nếu có dữ liệu diff từ API
                height={180}
                justify="space-between"
                loading={dashboardStatsLoading} // Add loading state
              />
            </Col>
            {/* RevenueCard cho số sự kiện người đó tham dự */}
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Attended Events"
                value={dashboardStats?.data?.participatedEventsCount || 0} // Use fetched data
                diff={2.1}
                height={180}
                justify="space-between"
                loading={dashboardStatsLoading} // Add loading state
              />
            </Col>
            {/* RevenueCard cho số lượng speakers người đó đã tạo */}
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Speakers Created"
                value={dashboardStats?.data?.createdSpeakersCount || 0} // Use fetched data
                diff={5.5}
                height={180}
                justify="space-between"
                loading={dashboardStatsLoading} // Add loading state
              />
            </Col>
            {/* RevenueCard cho số lượng guest người đó đã tạo */}
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Guests Created"
                value={dashboardStats?.data?.createdGuestsCount || 0} // Use fetched data
                diff={1.7}
                height={180}
                justify="space-between"
                loading={dashboardStatsLoading} // Add loading state
              />
            </Col>
          </Row>
        </Col>
        <Col sm={24} lg={8} xs={24}>
          <CustomerReviewsCard />
        </Col>
        <Col xs={24} lg={12}>
          <EventsOverTimeChart style={cardStyles} />
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Categories"
            extra={
              <Popover content="Sales per categories" title="Categories sales">
                <Button icon={<QuestionOutlined />} {...POPOVER_BUTTON_PROPS} />
              </Popover>
            }
            style={cardStyles}
          >
            <CategoriesChart /> {/* Use the updated CategoriesChart component */}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
