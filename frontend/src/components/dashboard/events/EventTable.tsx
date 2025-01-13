import {
    Alert,
    Button,
    Table,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../';

const EVENT_COLUMNS = (navigate: ReturnType<typeof useNavigate>) => [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Event Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Attendees',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Start At',
      dataIndex: 'startDate',
      key: 'startDate',
    },
    {
      title: 'End At',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Actions',
      dataIndex: 'id',
      key: 'id',
      render: (value,record) => (
        <div>
        <Button type="primary" onClick={() => navigate(`/details/events/${record.id}`)}>
          Details
        </Button>
        </div>
      )
    }
  ];
  interface EventTableProps {
    data: [];
    error?: string;
    loading: boolean;
  }
export const EventTable : React.FC<EventTableProps> = ({data,error,loading} ) => {
  const navigate = useNavigate();
  return (
    <div>
          <Card title="Your Events" extra={<a href="/create/events">Create Your Events</a>}>
            {error ? (
              <Alert
                message="Error"
                description={error.toString()}
                type="error"
                showIcon
              />
            ) : (
              <Table
                columns={EVENT_COLUMNS(navigate)}
                dataSource={data}
                loading={loading}
                className="overflow-scroll"
              />
            )}
          </Card>
    </div>
  )
}
