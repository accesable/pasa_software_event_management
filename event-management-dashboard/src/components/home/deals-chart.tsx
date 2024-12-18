import { DollarOutlined } from '@ant-design/icons'
import { Card } from 'antd'
import { Text } from '../text'
import {Area, AreaConfig} from '@ant-design/plots'
import React from 'react'
import { useList } from '@refinedev/core'
import { DASHBOARD_DEALS_CHART_QUERY } from '@/graphql/queries'
import { mapDealsData } from '@/utilities/helpers'
import { GetFieldsFromList } from '@refinedev/nestjs-query'
import { DashboardDealsChartQuery } from '@/graphql/types'
const DealsChart = () => {

  const {data} = useList<GetFieldsFromList<DashboardDealsChartQuery>>({
    resource: 'dealStages',
    filters :[
      {
        field : 'title', operator : 'in', value : ['WON','LOST']
      }
    ],
    meta : {
      gqlQuery : DASHBOARD_DEALS_CHART_QUERY
    }
  })

  const dealData = React.useMemo(() => {
    return mapDealsData(data?.data);
  }, [data?.data])

  // console.log(data)

  const config : AreaConfig = {
    data: dealData,
    xField : 'timeText',
    yField : 'value',
    isStack : false,
    seriesField : 'state',
    animation : true,
    startOnZero: false,
    smooth : true,
    legend : {
      offsetY : -6
    },
    yAxis : {
      tickCount: 4,
      label : {
        formatter : (v: string) =>{
          return `$${Number(v) /1000}k`;
        }
      }
    },
    tooltip : {
      formatter : (data) => {
        return {
          name : data.state,
          value : `$${Number(data.value) /1000}k`
        }
      }
    }
  }
  return (
    <Card
    styles={{
      header : {padding : '8px 16px'},
      body : {padding : '24px 24px 0 24px'}
    }}
    style={{
      alignItems: 'center',
      gap : '8px',
      height : '100%',
    }}
    title={
      <div>
        <DollarOutlined/>
        <Text size="sm" style={{marginLeft : '0.5rem'}}>
          Deals
        </Text>
      </div>
    }>
      <Area {...config} height={325} />
    </Card>
  )
}

export default DealsChart