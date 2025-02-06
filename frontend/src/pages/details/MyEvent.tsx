// src\pages\details\MyEventPage.tsx
import React, { useEffect } from 'react'; // Import useEffect
import { useParams } from 'react-router-dom';
import {
    Col,
    Flex,
    Image,
    Row,
    Typography,
    Button,
    message
} from 'antd';
import { Card } from '../../components';
import { useStylesContext } from '../../context';
import {
    EventTimelineCard,
    MyEventTimelineCard
} from '../../components/dashboard';
import { useFetchData } from '../../hooks'; // No longer used directly
import { ActivityTable } from '../../components/dashboard/events';
import { EventParticipantsTable } from '../../components/dashboard/events'; // Correct import
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { DownloadOutlined } from '@ant-design/icons';
import { fetchEventDetailsStart, fetchEventDetailsFailure, setEventDetails } from '../../redux/eventDetailsSlice'; // Import actions from eventDetailsSlice
import authService from '../../services/authService'; // Import authService
import { Loader, Alert } from '../../components'; // Import Loader and Alert

const { Title, Text, Paragraph } = Typography;

export const DetailMyEventPage = () => {
    const { id } = useParams<{ id: string }>();
    const stylesContext = useStylesContext();
    const dispatch = useDispatch<any>(); // Dispatch type
    const eventDetails = useSelector((state: RootState) => state.eventDetails.eventDetails); // Get eventDetails from Redux state
    const eventDetailsLoading = useSelector((state: RootState) => state.eventDetails.loading);
    const eventDetailsError = useSelector((state: RootState) => state.eventDetails.error);


    const {
        data: timelineData,
        loading: timelineDataLoading,
        error: timelineDataError,
    } = useFetchData('../../mocks/scheduleTimeline.json'); // Still using mock data for timeline and activities table
    const {
        data: activitiesTableData,
        loading: activitiesTableLoading,
        error: activitiesTableError,
    } = useFetchData('../../mocks/PaticipatedActivities.json');


    useEffect(() => {
        const loadEventDetails = async () => {
            if (!id) return;

            dispatch(fetchEventDetailsStart()); // Dispatch loading start action
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await authService.getEventDetails(id, accessToken);
                dispatch(setEventDetails(response.data.event)); // Dispatch success action and set event details in store

            } catch (error: any) {
                dispatch(fetchEventDetailsFailure(error.message || 'Failed to load event details')); // Dispatch failure action
                message.error(error.message || 'Failed to load event details');
            }
        };

        loadEventDetails();

        return () => {
            dispatch(clearEventDetails()); // Clear event details on unmount
        };


    }, [id, dispatch]);


    const handleDownloadPdf = () => {
        message.info("Download PDF chức năng is not implemented yet.");
    };


    if (eventDetailsLoading) { // Use Redux loading state
        return <Loader />;
    }

    if (eventDetailsError) { // Use Redux error state
        return <Alert message="Error" description={eventDetailsError} type="error" showIcon />;
    }

    if (!eventDetails) { // Check if eventDetails is null (not loaded)
        return <Alert message="Event not found" description="Could not load event details" type="warning" showIcon />;
    }


    return (
        <div>
            <Row {...stylesContext?.rowProps}>
                <Col span={24}>
                    <Card title={<Title level={3}>About This Event (Event ID : {id})</Title>}>
                        <Flex gap="small" vertical>
                            <Text>Job Fair 101.</Text>
                            <Image
                                src={eventDetails.banner || 'https://placehold.co/1920x1080'} // Use eventDetails.banner
                                alt="event banner"
                                width="100%"
                            />
                            <Paragraph>
                                {eventDetails.description}
                            </Paragraph>
                            <Paragraph>
                                Sit amet purus gravida quis blandit turpis cursus. Vulputate eu
                                scelerisque felis imperdiet proin fermentum leo vel orci. Fusce
                                id velit ut tortor pretium viverra suspendisse potenti.
                            </Paragraph>
                        </Flex>
                    </Card>
                </Col>
                <Col span={24}>
                    <MyEventTimelineCard
                        title="Event's Activities"
                        data={timelineData}
                        loading={timelineDataLoading}
                        error={timelineDataError}
                    />
                </Col>
                <Col span={24}>
                    <ActivityTable
                        data={activitiesTableData}
                        loading={activitiesTableLoading}
                        error={activitiesTableError}
                    />
                </Col>
                {eventDetails?.status === 'FINISHED' && (
                    <Col span={24}>
                        <Card title="Participants Check-in/Check-out List"
                            extra={<Button icon={<DownloadOutlined />} onClick={handleDownloadPdf}>
                                Download PDF
                            </Button>}
                        >
                            <EventParticipantsTable eventId={id} />
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    )
}

export default DetailMyEventPage;