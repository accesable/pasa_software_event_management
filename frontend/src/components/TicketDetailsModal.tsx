// src\components\TicketDetailsModal.tsx
import React from 'react';
import { Modal, Typography, Flex, Button, Spin } from 'antd';
import QRCode from 'qrcode.react';
import { TicketType } from '../types'; // Assuming you have this interface defined
import dayjs from 'dayjs';

interface TicketDetailsModalProps {
    ticket: TicketType | null;
    visible: boolean;
    onCancel: () => void;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, visible, onCancel }) => {
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
            ]}
        >
            <Flex vertical gap="middle">
                <Typography.Title level={4}>{ticket.id ? `Ticket ID: ${ticket.id}` : 'Ticket Information'}</Typography.Title>
                <Typography.Text>Participant ID: {ticket.participantId}</Typography.Text>
                <Typography.Text>Status: {ticket.status}</Typography.Text>
                {ticket.usedAt && <Typography.Text>Used At: {dayjs(ticket.usedAt).format('YYYY-MM-DD HH:mm:ss')}</Typography.Text>}

                <Typography.Title level={5}>QR Code</Typography.Title>
                <Flex justify="center">
                    {ticket.qrCodeUrl && (
                        <QRCode value={ticket.qrCodeUrl} size={200} level="H" />
                    )}
                </Flex>
            </Flex>
        </Modal>
    );
};

export default TicketDetailsModal;
