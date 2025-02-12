import React from 'react';
import { Alert } from 'antd';
import { Pie } from '@ant-design/plots';

interface DetailedParticipantsChartProps {
  detailedParticipants: any[];
  meta: any;
}

const DetailedParticipantsChart: React.FC<DetailedParticipantsChartProps> = ({ detailedParticipants, meta }) => {
  // Nếu không có dữ liệu hoặc tổng số phần tử là 0 thì hiển thị Alert
  if (!detailedParticipants || detailedParticipants.length === 0 || (meta && meta.totalItems === 0)) {
    return <Alert message="No detailed participants data" type="info" showIcon />;
  }

  // Mapping trạng thái vé theo các giá trị số
  const ticketStatusMapping: { [key: number]: string } = {
    0: 'ACTIVE',
    1: 'USED',
    2: 'CHECKED_IN',
    3: 'CANCELED',
  };

  // Tính số lượng người tham gia theo trạng thái vé
  const statusCounts: { [key: string]: number } = {};
  detailedParticipants.forEach((participant) => {
    const status = participant.ticketStatus;
    const statusText = ticketStatusMapping[status] || 'UNKNOWN';
    statusCounts[statusText] = (statusCounts[statusText] || 0) + 1;
  });

  // Chuyển đối tượng statusCounts thành mảng dữ liệu cho biểu đồ
  const data = Object.keys(statusCounts).map((key) => ({
    type: key,
    value: statusCounts[key],
  }));

  // Cấu hình cho biểu đồ Pie
  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 1,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'pie-legend-active',
      },
      {
        type: 'element-active',
      },
    ],
  };

  return <Pie {...config} />;
};

export default DetailedParticipantsChart;
