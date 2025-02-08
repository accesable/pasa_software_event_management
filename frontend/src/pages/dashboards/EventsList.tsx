import React, { useEffect, useState, useMemo } from 'react';
import { Alert, Button, Card, Space, Table, Tag, Select, message, Spin } from 'antd';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader, Loader } from '../../components';
import useFetchData from '../../hooks/useFetchData';
import { ColumnsType } from 'antd/es/table';
import { Events } from '../../types';
import dayjs from 'dayjs';
import authService from '../../services/authService';

const EVENT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CANCELED', label: 'Canceled' },
  { value: 'FINISHED', label: 'Finished' },
];

const EventsListPage = () => {
  const [categoryName, setCategoryName] = useState<string | null>(null); // State for category name
  const [categoryLoading, setCategoryLoading] = useState(false); // Loading state for category
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: eventsData, error: eventsError, loading: eventsLoading } = useFetchData(
    `http://localhost:8080/api/v1/events?page=${currentPage}&limit=${pageSize}${statusFilter !== 'all' ? `&status=${statusFilter}` : ''}`,
    localStorage.getItem('accessToken') || undefined
  );

  // Khi eventsData thay đổi, fetch category name cho từng event (ví dụ, nếu bạn chỉ muốn lấy category cho các event đầu tiên)
  useEffect(() => {
    const fetchCategoryName = async (event: Events) => {
      if (!event?.categoryId) return;
      setCategoryLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getCategoryById(event.categoryId, accessToken || '');
        const categoryResponse = response as { data: { category: { name: string } } };
        setCategoryName(categoryResponse.data.category.name);
      } catch (error: any) {
        console.error('Error fetching category name:', error);
        message.error('Failed to load category name');
        setCategoryName('N/A');
      } finally {
        setCategoryLoading(false);
      }
    };

    eventsData?.data?.events.forEach((event: Events) => {
      fetchCategoryName(event);
    });
  }, [eventsData]);

  const onStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset page to 1 when filter changes
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // Định nghĩa các cột bảng bên trong component, để có thể sử dụng các biến state
  const columns: ColumnsType<Events> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/details/events/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'event_category',
      render: () => (
        <Space>
          {categoryLoading ? (
            <Spin />
          ) : (
            <Tag color="blue">{categoryName || 'N/A'}</Tag>
          )}
        </Space>
      ),
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
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" size="small">
            <Link to={`/details/events/${record.id}`}>Details</Link>
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Helmet>
        <title>Events List | Antd Dashboard</title>
      </Helmet>
      <PageHeader
        title="Events List"
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
            title: 'Events List',
          },
        ]}
      />

      <Card
        title="Events"
        extra={
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={onStatusFilterChange}
            options={EVENT_STATUS_OPTIONS}
          />
        }
      >
        {eventsError && (
          <Alert
            message="Error"
            description={eventsError.toString()}
            type="error"
            showIcon
            closable
          />
        )}

        <Table
          columns={columns}
          dataSource={eventsData?.data?.events || []}
          loading={eventsLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: eventsData?.data?.meta?.totalItems,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
            showSizeChanger: true,
            onChange: handlePaginationChange,
          }}
        />
      </Card>
    </div>
  );
};

export default EventsListPage;
