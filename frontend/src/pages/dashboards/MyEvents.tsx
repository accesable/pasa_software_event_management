// src\pages\dashboards\MyEvents.tsx
import { Alert, Button, Col, Row, Space, Spin } from 'antd';
import {
    Card,
    Loader,
    PageHeader,
} from '../../components';
import { Events } from '../../types';
import { useState } from 'react';
import {
    CloudUploadOutlined,
    HomeOutlined,
    PieChartOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import { DASHBOARD_ITEMS } from '../../constants';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useFetchOrganizedEventsData from '../../hooks/useFetchOrganizedEventsData';
import { EventsCard } from '../../components/dashboard/shared';
import { MyEventsTable } from '../../components/dashboard/events/MyEventTable'; // Corrected import here (Named import)

const EVENT_TABS = [
    {
        key: 'all',
        label: 'All events',
    },
    {
        key: 'SCHEDULED',
        label: 'Scheduled',
    },
    {
        key: 'CANCELED',
        label: 'Canceled',
    },
    {
        key: 'FINISHED',
        label: 'Finished',
    },
];

export const MyEventDashboardPage = () => {

    const { data: eventsData, error: eventsError, loading: eventsLoading, fetchData } = useFetchOrganizedEventsData();
    const [eventTabKey, setEventTabKey] = useState<string>('all');
    const navigate = useNavigate();

    const getFilteredEvents = (status?: string) => {
        return (eventsData || []).filter((event: Events) => status ? event.status === status : true);
    };

    const EVENT_TABS_CONTENT: Record<string, React.ReactNode> = {
        all: <MyEventsTable key="all-events-table" data={getFilteredEvents()} loading={eventsLoading} fetchData={fetchData} activeTabKey={eventTabKey} />,
        SCHEDULED: (
            <MyEventsTable
                key="scheduled-events-table"
                data={getFilteredEvents('SCHEDULED')}
                loading={eventsLoading}
                fetchData={() => fetchData('SCHEDULED')}
                activeTabKey={eventTabKey}
            />
        ),
        CANCELED: (
            <MyEventsTable
                key="canceled-events-table"
                data={getFilteredEvents('CANCELED')}
                loading={eventsLoading}
                fetchData={() => fetchData('CANCELED')}
                activeTabKey={eventTabKey}
            />
        ),
        FINISHED: (
            <MyEventsTable
                key="finished-events-table"
                data={getFilteredEvents('FINISHED')}
                loading={eventsLoading}
                fetchData={() => fetchData('FINISHED')}
                activeTabKey={eventTabKey}
            />
        ),
    };


    const onEventTabChange = (key: string) => {
        setEventTabKey(key);
        fetchData(key === 'all' ? undefined : key);
    };


    return (
        <div>
            <Helmet>
                <title>My Events | Antd Dashboard</title>
            </Helmet>
            <PageHeader
                title="your event dashboard"
                breadcrumbs={[
                    {
                        title: (
                            <>
                                <HomeOutlined />
                                <span>home</span>
                            </>
                        ),
                        path: '/',
                    },
                    {
                        title: (
                            <>
                                <PieChartOutlined />
                                <span>dashboards</span>
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
                        title: 'my events',
                    },
                ]}
            />
            <Row
                gutter={[
                    { xs: 8, sm: 16, md: 24, lg: 32 },
                    { xs: 8, sm: 16, md: 24, lg: 32 },
                ]}
            >
                <Col span={24}>
                    <Card
                        title="Recently added events"
                    >
                        {eventsError && (
                            <Alert
                                message="No events participated yet."
                                type="info"
                                showIcon
                            />
                        )}
                        {eventsLoading ? (
                            <Loader />
                        ) : (
                            <Row gutter={[16, 16]}>
                                {getFilteredEvents().slice(0, 4).map((o: Events) => {
                                    return (
                                        <Col xs={24} sm={12} xl={6} key={o.id}>
                                            <EventsCard
                                                event={o}
                                                type="inner"
                                                style={{ height: '100%' }}
                                            />
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </Card>
                </Col>
                <Col span={24}>
                    <Card
                        title="Your Events"
                        extra={
                            <Space>
                                <Button onClick={() => navigate("/create/events")} icon={<PlusOutlined />}>New Event</Button>
                            </Space>
                        }
                        tabList={EVENT_TABS}
                        activeTabKey={eventTabKey}
                        onTabChange={onEventTabChange}
                    >
                        {eventsLoading ? <Loader /> : EVENT_TABS_CONTENT[eventTabKey]}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default MyEventDashboardPage