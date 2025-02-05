import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { useStylesContext } from '../../context';
import { Helmet } from 'react-helmet-async';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import {
    Col,
    Row,
} from 'antd';
  import {
    PageHeader,
} from '../../components';
import {
  UserTable
} from '../../components/dashboard';
import { useFetchData } from '../../hooks';

export const UserDashboardPage = () => {
    const stylesContext = useStylesContext();
    const {
        data: users,
        error: usersError,
        loading: usersLoading,
      } = useFetchData('../mocks/MyUsers.json');
  return (
    <div>
      <Helmet>
        <title>Incomming Events | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="incomming events dashboard"
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
            title: 'users',
          },
        ]}
      />
      <Row {...stylesContext?.rowProps}>
      <Col span={24}>
          <UserTable data={users} loading={usersLoading} error={usersError} />
        </Col>
      </Row>
    </div>
  )
}