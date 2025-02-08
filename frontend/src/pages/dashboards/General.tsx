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
    {
      country: 'Online Store',
      date: 'Jan',
      value: 1390.5,
    },
    {
      country: 'Online Store',
      date: 'Feb',
      value: 1469.5,
    },
    {
      country: 'Online Store',
      date: 'Mar',
      value: 1521.7,
    },
    {
      country: 'Online Store',
      date: 'Apr',
      value: 1615.9,
    },
    {
      country: 'Online Store',
      date: 'May',
      value: 1703.7,
    },
    {
      country: 'Online Store',
      date: 'Jun',
      value: 1767.8,
    },
    {
      country: 'Online Store',
      date: 'Jul',
      value: 1806.2,
    },
    {
      country: 'Online Store',
      date: 'Aug',
      value: 1903.5,
    },
    {
      country: 'Online Store',
      date: 'Sept',
      value: 1986.6,
    },
    {
      country: 'Online Store',
      date: 'Oct',
      value: 1952,
    },
    {
      country: 'Online Store',
      date: 'Nov',
      value: 1910.4,
    },
    {
      country: 'Online Store',
      date: 'Dec',
      value: 2015.8,
    },
    {
      country: 'Facebook',
      date: 'Jan',
      value: 109.2,
    },
    {
      country: 'Facebook',
      date: 'Feb',
      value: 115.7,
    },
    {
      country: 'Facebook',
      date: 'Mar',
      value: 120.5,
    },
    {
      country: 'Facebook',
      date: 'Apr',
      value: 128,
    },
    {
      country: 'Facebook',
      date: 'May',
      value: 134.4,
    },
    {
      country: 'Facebook',
      date: 'Jun',
      value: 142.2,
    },
    {
      country: 'Facebook',
      date: 'Jul',
      value: 157.5,
    },
    {
      country: 'Facebook',
      date: 'Aug',
      value: 169.5,
    },
    {
      country: 'Facebook',
      date: 'Sept',
      value: 186.3,
    },
    {
      country: 'Facebook',
      date: 'Oct',
      value: 195.5,
    },
    {
      country: 'Facebook',
      date: 'Nov',
      value: 198,
    },
    {
      country: 'Facebook',
      date: 'Dec',
      value: 211.7,
    },
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
//     {
//       type: 'Appliances',
//       value: 27,
//     },
//     {
//       type: 'Electronics',
//       value: 25,
//     },
//     {
//       type: 'Clothing',
//       value: 18,
//     },
//     {
//       type: 'Shoes',
//       value: 15,
//     },
//     {
//       type: 'Food',
//       value: 10,
//     },
//     {
//       type: 'Cosmetice',
//       value: 5,
//     },
//   ];

//   const config = {
//     appendPadding: 10,
//     data,
//     angleField: 'value',
//     colorField: 'type',
//     radius: 1,
//     innerRadius: 0.5,
//     label: {
//       type: 'inner',
//       offset: '-50%',
//       content: '{value}%',
//       style: {
//         textAlign: 'center',
//         fontSize: 16,
//       },
//     },
//     interactions: [
//       {
//         type: 'element-selected',
//       },
//       {
//         type: 'element-active',
//       },
//     ],
//     statistic: {
//       title: false,
//       content: {
//         style: {
//           whiteSpace: 'pre-wrap',
//           overflow: 'hidden',
//           textOverflow: 'ellipsis',
//           fontSize: 18,
//         },
//         content: '18,935\nsales',
//       },
//     },
//   };

//   // @ts-ignore
//   return <Pie {...config} />;
// };

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
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Visitors"
                value={20149}
                diff={5.54}
                height={180}
                justify="space-between"
              />
            </Col>
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Customers"
                value={5834}
                diff={-12.3}
                height={180}
                justify="space-between"
              />
            </Col>
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Orders"
                value={3270}
                diff={9.52}
                height={180}
                justify="space-between"
              />
            </Col>
            <Col xs={24} sm={12}>
              <RevenueCard
                title="Sales"
                value="$ 1.324K"
                diff={2.34}
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
            title="Overall sales"
            extra={
              <Popover content="Total sales over period x" title="Total sales">
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
