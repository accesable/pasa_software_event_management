// src\components\dashboard\events\MyEventTable.tsx
import {
  Badge,
  BadgeProps,
  Button,
  Popconfirm,
  Space,
  Spin,
  Table,
  TableProps,
  Tag,
  Typography,
  message,
  Flex,
} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import authService from '../../../services/authService';
import { Events } from '../../../types';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

type Props = {
  data: Events[];
  loading: boolean;
  fetchData: () => void;
  activeTabKey: string;
} & TableProps<Events>;

export const MyEventsTable = ({ data, loading, fetchData, activeTabKey, ...others }: Props) => {
  const [categoryNamesMap, setCategoryNamesMap] = useState<Record<string, string>>({});
  const [categoryLoading, setCategoryLoading] = useState(false);
  const navigate = useNavigate();
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    const fetchCategoryNames = async () => {
      if (!data || data.length === 0) return; // Exit if no events data

      setCategoryLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          message.error("No access token found. Please login again.");
          return;
        }

        const newCategoryNamesMap: Record<string, string> = {};
        // Fetch category name for each event
        for (const event of data) {
          if (event.categoryId) {
            try {
              const response = await authService.getCategoryById(event.categoryId, accessToken);
              const categoryResponse = response as { data: { category: { name: string } } };
              newCategoryNamesMap[event.categoryId] = categoryResponse.data.category.name;
            } catch (categoryError) {
              console.error(`Error fetching category name for categoryId ${event.categoryId}:`, categoryError);
              newCategoryNamesMap[event.categoryId] = 'N/A'; // Set to N/A in case of error for a specific category
            }
          }
        }
        setCategoryNamesMap(newCategoryNamesMap);
      } catch (error: any) {
        message.error(error.error);
        setCategoryNamesMap({}); // Clear the map in case of a general error
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategoryNames();
  }, [data]);

  const COLUMNS = (navigate: ReturnType<typeof useNavigate>, _setLoading: (loading: boolean) => void, fetchData: () => void): ColumnsType<Events> => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'proj_name',
      render: (_: any, record: Events) => (
        <Typography.Paragraph
          ellipsis={{ rows: 1 }}
          className="text-capitalize"
          style={{ marginBottom: 0, maxWidth: 150 }} // Thêm maxWidth để giới hạn chiều rộng và ellipsis
        >
          <Link to={`/details/my-events/${record.id}`}> {/* Thay đổi Link ở đây */}
            {_.length > 20 ? `${_.slice(0, 20)}...` : _}
          </Link>
        </Typography.Paragraph>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'event_category',
      responsive: ['md'], // Ẩn trên màn hình nhỏ hơn md
      render: (categoryId: string) => { // Changed render to receive categoryId
        return (
          <Space>
            {categoryLoading ? (
              <Spin />
            ) : (
              <Tag color="blue">{categoryNamesMap[categoryId] || 'N/A'}</Tag> // Use categoryNamesMap to get the name
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'proj_status',
      responsive: ['md'], // Ẩn trên màn hình nhỏ hơn md
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
      responsive: ['lg'], // Ẩn trên màn hình nhỏ hơn lg
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'event_start_date',
      responsive: ['lg'], // Ẩn trên màn hình nhỏ hơn lg
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : 'N/A', // Thêm định dạng DD/MM/YYYY HH:mm:ss
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'event_end_date',
      responsive: ['lg'], // Ẩn trên màn hình nhỏ hơn lg
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : 'N/A', // Thêm định dạng DD/MM/YYYY HH:mm:ss
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'event_actions',
      render: (eventId: string, record: Events) => {
        return (
          <Flex gap="small" vertical={true} wrap="wrap" justify="center"> {/* Sử dụng Flex container */}
            <Button type="primary" size="small" onClick={() => navigate(`/details/my-events/${record.id}`)}>
              Details
            </Button>

            <Button type="primary" size="small" onClick={() => navigate(`/edit/events/${record.id}`)}>
              Update
            </Button>


            <Popconfirm
              title="Cancel Event"
              description="Are you sure to cancel this event?"
              onConfirm={() => handleCancel(eventId, setTableLoading, fetchData)}
              onCancel={() => message.info('Cancel cancel')}
              okText="Yes, Cancel"
              cancelText="No"
            >
              <Button danger size="small">
                Cancel
              </Button>
            </Popconfirm>

          </Flex>
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
      columns={COLUMNS(navigate, setTableLoading, fetchData)}
      className="overflow-scroll"
      loading={loading || tableLoading || categoryLoading} // Include categoryLoading in table loading
      {...others}
    />
  );
};
