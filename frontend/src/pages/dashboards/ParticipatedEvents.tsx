// src\pages\dashboards\ParticipatedEventsPage.tsx
import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Space,
  Spin,
  Select,
  message,
  Popconfirm,
  Flex,
  Typography,
  Tag,
} from 'antd';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from '../../components';
import { ColumnsType } from 'antd/es/table';
import { Events } from '../../types';
import dayjs from 'dayjs';
import useFetchParticipatedEventsData from '../../hooks/useFetchParticipatedEventsData';
import authService from '../../services/authService';
import { DASHBOARD_ITEMS } from '../../constants';
import { MyEventsTable } from '../../components/dashboard/events/MyEventTable'; // Đảm bảo import MyEventsTable

const EVENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CANCELED', label: 'Canceled' },
  { value: 'FINISHED', label: 'Finished' },
];

const ParticipatedEventsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: eventsData, loading: eventsLoading, fetchData } =
    useFetchParticipatedEventsData(statusFilter === 'all' ? undefined : statusFilter);
  const [actionLoading, setActionLoading] = useState(false);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const [loadingCategories, setLoadingCategories] = useState(false);

  const onStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const isEmptyData = eventsData?.events === undefined || eventsData?.events?.length === 0;

  useEffect(() => {
    const fetchCategoryName = async (event: Events) => {
      if (!event?.categoryId) return;
      if (categories[event.categoryId]) return;
      setLoadingCategories(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getCategoryById(event.categoryId, accessToken || '');
        const categoryResponse = response as { data: { category: { name: string } } };
        setCategories((prev) => ({
          ...prev,
          [event.categoryId]: categoryResponse.data.category.name,
        }));
      } finally {
        setLoadingCategories(false);
      }
    };

    if (eventsData && eventsData.events) {
      eventsData.events.forEach((event: Events) => {
        fetchCategoryName(event);
      });
    }
  }, [eventsData, categories]);

  const handleLeaveEvent = async (eventId: string) => {
    setActionLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        message.error('No access token found. Please login again.');
        return;
      }

      const participantIdResponse = await authService.getParticipantIdByEventId(eventId, accessToken) as any;
      const participantId = participantIdResponse.data.participantId;

      const response = (await authService.unregisterEvent(
        participantId,
        accessToken
      )) as { statusCode: number; message: string; error?: string };

      if (response.statusCode === 200) {
        message.success(response.message);
        fetchData(statusFilter === 'all' ? undefined : statusFilter);
      } else {
        message.error(response.error || 'Failed to unregister from event');
      }
    } catch (error: any) {
      console.error('Error unregistering from event:', error);
      message.error(error.error || 'Failed to unregister from event');
    } finally {
      setActionLoading(false);
    }
  };

  // Định nghĩa COLUMNS_PARTICIPATED_EVENTS ở đây
  const COLUMNS_PARTICIPATED_EVENTS: ColumnsType<Events> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',

      render: (text, record) => <Typography.Paragraph ellipsis><Link to={`/details/participated-events/${record.id}`}>{
        text?.length > 20 ? `${text.slice(0, 20)}...` : text
      }</Link></Typography.Paragraph>, // Added ellipsis
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      responsive: ['md'], // Hide on smaller screens
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      responsive: ['sm'], // Hide on xs
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      responsive: ['sm'], // Hide on xs
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'categoryId',
      render: (categoryId: string) => (
        <Space>
          {loadingCategories ? <Spin /> : <Tag color="blue">{categories[categoryId] || 'N/A'}</Tag>}
        </Space>
      ),
      responsive: ['md'], // Hide on smaller screens
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'SCHEDULED' ? 'blue' : status === 'CANCELED' ? 'red' : 'green'}>
          {status}
        </Tag>
      ),
      responsive: ['md'],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Flex vertical gap="small" align="center"> {/* Sử dụng Flex vertical và align center */}
          <Button type="primary" size="small"> {/* Đảm bảo size="small" */}
            <Link to={`/details/participated-events/${record.id}`}>Details</Link>
          </Button>
          <Popconfirm
            title="Unregister Event"
            description="Are you sure to unregister from this event?"
            onConfirm={() => handleLeaveEvent(record.id)}
            onCancel={() => message.info('Cancel')}
            okText="Yes, Unregister"
            cancelText="No"
            placement="topRight"
            overlayInnerStyle={{ width: 200 }}
          >
            <Button danger size="small">Cancel</Button>  {/* Đảm bảo size="small" */}
          </Popconfirm>
        </Flex>
      ),
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Participated Events | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="Participated Events"
        breadcrumbs={[
          {
            title: (
              <>
                <HomeOutlined />
                <span>Home</span>
              </>
            ),
            path: '/',
          },
          {
            title: (
              <>
                <PieChartOutlined />
                <span>Dashboards</span>
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
            title: 'Participated Events',
          },
        ]}
      />

      <Card
        title="List of Participated Events"
        extra={
          <Flex wrap="wrap" gap="small" align="center"> {/* Use Flex for responsive filters */}
            <Select
              defaultValue="all"
              style={{ minWidth: 150, width: 'auto' }} // Responsive width
              onChange={onStatusFilterChange}
              options={EVENT_STATUS_OPTIONS}
            />
          </Flex>
        }
      >
        {isEmptyData ? (
          <Alert message="No events participated yet." type="info" showIcon />
        ) : (
          <div className="table-responsive"> {/* Responsive table wrapper */}
            <MyEventsTable
              columns={COLUMNS_PARTICIPATED_EVENTS} // Pass COLUMNS_PARTICIPATED_EVENTS ở đây
              data={eventsData?.events || []}
              loading={eventsLoading || actionLoading}
              fetchData={() => fetchData(statusFilter === 'all' ? undefined : statusFilter)}
              activeTabKey={statusFilter === 'all' ? 'all' : statusFilter}
              {...{
                pagination: {
                  current: currentPage,
                  pageSize: pageSize,
                  total: eventsData?.meta?.totalItems || 0,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showSizeChanger: true,
                  onChange: handlePaginationChange,
                },
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ParticipatedEventsPage;
