import { useGo } from '@refinedev/core';
import { CreateButton, DeleteButton, EditButton, FilterDropdown, List, useTable } from '@refinedev/antd'
import React from 'react'
import { Table } from 'antd';

type Category = {
    id: string;
    name : string;
    description : string;
}
const CategoryList = ({children} : React.PropsWithChildren) => {
    const go = useGo();
    const {tableProps,filters} = useTable({
        resource : 'events/category',
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
            //   go({
            //     to : {
            //       resource : 'events',
            //       action: 'create',
            //     },
            //     options: {
            //       keepQuery : true,
            //     },
            //     type: 'replace',
            //   })
            }}/>
          )}>
            <Table
              {...tableProps}
              pagination={{
                ...tableProps.pagination,
              }}
              rowKey="id"
            >
              <Table.Column dataIndex="name" title="Category" />
              <Table.Column dataIndex="description" title="Description" />
            </Table>
          </List>
    </div>
  )
}

export default CategoryList