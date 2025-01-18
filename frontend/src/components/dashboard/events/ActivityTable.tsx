import {
    Alert,
    Button,
    Table,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../';

const ACTIVITY_COLUMNS = (navigate: ReturnType<typeof useNavigate>) => [
    {
      title: 'ID',
      dataIndex: 'activity_id',
      key: 'id',
    },
    {
      title: 'Activity Name',
      dataIndex: 'activity_name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Attendees',
      dataIndex: 'attendees',
      key: 'Attendees',
    },
    {
      title: 'Actions',
      dataIndex: 'activity_id',
      key: 'id',
      render: (value,record) => (
        <div>
        <Button type="primary" onClick={() => navigate(`/details/events/${value}`)}>
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
export const ActivityTable : React.FC<EventTableProps> = ({data,error,loading} ) => {
  const navigate = useNavigate();
  return (
    <div>
          <Card title="This Event's Activities" extra={<a href="/create/activities">Create Activities for this Event</a>}>
            {error ? (
              <Alert
                message="Error"
                description={error.toString()}
                type="error"
                showIcon
              />
            ) : (
              <Table
                columns={ACTIVITY_COLUMNS(navigate)}
                dataSource={data}
                loading={loading}
                className="overflow-scroll"
              />
            )}
          </Card>
    </div>
  )
}
