import { getDefaultFilter, useGo } from '@refinedev/core'
import React from 'react'
import { CreateButton, DeleteButton, EditButton, FilterDropdown, List, useTable } from '@refinedev/antd'
import { Input, Space, Table } from 'antd';
import { Text } from '@/components/text';
import { SearchOutlined } from '@ant-design/icons';
import CustomAvatar from '@/components/custom-avatar';

const TestComponent = () => {
const go = useGo();
  const {tableProps} = useTable({
    resource : 'events',
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
              rowKey="id"
            >
              <Table.Column dataIndex="id" title="ID" />
              <Table.Column dataIndex="name" title="Event" />

            </Table>
      </List>
    </div>
  )
}

export default TestComponent