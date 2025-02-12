import React, { useEffect, useRef, useState } from 'react';
import { ConfigProvider, Layout, Menu, MenuProps, SiderProps } from 'antd';
import {
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Logo } from '../../components';
import { Link, useLocation } from 'react-router-dom';
import {
  PATH_DASHBOARD,
  PATH_LANDING,
  PATH_USER_PROFILE,
} from '../../constants';
import { COLOR } from '../../App.tsx';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
};

const items: MenuProps['items'] = [
  getItem('Dashboards', 'dashboards', <PieChartOutlined />, [
    getItem(
      <Link to={PATH_DASHBOARD.general}>General</Link>,
      PATH_DASHBOARD.general, // key = pathname
      null
    ),
    getItem(
      <Link to={PATH_DASHBOARD.projects}>Projects</Link>,
      PATH_DASHBOARD.projects, // key = pathname
      null
    ),
    getItem(
      <Link to={PATH_DASHBOARD.events}>Events</Link>,
      PATH_DASHBOARD.events, // key = pathname
      null
    ),
    getItem(
      <Link to={PATH_DASHBOARD.my_events}>My Events</Link>,
      PATH_DASHBOARD.my_events, // key = pathname
      null
    ),
    getItem(
      <Link to={PATH_DASHBOARD.participated_events}>Participated Events</Link>,
      PATH_DASHBOARD.participated_events, // key = pathname
      null
    ),
    getItem(
      <Link to={PATH_DASHBOARD.speaker_guest}>Speaker & Guest</Link>,
      PATH_DASHBOARD.speaker_guest, // key = pathname
      null
    ),
  ]),

  getItem('Pages', 'pages', null, [], 'group'),

  getItem('User profile', 'user-profile', <UserOutlined />, [
    getItem(
      <Link to={PATH_USER_PROFILE.personalInformation}>Information</Link>,
      PATH_USER_PROFILE.personalInformation, // key = pathname
      null
    ),
    getItem(
      <Link to={PATH_USER_PROFILE.security}>Security</Link>,
      PATH_USER_PROFILE.security, // key = pathname
      null
    ),
  ]),
];

const rootSubmenuKeys = ['dashboards', 'corporate', 'user-profile'];

type SideNavProps = SiderProps;

const SideNav = ({ ...others }: SideNavProps) => {
  const nodeRef = useRef(null);
  const { pathname } = useLocation();
  const [openKeys, setOpenKeys] = useState(['']);
  const [current, setCurrent] = useState('');

  const onClick: MenuProps['onClick'] = (e) => {
    console.log('click ', e);
  };

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (latestOpenKey && rootSubmenuKeys.indexOf(latestOpenKey!) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  useEffect(() => {
    setCurrent(pathname); // Sử dụng pathname trực tiếp
  }, [pathname]);

  return (
    <Sider ref={nodeRef} breakpoint="lg" collapsedWidth="0" {...others}>
      <Logo
        color="blue"
        asLink
        href={PATH_LANDING.root}
        justify="center"
        gap="small"
        imgSize={{ h: 28, w: 28 }}
        style={{ padding: '1rem 0' }}
      />
      <ConfigProvider
        theme={{
          components: {
            Menu: {
              itemBg: 'none',
              itemSelectedBg: COLOR['100'],
              itemHoverBg: COLOR['50'],
              itemSelectedColor: COLOR['600'],
            },
          },
        }}
      >
        <Menu
          mode="inline"
          items={items}
          onClick={onClick}
          openKeys={openKeys}
          onOpenChange={onOpenChange}
          selectedKeys={[current]}
          style={{ border: 'none' }}
        />
      </ConfigProvider>
    </Sider>
  );
};

export default SideNav;
