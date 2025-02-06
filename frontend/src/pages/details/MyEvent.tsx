// src\pages\details\MyEventPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Col,
    Flex,
    Image,
    Row,
    Typography,
    Button,
    message,
    Alert
} from 'antd';
import { Card, Loader } from '../../components';
import { useStylesContext } from '../../context';
import {
    EventTimelineCard,
    MyEventTimelineCard
} from '../../components/dashboard';
import { useFetchData } from '../../hooks';
import { ActivityTable } from '../../components/dashboard/events';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { DownloadOutlined } from '@ant-design/icons';
import authService from '../../services/authService';
import { fetchEventDetailsStart, setEventDetails, fetchEventDetailsFailure, clearEventDetails } from '../../redux/eventDetailsSlice';
import jsPDF from 'jspdf';
import { EventParticipantsTable } from '../dashboards/EventParticipantsTable';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export interface ParticipantData {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    checkInAt: string | null;
    checkOutAt: string | null;
}


export const DetailMyEventPage = () => {
    const { id } = useParams<{ id: string }>();
    const stylesContext = useStylesContext();
    const dispatch = useDispatch<any>();
    const eventDetails = useSelector((state: RootState) => state.eventDetails.eventDetails);
    const eventDetailsLoading = useSelector((state: RootState) => state.eventDetails.loading);
    const eventDetailsError = useSelector((state: RootState) => state.eventDetails.error);


    const {
        data: timelineData,
        loading: timelineDataLoading,
        error: timelineDataError,
    } = useFetchData('../../mocks/scheduleTimeline.json');
    const {
        data: activitiesTableData,
        loading: activitiesTableLoading,
        error: activitiesTableError,
    } = useFetchData('../../mocks/PaticipatedActivities.json');


    useEffect(() => {
        const loadEventDetails = async () => {
            if (!id) return;

            dispatch(fetchEventDetailsStart());
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await authService.getEventDetails(id, accessToken || undefined) as { data: { event: any } };
                dispatch(setEventDetails(response.data.event));

            } catch (error: any) {
                dispatch(fetchEventDetailsFailure(error.message || 'Failed to load event details'));
                message.error(error.message || 'Failed to load event details');
            }
        };

        loadEventDetails();

        return () => {
            dispatch(clearEventDetails());
        };


    }, [id, dispatch]);


    const [loading, setLoading] = useState(false);

    const handleDownloadPdf = async () => {
        if (!id) {
            message.error("Event ID is missing for PDF download.");
            return;
        }

        setLoading(true);
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                message.error("No access token found. Please login again.");
                return;
            }

            const response = await authService.getEventParticipants(id, accessToken) as { statusCode: number, data: ParticipantData[], message?: string };
            if (response.statusCode === 200 && response.data) {
                const participants: ParticipantData[] = response.data; // Type response data

                // Generate PDF using jsPDF
                const pdfDoc = new jsPDF();
                pdfDoc.text(`Participants List - Event: ${eventDetails?.name}`, 10, 10);

                let yPosition = 20;
                participants.forEach((participant, index) => {
                    pdfDoc.text(`${index + 1}. Name: ${participant.name}, Email: ${participant.email}, Check-in: ${participant.checkInAt ? dayjs(participant.checkInAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}, Check-out: ${participant.checkOutAt ? dayjs(participant.checkOutAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}`, 10, yPosition);
                    yPosition += 10; // Increase yPosition for next line
                });

                pdfDoc.save(`participants-list-event-${eventDetails?.name}.pdf`); // Trigger download

                message.success("PDF Download started.");
            } else {
                message.error(response.message || 'Failed to fetch participants for PDF');
            }
        } catch (error: any) {
            console.error('Error fetching participants for PDF:', error);
            message.error(error.message || 'Failed to fetch participants for PDF');
        } finally {
            setLoading(false);
        }
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
                            extra={<Button icon={<DownloadOutlined />} onClick={handleDownloadPdf} loading={loading}>
                                Download PDF
                            </Button>}
                        >
                            <EventParticipantsTable eventId={id || ''} />
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    )
}

export default DetailMyEventPage;