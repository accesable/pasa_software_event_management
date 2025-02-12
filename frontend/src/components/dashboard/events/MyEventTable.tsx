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
} from 'antd';
import { useNavigate } from 'react-router-dom';
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
  const [categoryNamesMap, setCategoryNamesMap] = useState<Record<string, string>>({}); // State to store category names by categoryId
  const [categoryLoading, setCategoryLoading] = useState(false); // Loading state
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

  const COLUMNS = (navigate: ReturnType<typeof useNavigate>, _setLoading: (loading: boolean) => void, fetchData: () => void, activeTabKey: string): ColumnsType<Events> => [
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
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : 'N/A', // Thêm định dạng DD/MM/YYYY HH:mm:ss
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'event_end_date',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : 'N/A', // Thêm định dạng DD/MM/YYYY HH:mm:ss
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'event_actions',
      render: (eventId: string, record: Events) => {
        return (
          <Space size="small">
            <Button type="primary" onClick={() => navigate(`/details/my-events/${record.id}`)}> {/* Đã sửa URL navigate */}
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
      loading={loading || tableLoading || categoryLoading} // Include categoryLoading in table loading
      {...others}
    />
  );
};
