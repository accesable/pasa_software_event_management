import {
  Alert,
  Button,
  ButtonProps,
  Col,
  Flex,
  Image,
  Popover,
  Progress,
  Row,
  Space,
  Table,
  Tag,
  TagProps,
  Typography,
} from 'antd';
import {
  Card,
  CustomerReviewsCard,
  PageHeader,
  RevenueCard,
  UserAvatar,
} from '../../components';
import { Area, Bullet, Pie } from '@ant-design/charts';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  PieChartOutlined,
  QuestionOutlined,
  StarFilled,
  SyncOutlined,
} from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useStylesContext } from '../../context';
import { createElement, CSSProperties } from 'react';
import { useFetchData } from '../../hooks';
import { blue, green, red, yellow } from '@ant-design/colors';
import CountUp from 'react-countup';
import { numberWithCommas } from '../../utils';
import { CategoriesChart } from '../../components/dashboard/default';

const { Text, Title } = Typography;

const SalesChart = () => {
  const data = [
    { country: 'Online Store', date: 'Jan', value: 1390.5 },
    { country: 'Online Store', date: 'Feb', value: 1469.5 },
    { country: 'Online Store', date: 'Mar', value: 1521.7 },
    { country: 'Online Store', date: 'Apr', value: 1615.9 },
    { country: 'Online Store', date: 'May', value: 1703.7 },
    { country: 'Online Store', date: 'Jun', value: 1767.8 },
    { country: 'Online Store', date: 'Jul', value: 1806.2 },
    { country: 'Online Store', date: 'Aug', value: 1903.5 },
    { country: 'Online Store', date: 'Sept', value: 1986.6 },
    { country: 'Online Store', date: 'Oct', value: 1952 },
    { country: 'Online Store', date: 'Nov', value: 1910.4 },
    { country: 'Online Store', date: 'Dec', value: 2015.8 },
    { country: 'Facebook', date: 'Jan', value: 109.2 },
    { country: 'Facebook', date: 'Feb', value: 115.7 },
    { country: 'Facebook', date: 'Mar', value: 120.5 },
    { country: 'Facebook', date: 'Apr', value: 128 },
    { country: 'Facebook', date: 'May', value: 134.4 },
    { country: 'Facebook', date: 'Jun', value: 142.2 },
    { country: 'Facebook', date: 'Jul', value: 157.5 },
    { country: 'Facebook', date: 'Aug', value: 169.5 },
    { country: 'Facebook', date: 'Sept', value: 186.3 },
    { country: 'Facebook', date: 'Oct', value: 195.5 },
    { country: 'Facebook', date: 'Nov', value: 198 },
    { country: 'Facebook', date: 'Dec', value: 211.7 },
  ];

  const config = {
    data,
    xField: 'date',
    yField: 'value',
    seriesField: 'country',
    slider: {
      start: 0.1,
      end: 0.9,
    },
  };

  return <Area {...config} />;
};

const POPOVER_BUTTON_PROPS: ButtonProps = {
  type: 'text',
};

const cardStyles: CSSProperties = {
  height: '100%',
};

export const GeneralDashboardPage = () => {
  const stylesContext = useStylesContext();
  useFetchData('../mocks/TopProducts.json');

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
                value={15} // Số sự kiện đã tổ chức của người dùng (điều chỉnh theo dữ liệu BE)
                diff={3.2} // Thay đổi % so với kỳ trước (nếu có)
                height={180}
                justify="space-between"
              />
            </Col>
            {/* RevenueCard cho số sự kiện người đó tham dự */}
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Attended Events"
                value={8} // Số sự kiện người dùng tham dự
                diff={2.1}
                height={180}
                justify="space-between"
              />
            </Col>
            {/* RevenueCard cho số lượng speakers người đó đã tạo */}
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Speakers Created"
                value={12} // Số lượng speakers do người dùng tạo ra
                diff={5.5}
                height={180}
                justify="space-between"
              />
            </Col>
            {/* RevenueCard cho số lượng guest người đó đã tạo */}
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Guests Created"
                value={5} // Số lượng guest do người dùng tạo ra
                diff={1.7}
                height={180}
                justify="space-between"
              />
            </Col>
          </Row>
        </Col>
        <Col sm={24} lg={8}>
          <CustomerReviewsCard />
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title="Total Revenue"
            extra={
              <Popover content="Total revenue over period x" title="Total revenue">
                <Button icon={<QuestionOutlined />} {...POPOVER_BUTTON_PROPS} />
              </Popover>
            }
            style={cardStyles}
          >
            <Flex vertical gap="middle">
              <Space>
                <Title level={3} style={{ margin: 0 }}>
                  $ <CountUp end={24485.67} />
                </Title>
                <Tag color="green-inverse" icon={<ArrowUpOutlined />}>
                  8.7%
                </Tag>
              </Space>
              <SalesChart />
            </Flex>
          </Card>
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
