import React, { CSSProperties } from 'react';
import { CardProps, Space, Typography } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { green, red } from '@ant-design/colors';
import CountUp from 'react-countup';
import { Card } from '../../../index.ts';

const { Title, Text } = Typography;

type RevenueCardProps = {
  title: string;
  value: number | string;
  diff: number;
  justify?: CSSProperties['justifyContent'];
  height?: number;
} & CardProps;

export const RevenueCard: React.FC<RevenueCardProps> = ({
  title,
  value,
  diff,
  justify = 'space-between',
  height,
  ...others
}) => {
  // Tính toán chiều cao nội dung bên trong (giảm đi khoảng padding, tiêu đề,...)
  const contentHeight = height ? height - 60 : 'auto';

  // Style cho container nội dung card
  const containerStyle: CSSProperties = {
    height: contentHeight,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: justify,
    padding: 16,
  };

  return (
    <Card
      {...others}
      style={{
        height,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        ...others.style,
      }}
    >
      <div style={containerStyle}>
        <Text style={{ fontSize: 16, color: '#666' }}>{title}</Text>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            {typeof value === 'number' ? (
              <>
                <CountUp end={value} duration={1.5} separator="," />
              </>
            ) : (
              <span >{value}</span>
            )}
          </Title>
          <Space size="small" style={{ color: diff > 0 ? green[6] : red[5] }}>
            {diff > 0 ? (
              <ArrowUpOutlined style={{ fontSize: 18 }} />
            ) : diff < 0 ? (
              <ArrowDownOutlined style={{ fontSize: 18 }} />
            ) : null
            }
            {
              diff !== 0 ? (
                <Text style={{ fontSize: 16, fontWeight: 500, color: diff > 0 ? green[6] : red[5] }}>
                  <CountUp end={diff} duration={1.5} decimals={0} />%
                </Text>
              ) : null
            }
          </Space>
        </div>
      </div>
    </Card>
  );
};
