import { getDefaultFilter, useGo } from '@refinedev/core'
import React from 'react'
import { CreateButton, DeleteButton, EditButton, FilterDropdown, List, useTable } from '@refinedev/antd'
import { Input, Space, Table } from 'antd';
import { Text } from '@/components/text';
import { SearchOutlined } from '@ant-design/icons';
import CustomAvatar from '@/components/custom-avatar';
import { getDateColor } from '@/utilities';


type Event = {
  id : string;
  name : string;
  description : string;
  startDate : string;
  endDate : string;
  price : number;
  banner : string;
  status : string;
  maxParticipants : string;
  location : string;
  createdAt : string;
  updatedAt : string;
}
const EventList = ({children} : React.PropsWithChildren) => {

  const go = useGo();
  const {tableProps,filters} = useTable({
    resource : 'events',
    pagination : {
      pageSize : 12,
    },
  });
  return (
    <div>
      <List
        breadcrumb={false}
        headerButtons={() => (
          <CreateButton
            onClick={() => {
              go({
                to : {
                  resource : 'events',
                  action: 'create',
                },
                options: {
                  keepQuery : true,
                },
                type: 'replace',
              })
            }}/>
          )}>
            <Table
              {...tableProps}
              pagination={{
                ...tableProps.pagination,
              }}
              rowKey="id"
            >
              <Table.Column<Event>
                dataIndex="name" 
                title="Event Name" 
                defaultFilteredValue={getDefaultFilter('id',filters)}
                filterIcon={<SearchOutlined/>}
                filterDropdown={(props)=> (
                  <FilterDropdown {...props}>
                    <Input placeholder='Search Company' />
                  </FilterDropdown>
                )}
                render={(value,record) => (
                  <Space>
                    <CustomAvatar shape='square' name={record.name} src = {record.banner} />
                    <Text style={{whiteSpace : 'nowrap'}}>
                      {record.name}
                    </Text>
                  </Space>
                )}
              />
              <Table.Column dataIndex="description" title="Description" />
              <Table.Column dataIndex="location" title="Address" />
              <Table.Column dataIndex="price" title="Participation Price" />
              <Table.Column dataIndex="maxParticipants" title="Guests Capacity" />
              <Table.Column dataIndex="status" title="Status" />
              <Table.Column dataIndex="startDate" title="Begin At"
                render={(value, record) => (
                  <Space>{new Date(value).toLocaleDateString()}</Space>
                )}
              />
              <Table.Column dataIndex="endDate" title="End At" 
                render={(value, record) => (
                  <Space>{new Date(value).toLocaleDateString()}</Space>
                )}
              />

            </Table>
      </List>
    </div>
  )
}

export default EventList