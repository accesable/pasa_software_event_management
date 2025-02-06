// src\components\TicketDetailsModal.tsx
import React from 'react';
import { Modal, Typography, Flex, Checkbox, List, Button, Space } from 'antd';
import QRCode from 'qrcode.react';
import { TicketType } from '../types'; // Assuming you have this interface defined
import dayjs from 'dayjs';
import { CheckboxValueType } from 'antd/es/checkbox/Group';

interface TicketDetailsModalProps {
    ticket: TicketType | null;
    visible: boolean;
    onCancel: () => void;
    onSessionsChange: (sessionIds: string[]) => void;
    eventSchedule: any[];
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, visible, onCancel, onSessionsChange, eventSchedule }) => {
    const [selectedSessionIds, setSelectedSessionIds] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (ticket?.participantId) {
            // Initialize selectedSessionIds based on the ticket or participant's current sessions if available
            // For this example, we'll start with an empty selection
            setSelectedSessionIds([]);
        }
    }, [ticket]);


    const handleSessionCheckboxChange = (checkedValues: CheckboxValueType[]) => {
        // Convert CheckboxValueType[] to string[] before setting state
        setSelectedSessionIds(checkedValues.map(value => String(value)));
    };

    const handleUpdateSessions = () => {
        onSessionsChange(selectedSessionIds);
        onCancel();
    };

    if (!ticket) return null;

    return (
        <Modal
            title="Your Event Ticket"
            visible={visible}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Close
                </Button>,
                <Button key="submit" type="primary" onClick={handleUpdateSessions}>
                    Update Sessions
                </Button>,
            ]}
        >
            <Flex vertical gap="middle">
                <Typography.Title level={4}>{ticket.id ? `Ticket ID: ${ticket.id}` : 'Ticket Information'}</Typography.Title>
                <Typography.Text>Participant ID: {ticket.participantId}</Typography.Text>
                <Typography.Text>Status: {ticket.status}</Typography.Text>
                {ticket.usedAt && <Typography.Text>Used At: {dayjs(ticket.usedAt).format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>}

                <Typography.Title level={5}>QR Code</Typography.Title>
                <Flex justify="center"> {/* Center the QR code */}
                    {ticket.qrCodeUrl && (
                        <QRCode value={ticket.qrCodeUrl} size={200} level="H" />
                    )}
                </Flex>


                <Typography.Title level={5} style={{ marginTop: 20 }}>Update Sessions</Typography.Title>
                {eventSchedule && eventSchedule.length > 0 ? (
                    <Checkbox.Group
                        options={eventSchedule.map(session => ({ label: session.title, value: session.id }))}
                        onChange={handleSessionCheckboxChange}
                        value={selectedSessionIds}
                    />
                ) : (
                    <Typography.Text>No sessions available for this event.</Typography.Text>
                )}
            </Flex>
        </Modal>
    );
};

export default TicketDetailsModal;