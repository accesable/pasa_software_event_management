// src\components\dashboard\events\MyEventTable.tsx
import {
  Badge,
  BadgeProps,
  Button,
  Popconfirm,
  Space,
  Table,
  TableProps,
  Tag,
  TagProps,
  Typography,
  message,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import authService from '../../../services/authService';
import { Events } from '../../../types';
import { ColumnsType } from 'antd/es/table';

type Props = {
  data: Events[];
  loading: boolean;
  fetchData: () => void;
  activeTabKey: string;
} & TableProps<Events>;

export const MyEventsTable = ({ data, loading, fetchData, activeTabKey, ...others }: Props) => {
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);

  const COLUMNS = (navigate: ReturnType<typeof useNavigate>, setLoading: (loading: boolean) => void, fetchData: () => void, activeTabKey: string): ColumnsType<Events> => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'proj_name',
      render: (_: any, record: Events) => (
        <Typography.Paragraph
          ellipsis={{ rows: 1 }}
          className="text-capitalize"
          style={{ marginBottom: 0 }}
        >
          {record.name?.substring(0, 20)}
        </Typography.Paragraph>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'event_category',
      render: (_: any) => <span className="text-capitalize">{_}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'proj_status',
      render: (_: any) => {
        let status: BadgeProps['status'];

        if (_ === 'SCHEDULED') {
          status = 'default';
        } else if (_ === 'FINISHED') {
          status = 'success';
        } else if (_ === "CANCELED") {
          status = 'error';
        } else {
          status = 'processing'
        }

        return <Badge status={status} text={_} className="text-capitalize" />;
      },
    },
    {
      title: 'Capacity',
      dataIndex: 'maxParticipants',
      key: 'event_capacity',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'event_start_date',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'event_end_date',
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'event_actions',
      render: (eventId: string, record: Events) => {
        return (
          <Space size="small">
            <Button type="primary" onClick={() => navigate(`/details/events/${record.id}`)}> {/* Đã sửa URL navigate */}
              Details
            </Button>
            {activeTabKey !== 'CANCELED' && activeTabKey !== 'FINISHED' && (
              <Button type="primary" onClick={() => navigate(`/edit/events/${record.id}`)}>
                Update
              </Button>
            )}
            {activeTabKey !== 'CANCELED' && activeTabKey !== 'FINISHED' && (
              <Popconfirm
                title="Cancel Event"
                description="Are you sure to cancel this event?"
                onConfirm={() => handleCancel(eventId, setTableLoading, fetchData)}
                onCancel={() => message.info('Cancel cancel')}
                okText="Yes, Cancel"
                cancelText="No"
                placement="topRight" // Thử thay đổi placement
                overlayInnerStyle={{ width: 300 }} // Thử set width
              >
                <Button danger>
                  Cancel
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const handleCancel = async (eventId: string, setLoading: (loading: boolean) => void, fetchData: () => void) => {
    setLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error("No access token found. Please login again.");
        return;
      }

      const response = await authService.deleteEvent(eventId, accessToken) as { statusCode: number, message: string };
      if (response.statusCode === 200) {
        message.success(response.message);
        fetchData();
      } else {
        message.error(response.message || 'Failed to cancel event');
      }
    } catch (error: any) {
      console.error('Error canceling event:', error);
      message.error(error.message || 'Failed to cancel event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Table
      rowKey="id"
      dataSource={data}
      columns={COLUMNS(navigate, setTableLoading, fetchData, activeTabKey)}
      className="overflow-scroll"
      loading={loading || tableLoading}
      {...others}
    />
  );
};