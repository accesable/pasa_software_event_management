import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { useStylesContext } from '../../context';
import { Helmet } from 'react-helmet-async';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import {
    Alert,
    Col,
    Row,
    Table,
} from 'antd';
  import {
    Card,   
    PageHeader,
} from '../../components';
import {
  EventTable
} from '../../components/dashboard';
import { useFetchData } from '../../hooks';


const EventsDashboardPage = () => {
    const stylesContext = useStylesContext();
    const {
        data: events,
        error: eventsError,
        loading: eventsLoading,
      } = useFetchData('../mocks/Events.json');
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
            title: 'events',
          },
        ]}
      />
      <Row {...stylesContext?.rowProps}>
      <Col span={24}>
          <EventTable data={events} loading={eventsLoading} error={eventsError} />
        </Col>
      </Row>
    </div>
  )
}

export default EventsDashboardPage