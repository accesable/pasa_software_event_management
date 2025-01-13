import {
    Badge,
    BadgeProps,
    Table,
    TableProps,
    Tag,
    TagProps,
    Typography,
  } from 'antd';
import { Events } from '../../../types';  
  const COLUMNS = [
    {
      title: 'Name',
      dataIndex: 'event_name',
      key: 'proj_name',
      render: (_: any, { event_name }: Events) => (
        <Typography.Paragraph
          ellipsis={{ rows: 1 }}
          className="text-capitalize"
          style={{ marginBottom: 0 }}
        >
          {event_name.substring(0, 20)}
        </Typography.Paragraph>
      ),
    },
    // {
    //   title: 'Client',
    //   dataIndex: 'client_name',
    //   key: 'proj_client_name',
    // },
    {
      title: 'Category',
      dataIndex: 'event_category',
      key: 'event_category',
      render: (_: any) => <span className="text-capitalize">{_}</span>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'event_priority',
      render: (_: any) => {
        let color: TagProps['color'];
  
        if (_ === 'low') {
          color = 'cyan';
        } else if (_ === 'medium') {
          color = 'geekblue';
        } else {
          color = 'magenta';
        }
  
        return (
          <Tag color={color} className="text-capitalize">
            {_}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'proj_status',
      render: (_: any) => {
        let status: BadgeProps['status'];
  
        if (_ === 'Scheduled') {
          status = 'default';
        } else if (_ === 'Completed') {
          status = 'success';
        } else if (_ === "Postponed") {
          status = 'error';
        } else {
            status = 'processing'
        }
  
        return <Badge status={status} text={_} className="text-capitalize" />;
      },
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'event_capacity',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'event_start_date',
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'event_end_date',
    },
  ];
  
  type Props = {
    data: Events[];
  } & TableProps<any>;
  
  export const MyEventsTable = ({ data, ...others }: Props) => {
    return (
      <Table
        dataSource={data}
        columns={COLUMNS}
        className="overflow-scroll"
        {...others}
      />
    );
  };
  