import { useParams } from 'react-router-dom';
import {
  Col,
  Flex,
  Image,
  Row,
  Typography,
} from 'antd';
import { Card } from '../../components';
import { useStylesContext } from '../../context';
import {
  EventTimelineCard,
  MyEventTimelineCard
} from '../../components/dashboard';
import { useFetchData } from '../../hooks';
import { ActivityTable } from '../../components/dashboard/events';
const { Title, Text, Paragraph } = Typography;

export const DetailMyEventPage = () => {
    const { id } = useParams<{ id: string }>();
    const stylesContext = useStylesContext();
    const {
      data: timelineData,
      loading: timelineDataLoading,
      error: timelineDataError,
    } = useFetchData('../../mocks/scheduleTimeline.json');
    const {
      data: activitiesTableData,
      loading: activitiesTableLoading,
      error: activitiesTableError,
    } = useFetchData('../../mocks/PaticipatedActivities.json');
  return (
    <div>
      <Row {...stylesContext?.rowProps}>
        <Col span={24}>
          <Card title={<Title level={3}>About This Event (Event ID : {id})</Title>}>
            <Flex gap="small" vertical>
              <Text>Job Fair 101.</Text>
              <Image
                src='https://mvdirona.com/cache/433x324-0/trips/seattle2022/images/PXL_20221118_225253182_2.web.jpg'
                alt="event banner"
                width="100%"
              />
              <Paragraph>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Non
                tellus orci ac auctor augue mauris augue. Id diam vel quam
                elementum pulvinar. Nunc scelerisque viverra mauris in. Tortor
                aliquam nulla facilisi cras fermentum odio eu. Eleifend mi in
                nulla posuere sollicitudin aliquam ultrices. Quis commodo odio
                aenean sed adipiscing diam donec adipiscing tristique. Pharetra
                magna ac placerat vestibulum lectus mauris ultrices. Viverra
                accumsan in nisl nisi scelerisque eu ultrices vitae. Etiam
                tempor orci eu lobortis elementum nibh tellus molestie nunc.
                Iaculis eu non diam phasellus vestibulum lorem sed risus
                ultricies. Vestibulum lectus mauris ultrices eros in cursus
                turpis. Risus nec feugiat in fermentum posuere urna nec. Nam at
                lectus urna duis.
              </Paragraph>
              <Paragraph>
                Sit amet purus gravida quis blandit turpis cursus. Vulputate eu
                scelerisque felis imperdiet proin fermentum leo vel orci. Fusce
                id velit ut tortor pretium viverra suspendisse potenti.
              </Paragraph>
            </Flex>
          </Card>
        </Col>
        <Col span={24}>
          <MyEventTimelineCard 
                title="Event's Activities"
                data={timelineData}
                loading={timelineDataLoading}
                error={timelineDataError}
          />
        </Col>
        <Col span={24}>
          <ActivityTable
            data={activitiesTableData}
            loading={activitiesTableLoading}
            error={activitiesTableError}
          />
        </Col>
      </Row>
    </div>
  )
}
