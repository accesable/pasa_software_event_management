// src/App.tsx
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme, Spin } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import { StylesContext } from './context';
import routes from './routes/routes.tsx';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './redux/store';
import './App.css';
import { useEffect, useState } from 'react';
import { setUser } from './redux/userSlice';
import axiosInstance from './api/axiosInstance';

// Color palette (dùng để tham khảo)
const COLOR = {
  50: '#e0f1ff',
  100: '#b0d2ff',
  200: '#7fb0ff',
  300: '#4d8bff',
  400: '#1e79fe',
  500: '#076ee5',
  600: '#0062b3',
  700: '#004f81',
  800: '#003650',
  900: '#001620',
  borderColor: '#E7EAF3B2',
};

function App() {
  const { mytheme } = useSelector((state: RootState) => state.theme);
  const dispatch = useDispatch();
  // isAuthLoading: trạng thái đang load thông tin user
  // authChecked: cờ báo rằng quá trình kiểm tra xác thực đã xong (để tránh re-render không cần thiết)
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Kiểm tra xem URL có chứa accessToken (ví dụ: khi chuyển hướng từ OAuth)
    const accessTokenFromUrl = new URLSearchParams(window.location.search).get('accessToken');
    let accessToken = localStorage.getItem('accessToken');

    if (accessTokenFromUrl) {
      accessToken = accessTokenFromUrl;
      localStorage.setItem('accessToken', accessToken);
      window.history.replaceState({}, document.title, '/dashboards/general');
    }

    const checkAuth = async () => {
      if (accessToken) {
        try {
          // Gọi API lấy thông tin user
          const response = await axiosInstance.get('/users/profile');
          const userProfile = (response.data as { data: { user: any } }).data.user;
          dispatch(setUser(userProfile));
          localStorage.setItem('user', JSON.stringify(userProfile));
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('user');
        } finally {
          setIsAuthLoading(false);
          setAuthChecked(true);
        }
      } else {
        localStorage.removeItem('user');
        setIsAuthLoading(false);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [dispatch]);

  // Nếu chưa kiểm tra xong authentication, hiển thị spinner (hoặc có thể là trang trắng)
  if (!authChecked || isAuthLoading) {
    return (
      <div style={{ display: 'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: COLOR['500'],
            borderRadius: 6,
            fontFamily: 'Lato, sans-serif',
          },
          components: {
            Breadcrumb: {},
            Button: {
              colorLink: COLOR['500'],
              colorLinkActive: COLOR['700'],
              colorLinkHover: COLOR['300'],
            },
            Calendar: {
              colorBgContainer: 'none',
            },
            Card: {
              colorBorderSecondary: COLOR['borderColor'],
            },
            Carousel: {
              colorBgContainer: COLOR['800'],
              dotWidth: 8,
            },
            Rate: {
              colorFillContent: COLOR['100'],
              colorText: COLOR['600'],
            },
            Segmented: {
              colorBgLayout: COLOR['100'],
              borderRadius: 6,
              colorTextLabel: '#000000',
            },
            Table: {
              borderColor: COLOR['100'],
              colorBgContainer: 'none',
              headerBg: 'none',
              rowHoverBg: COLOR['50'],
            },
            Tabs: {
              colorBorderSecondary: COLOR['100'],
            },
            Timeline: {
              dotBg: 'none',
            },
            Typography: {
              colorLink: COLOR['500'],
              colorLinkActive: COLOR['700'],
              colorLinkHover: COLOR['300'],
              linkHoverDecoration: 'underline',
            },
          },
          algorithm:
            mytheme === 'dark'
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
        }}
      >
        <StylesContext.Provider
          value={{
            rowProps: {
              gutter: [
                { xs: 8, sm: 16, md: 24, lg: 32 },
                { xs: 8, sm: 16, md: 24, lg: 32 },
              ],
            },
            carouselProps: {
              autoplay: true,
              dots: true,
              dotPosition: 'bottom',
              infinite: true,
              slidesToShow: 3,
              slidesToScroll: 1,
            },
          }}
        >
          <RouterProvider router={routes} />
        </StylesContext.Provider>
      </ConfigProvider>
    </HelmetProvider>
  );
}

export default App;
export { COLOR };
