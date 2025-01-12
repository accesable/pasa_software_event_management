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
    // ClockCircleOutlined,
    UsergroupAddOutlined,
  } from '@ant-design/icons';
  import { Events } from '../../../../types';
  
  import './styles.css';
  
  const { Text, Title } = Typography;
  
  type Props = {
    event: Events;
    size?: 'small' | 'default';
  } & CardProps;
  
  export const EventsCard = (props: Props) => {
    const {
      size,
      event: {
        event_id,
        event_name,
        start_date,
        end_date,
        event_type,
        event_location,
        priority,
        capacity,
        status,
      },
      ...others
    } = props;
  
    const items: DescriptionsProps['items'] = [
      {
        key: 'event_name',
        label: 'Title',
        children: (
          <span className="text-capitalize">{event_name.slice(0, 36)}...</span>
        ),
        span: 24,
      },
      {
        key: 'event_id',
        label: 'Manager',
        children: event_id,
        span: 24,
      },
    //   {
    //     key: 'project_client',
    //     label: 'Client',
    //     children: client_name,
    //     span: 24,
    //   },
      {
        key: 'event_type',
        label: 'Type',
        children: <span className="text-capitalize">{event_type}</span>,
        span: 24,
      },
      {
        key: 'project_location',
        label: 'Location',
        children: event_location,
        span: 24,
      },
      {
        key: 'project_priority',
        label: 'Priority',
        children: <span className="text-capitalize">{priority}</span>,
      },
      {
        key: 'project_status',
        label: 'Status',
        children: <span className="text-capitalize">{status}</span>,
      },
      {
        key: 'team_size',
        label: <UsergroupAddOutlined />,
        children: (
          <Tooltip title="Team size">
            <Typography.Text>{capacity}</Typography.Text>
          </Tooltip>
        ),
      },
    //   {
    //     key: 'period',
    //     label: <ClockCircleOutlined />,
    //     children: (
    //       <Tooltip title="Project duration (months)">
    //         <Typography.Text>{project_duration}</Typography.Text>
    //       </Tooltip>
    //     ),
    //   },
      {
        key: 'start_date',
        label: <CalendarOutlined />,
        children: (
          <Tooltip title="Project date">
            <Typography.Text>{start_date} - {end_date}</Typography.Text>
          </Tooltip>
        ),
      },
    ];
  
    return size === 'small' ? (
      <AntdCard
        bordered
        hoverable={true}
        className="project-small-card"
        {...others}
      >
        <Title level={5} className="text-capitalize m-0">
          {event_name.slice(0, 15)}
        </Title>
        <br />
        <Flex wrap="wrap" gap="small" className="text-capitalize">
          {/* <Text>
            Owner: <b>{project_manager},</b>
          </Text>
          <Text>
            Client: <b>{client_name},</b>
          </Text> */}
          <Text>
            Priority: <b>{priority},</b>
          </Text>
          <Text>
            Type: <b>{event_type},</b>
          </Text>
          <Text>
            Location: <b>{event_location}</b>
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
  