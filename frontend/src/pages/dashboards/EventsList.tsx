// src/pages/dashboards/EventsList.tsx
import { useEffect, useState } from 'react';
import { Alert, Button, Card, Space, Table, Tag, Select, Spin, Input } from 'antd';
import { HomeOutlined, PieChartOutlined } from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PageHeader } from '../../components';
import useFetchData from '../../hooks/useFetchData';
import { ColumnsType } from 'antd/es/table';
import { Events } from '../../types';
import dayjs from 'dayjs';
import authService from '../../services/authService';

const EVENT_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CANCELED', label: 'Canceled' },
  { value: 'FINISHED', label: 'Finished' },
];

const EventsListPage = () => {
  const [categoryNamesMap, setCategoryNamesMap] = useState<Record<string, string>>({});
  const [categoryLoading, setCategoryLoading] = useState(false);
  // Use '' (empty string) to represent "All" filters.
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<string>(''); // '' means All Categories
  const [searchQuery, setSearchQuery] = useState<string>(''); // State for search query

  const {
    data: eventsListResponse,
    error: eventsError,
    loading: eventsLoading,
  } = useFetchData( 
    `http://47.129.247.0:8080/api/v1/events?page=${currentPage}&limit=${pageSize}` +
    `${statusFilter ? `&status=${statusFilter}` : ''}` +
    `${categoryFilter ? `&categoryId=${categoryFilter}` : ''}` +
    `${searchQuery ? `&search=${searchQuery}` : ''}`,
    localStorage.getItem('accessToken') || undefined
  );

  useEffect(() => {
    const fetchAllCategoryNames = async () => {
      setCategoryLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getCategories(accessToken || '') as { statusCode: number; data: { categories?: any[] }; message?: string };
        if (response.statusCode === 200 && response.data.categories) {
          const categoryMap: Record<string, string> = {};
          categoryMap[''] = 'All Categories'; // Add "All Categories" option with empty string key
          response.data.categories.forEach((category: any) => {
            categoryMap[category.id] = category.name;
          });
          setCategoryNamesMap(categoryMap);
        } else {
          // message.error(response.message);
        }
      } catch (error: any) {
        // message.error(error.message);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchAllCategoryNames();
  }, []);

  const onStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const onCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

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
      render: (categoryId: string) => (
        <Space>
          {categoryLoading ? (
            <Spin />
          ) : (
            <Tag color="blue">{categoryNamesMap[categoryId] || 'N/A'}</Tag>
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

  const categoryOptions = Object.entries(categoryNamesMap).map(([key, label]) => ({
    value: key, // key is '' for "All Categories"
    label: label,
  }));

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
          <Space>
            <Select
              placeholder="Filter by Category"
              allowClear
              style={{ width: 200 }}
              onChange={onCategoryFilterChange}
              options={categoryOptions}
              value={categoryFilter}
            />
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: 200 }}
              onChange={onStatusFilterChange}
              options={EVENT_STATUS_OPTIONS}
              value={statusFilter}
            />
            <Input.Search
              placeholder="Search by event name"
              onSearch={handleSearch}
              style={{ width: 300 }}
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Space>
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
          dataSource={eventsListResponse?.data?.events || []}
          loading={eventsLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: eventsListResponse?.data?.meta?.totalItems,
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
