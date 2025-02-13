// src/pages/dashboards/EventsList.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Space, Table, Tag, Select, Spin, Input, Flex, Typography } from 'antd'; // Import Flex and Typography
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
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    data: eventsListResponse,
    error: eventsError,
    loading: eventsLoading,
  } = useFetchData(
    `http://localhost:8080/api/v1/events?page=${currentPage}&limit=${pageSize}` +
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
          categoryMap[''] = 'All Categories';
          response.data.categories.forEach((category: any) => {
            categoryMap[category.id] = category.name;
          });
          setCategoryNamesMap(categoryMap);
        }
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
      render: (text, record) => <Typography.Paragraph ellipsis>
        <Link to={`/details/events/${record.id}`}>
          {text?.length > 15 ? `${text.slice(0, 15)}...` : text}
        </Link>
      </Typography.Paragraph>,
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
      responsive: ['sm'], // Hide on xs screens
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      responsive: ['sm'], // Hide on xs screens
    },
    {
      title: 'Category',
      dataIndex: 'categoryId',
      key: 'event_category',
      render: (categoryId: string) => (
        <Space>
          {categoryLoading ? <Spin /> : <Tag color="blue">{categoryNamesMap[categoryId] || 'N/A'}</Tag>}
        </Space>
      ),
      responsive: ['md'], // Hide on smaller screens
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      responsive: ['md'], 
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
    value: key,
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
          <Flex wrap="wrap" gap="small" align="center" style={{ marginTop: '10px' }}> {/* Use Flex for responsive filters */}
            <Select
              placeholder="Filter by Category"
              allowClear
              style={{ minWidth: 150, width: 'auto' }} // Adjust width for responsiveness
              onChange={onCategoryFilterChange}
              options={categoryOptions}
              value={categoryFilter}
            />
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ minWidth: 150, width: 'auto' }} // Adjust width for responsiveness
              onChange={onStatusFilterChange}
              options={EVENT_STATUS_OPTIONS}
              value={statusFilter}
            />
            <Input.Search
              placeholder="Search by event name"
              onSearch={handleSearch}
              style={{ minWidth: 200, width: 'auto' }} // Adjust width for responsiveness
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Flex>
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

        <div className="table-responsive"> {/* Add a wrapper for horizontal scroll */}
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
            scroll={{ x: 'max-content' }} // Enable horizontal scroll for table
          />
        </div>
      </Card>
    </div>
  );
};

export default EventsListPage;
