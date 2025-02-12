// src\components\dashboard\projects\ClientsTable\ClientsTable.tsx
import { Table, TableProps } from 'antd';
import { UserAvatar } from '../../../index.ts';
import dayjs from 'dayjs';

const COLUMNS = [
  {
    title: 'Client Name',
    dataIndex: 'name', // changed from 'client_name' to 'name'
    key: 'c_name',
    render: (_: any, record: any) => ( // use any to avoid type error, or define proper type for record
      <UserAvatar fullName={record.name} avatarUrl={record.avatar} /> // use record.name and record.avatarUrl
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email', // added Email column
    key: 'client_email',
  },
  {
    title: 'Last Login', // added Last Login column
    dataIndex: 'lastLoginAt',
    key: 'client_last_login',
    render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : 'Never', // format date
  },
];

interface Props extends TableProps<any> {
  data: any[]; // changed type to any[] to match fetched user data
}

export const ClientsTable = ({ data, ...others }: Props) => (
  <Table
    dataSource={data}
    columns={COLUMNS}
    key="client_table"
    size="middle"
    className="overflow-scroll"
    {...others}
  />
);
