// src\components\dashboard\shared\EventsCard\EventsCard.tsx
import {
  Card as AntdCard,
  CardProps,
  Descriptions,
  DescriptionsProps,
  Flex,
  Tooltip,
  Typography,
} from 'antd';
import {
  CalendarOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';

import './styles.css';
import { Events } from '../../../../types';

const { Text, Title } = Typography;

type Props = {
  event?: Events; // Make event prop optional
  size?: 'small' | 'default';
} & CardProps;

export const EventsCard = (props: Props) => {
  const {
    size,
    event, // Event can be potentially undefined
    ...others
  } = props;

  // Check if event is defined before accessing its properties
  const items: DescriptionsProps['items'] = event ? [
    {
      key: 'event_name',
      label: 'Title',
      children: (
        <span className="text-capitalize">{event.name?.slice(0, 36)}...</span> // Use optional chaining
      ),
      span: 24,
    },
    {
      key: 'event_id',
      label: 'ID',
      children: event.id,
      span: 24,
    },
    {
      key: 'event_type',
      label: 'Category', // Changed label to "Category"
      children: <span className="text-capitalize">{event.categoryId}</span>, // Changed to categoryId
      span: 24,
    },
    {
      key: 'project_location',
      label: 'Location',
      children: event.location,
      span: 24,
    },
    {
      key: 'project_status',
      label: 'Status',
      children: <span className="text-capitalize">{event.status}</span>,
    },
    {
      key: 'team_size',
      label: <UsergroupAddOutlined />,
      children: (
        <Tooltip title="Team size">
          <Typography.Text>{event.maxParticipants}</Typography.Text>
        </Tooltip>
      ),
    },
    {
      key: 'start_date',
      label: <CalendarOutlined />,
      children: (
        <Tooltip title="Project date">
          <Typography.Text>{event.startDate} - {event.endDate}</Typography.Text>
        </Tooltip>
      ),
    },
  ] : []; // Render empty descriptions if event is undefined


  return size === 'small' ? (
    <AntdCard
      bordered
      hoverable={true}
      className="project-small-card"
      {...others}
    >
      <Title level={5} className="text-capitalize m-0">
        {event?.name?.slice(0, 15)} {/* Use optional chaining here too */}
      </Title>
      <br />
      <Flex wrap="wrap" gap="small" className="text-capitalize">
        <Text>
          Category: <b>{event?.categoryId},</b> {/* Changed to categoryId */}
        </Text>
        <Text>
          Location: <b>{event?.location}</b>
        </Text>
      </Flex>
    </AntdCard>
  ) : (
    <AntdCard bordered hoverable={true} {...others}>
      <Descriptions
        items={items}
        column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
      />
    </AntdCard>
  );
};