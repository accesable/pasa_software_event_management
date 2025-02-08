// src\pages\dashboards\EventsList.tsx
import React, { useEffect, useState, useCallback } from 'react';
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

interface EventsListResponse {
    data: {
        events: Events[];
        meta: {
            totalItems: number;
            // ... other meta properties if any ...
        };
    };
    statusCode: number;
    message: string;
}

const EVENT_STATUS_OPTIONS = [
  { value: undefined, label: 'All Statuses' }, // **[CHANGED]** value: undefined for "All Statuses"
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CANCELED', label: 'Canceled' },
  { value: 'FINISHED', label: 'Finished' },
];

const EventsListPage = () => {
  const [categoryNamesMap, setCategoryNamesMap] = useState<Record<string, string>>({}); // **[ADDED]** State for category names mapping
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined); // **[CHANGED]** statusFilter type to string | undefined
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: eventsListResponse, // **[CHANGED]** Renamed data to eventsListResponse
    error: eventsError,
    loading: eventsLoading,
  } = useFetchData( // **[CHANGED]** Removed generic type argument from useFetchData hook
    `http://localhost:8080/api/v1/events?page=${currentPage}&limit=${pageSize}${statusFilter ? `&status=${statusFilter}` : ''}`, // **[CHANGED]** Use statusFilter directly in URL
    localStorage.getItem('accessToken') || undefined
  );

  // **[ADDED]** useEffect fetch all categories
  useEffect(() => {
    const fetchAllCategoryNames = async () => {
      setCategoryLoading(true);
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await authService.getCategories(accessToken || '') as { statusCode: number; data: { categories?: any[] } };
        if (response.statusCode === 200 && response.data.categories) {
          const categoryMap: Record<string, string> = {};
          response.data.categories.forEach((category: any) => {
            categoryMap[category.id] = category.name;
          });
          setCategoryNamesMap(categoryMap);
        } else {
          message.error("Failed to load event categories.");
        }
      } catch (error: any) {
        message.error("Failed to load event categories.");
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchAllCategoryNames();
  }, []);


  const onStatusFilterChange = (value: string | undefined) => { // **[CHANGED]** Parameter type to string | undefined
    setStatusFilter(value);
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
      render: (categoryId: string) => ( // **[CHANGED]** Render category name from mapping
        <Space>
          {categoryLoading ? (
            <Spin />
          ) : (
            <Tag color="blue">{categoryNamesMap[categoryId] || 'N/A'}</Tag> // **[CHANGED]** Use categoryNamesMap
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
            placeholder="Filter by Status"
            defaultValue={undefined} // **[CHANGED]** Default value to undefined
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
