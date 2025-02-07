import { AppLayout } from '../index.ts';
import { Col, Row, Typography } from 'antd';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CiLocationOn, CiUser } from "react-icons/ci";
import {
  Card,
  PageHeader,
} from '../../components';
import { HomeOutlined, IdcardOutlined } from '@ant-design/icons';
import { useStylesContext } from '../../context';

export const EventDetailLayout = () => {
  const { pathname } = useLocation();
  const stylesContext = useStylesContext();

  return (
    <>
      {/*@ts-ignore*/}
      <AppLayout>
        <PageHeader
          title="Event Details"
          breadcrumbs={[
            {
              title: (
                <>
                  <HomeOutlined />
                  <span>home</span>
                </>
              ),
              path: '/',
            },
            {
              title: (
                <>
                  <IdcardOutlined />
                  <span>event</span>
                </>
              ),
            },
            {
              title: pathname.split('/')[pathname.split('/').length - 1] || '',
            },
          ]}
        />
        <Row {...stylesContext?.rowProps}>
          <Col xs={24} md={16} xl={18}>
            <Outlet />
          </Col>
          <Col xs={24} md={8} xl={6}>
            <Row {...stylesContext?.rowProps}>
              <Col span={24}>
                <Card title="Event info">
                  {/* <Title level={5}>status</Title> */}
                  <ul style={{listStyle : 'none'}} >
                    <li><CiLocationOn /> District 7, Ho Chi Minh City</li>
                    <li><CiUser /> 500 attendes</li>
                    {/* <li>Experience with React & Nextjs</li>
                    <li>Experience with HTML / CSS</li> */}
                  </ul>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </AppLayout>
    </>
  );
};
