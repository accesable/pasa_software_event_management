// src\pages\details\components\RegisteredParticipantsTable.tsx
import React, { useEffect, useState } from 'react';
import { Table, Alert, Spin } from 'antd';
import { ColumnsType } from 'antd/es/table';
import axiosInstance from '../../../api/axiosInstance';
import { ParticipantData } from '../MyEventPage';

interface RegisteredParticipantsTableProps {
  eventId: string;
}

const RegisteredParticipantsTable: React.FC<RegisteredParticipantsTableProps> = ({ eventId }) => {
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/events/${eventId}/registered-participants`);
        const data = response.data as any;
        if (data.statusCode === 200 && data.data.participants) {
          setParticipants(data.data.participants);
        } else {
          setError(data.message || 'Failed to load registered participants');
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load registered participants');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId]);

  const columns: ColumnsType<ParticipantData> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  if (loading) {
    return <Spin tip="Loading participants..." />;
  }

  if (error) {
    return <Alert message="No participants register." type="info" showIcon />
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table
        dataSource={participants}
        columns={columns}
        rowKey="participantId"
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default RegisteredParticipantsTable;
