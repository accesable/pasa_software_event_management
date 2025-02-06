// src/pages/dashboards/ParticipatedEvents.tsx
import React, { useState } from 'react';
import {
    Alert,
    Button,
    Card,
    Space,
    Table,
    Tag,
    Select,
    message,
    Popconfirm,
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
    // Sử dụng hook custom để fetch dữ liệu tham gia event
    const { data: eventsData, error: eventsError, loading: eventsLoading, fetchData } =
        useFetchParticipatedEventsData(statusFilter === 'all' ? undefined : statusFilter);

    // loading dành cho thao tác update/delete
    const [actionLoading, setActionLoading] = useState(false);

    const onStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handlePaginationChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    const isEmptyData = eventsData?.events === undefined || eventsData?.events?.length === 0;

    // Hàm xử lý Unregister (delete) event
    const handleLeaveEvent = async (participantId: string) => {
        setActionLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error('No access token found. Please login again.');
                return;
            }
            // Gọi API để unregister event
            // Giả sử authService.unregisterEvent sử dụng endpoint: /participants/{participantId}
            const response = (await authService.unregisterEvent(
                participantId,
                accessToken
            )) as { statusCode: number; message: string, error?: string };

            if (response.statusCode === 200) {
                message.success(response.message);
                // Refresh dữ liệu sau khi delete
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

    // Hàm xử lý Update Sessions (update lại các session) của participant
    const handleUpdateSessions = async (participantId: string) => {
        setActionLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error('No access token found. Please login again.');
                return;
            }
            // Gọi API để update sessions
            // Giả sử authService.updateParticipantSessions sử dụng endpoint: /participants/{participantId}
            // Và có thể truyền thêm dữ liệu cần update (ở đây minh demo truyền rỗng)
            const response = (await authService.updateParticipantSessions(
                participantId,
                {}, // dữ liệu update, thay đổi theo yêu cầu của backend
                accessToken
            )) as { statusCode: number; message: string, error?: string };

            if (response.statusCode === 200) {
                message.success(response.error || 'Sessions updated successfully');
                // Refresh dữ liệu sau khi update
                fetchData(statusFilter === 'all' ? undefined : statusFilter);
            } else {
                message.error(response.error || 'Failed to update sessions');
            }
        } catch (error: any) {
            console.error('Error updating sessions:', error);
            message.error(error.error || 'Failed to update sessions');
        } finally {
            setActionLoading(false);
        }
    };

    // Định nghĩa các cột của bảng bên trong component để có thể truy cập các hàm handleLeaveEvent, handleUpdateSessions
    const columns: ColumnsType<Events> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Link to={`/details/events/${record.id}`}>{text}</Link>
            ),
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
            key: 'categoryId',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag
                    color={
                        status === 'SCHEDULED'
                            ? 'blue'
                            : status === 'CANCELED'
                                ? 'red'
                                : 'green'
                    }
                >
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
                    <Button onClick={() => handleUpdateSessions(record.id)} size="small">
                        Update Sessions
                    </Button>
                    {/* <Popconfirm
            title="Unregister from event"
            description="Are you sure you want to unregister from this event?"
            onConfirm={() => handleLeaveEvent(record.id)}
            onCancel={() => message.info('Cancel unregister event')}
            okText="Yes, Unregister"
            cancelText="No"
          >
            <Button danger size="small">
              Unregister
            </Button>
          </Popconfirm> */}
                    <Popconfirm
                        title="Cancel Event"
                        description="Are you sure to unregister from this event?"
                        onConfirm={() => handleLeaveEvent(record.id)}
                        onCancel={() => message.info('Cancel')}
                        okText="Yes, Cancel"
                        cancelText="No"
                        placement="topRight" // Thử thay đổi placement
                        overlayInnerStyle={{ width: 200 }} // Thử set width
                    >
                        <Button danger>
                            Unregister
                        </Button>
                    </Popconfirm>
                </Space>
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
                    },
                    {
                        title: 'Participated Events',
                    },
                ]}
            />

            <Card
                title="List of Participated Events"
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

                {isEmptyData ? (
                    <Alert
                        message="No events participated yet."
                        type="info"
                        showIcon
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={eventsData?.events || []}
                        loading={eventsLoading || actionLoading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: eventsData?.meta?.totalItems || 0,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} items`,
                            pageSizeOptions: ['10', '20', '50', '100'],
                            showSizeChanger: true,
                            onChange: handlePaginationChange,
                        }}
                    />
                )}
            </Card>
        </div>
    );
};

export default ParticipatedEventsPage;
