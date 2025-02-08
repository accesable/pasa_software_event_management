// src\routes\routes.tsx
// src\routes\routes.tsx
import { createBrowserRouter, useLocation, Navigate, RouteObject } from 'react-router-dom';
import {
  AccountDeactivePage,
  GeneralDashboardPage,
  Error400Page,
  Error403Page,
  Error404Page,
  Error500Page,
  Error503Page,
  ErrorPage,
  PasswordResetPage,
  ProjectsDashboardPage,
  SignInPage,
  SignUpPage,
  SitemapPage,
  UserProfileFeedbackPage,
  UserProfileSecurityPage,
  VerifyEmailPage,
  WelcomePage,
  CreateEventPage,
  DetailEventPage,
  MyEventDashboardPage,
  UserDashboardPage,
} from '../pages';
import DetailMyEventPage from '../pages/details/MyEventPage';
import {
  DashboardLayout,
  EventDetailLayout,
  // GuestLayout,
  UserAccountLayout,
} from '../layouts';
import React, { ReactNode, useEffect } from 'react';
import { AboutPage } from '../pages/About.tsx';
import EventsDashboardPage from '../pages/dashboards/Events.tsx';
import EventsListPage from '../pages/dashboards/EventsList.tsx';
import EventDetailsPage from '../pages/details/EventDetailsPage.tsx';
import EditEventPage from '../pages/edit/EditEventPage.tsx';
import ParticipatedEventsPage from '../pages/dashboards/ParticipatedEvents.tsx';
import SpeakerGuestManagementPage from '../pages/dashboards/SpeakerManagementPage.tsx';
import ParticipatedEventDetailsPage from '../pages/details/ParticipatedEventDetailsPage.tsx';
import { UserProfileInformationPage } from '../pages/userAccount/Information.tsx';
import QRScannerPage from '../pages/QRScannerPage.tsx';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store.ts';

// Custom scroll restoration function
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return null;
};

type PageProps = {
  children: ReactNode;
};

// Create an HOC to wrap your route components with ScrollToTop
const PageWrapper = ({ children }: PageProps) => {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
};

// **PrivateRoute Component**
const PrivateRoute = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const user = useSelector((state: RootState) => state.user);
  return user && user.id ? children : <Navigate to="/auth/signin" replace />; // Redirect nếu chưa đăng nhập
};

const RootRoute = () => { // Component for root path '/'
  const user = useSelector((state: RootState) => state.user);

  if (user && user.id) {
    return <Navigate to="/dashboards/general" replace />; // Redirect to dashboard if logged in
  } else {
    return <SignInPage />; // Render SignInPage if not logged in
  }
};


// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    element: <PageWrapper children={<RootRoute />} />, // Use RootRoute for '/' path
    errorElement: <ErrorPage />,
    children: [
      // No index route needed here as RootRoute handles '/'
    ],
  },
  {
    path: '/create',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'events',
        element: <PrivateRoute>
          <CreateEventPage />
        </PrivateRoute>,
      },
    ],
  },
  {
    path: '/details',
    element: <PageWrapper children={<EventDetailLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'events/:id',
        element: <PrivateRoute>
          <EventDetailsPage />
        </PrivateRoute>,
      },
      {
        path: 'my-events/:id',
        element: <PrivateRoute>
          <DetailMyEventPage />
        </PrivateRoute>,
      },
      {
        path: 'participated-events/:id',
        element: <PrivateRoute>
          <ParticipatedEventDetailsPage />
        </PrivateRoute>,
      },
    ],
  },
  {
    path: '/dashboards',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: 'general',
        element: <PrivateRoute>
          <GeneralDashboardPage />
        </PrivateRoute>,
      },
      {
        path: 'check-in-out/:id', // New route for QR scanner
        element: <PrivateRoute>
          <QRScannerPage />
        </PrivateRoute>,
      },
      {
        path: 'speakers-guests',
        element: <PrivateRoute>
          <SpeakerGuestManagementPage />
        </PrivateRoute>,
      },
      {
        path: 'participated-events',
        element: <PrivateRoute>
          <ParticipatedEventsPage />
        </PrivateRoute>,
      },
      {
        path: 'projects',
        element: <PrivateRoute>
          <ProjectsDashboardPage />
        </PrivateRoute>,
      },
      {
        path: 'events',
        element: <PrivateRoute>
          <EventsDashboardPage />
        </PrivateRoute>,

      },
      {
        path: 'my-events',
        element: <PrivateRoute>
          <MyEventDashboardPage />
        </PrivateRoute>,
      },
      {
        path: 'users',
        element: <PrivateRoute>
          <UserDashboardPage />
        </PrivateRoute>,
      },
      {
        path: 'events-list',
        element: <PrivateRoute>
          <EventsListPage />
        </PrivateRoute>,
      },
    ],
  },
  {
    path: '/sitemap',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <PrivateRoute>
          <SitemapPage />
        </PrivateRoute>,
      },
    ],
  },
  {
    path: '/user-profile',
    element: <PageWrapper children={<UserAccountLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'personal-information',
        element: <PrivateRoute>
          <UserProfileInformationPage />
        </PrivateRoute>,
      },
      {
        path: 'security',
        element: <PrivateRoute>
          <UserProfileSecurityPage />
        </PrivateRoute>,
      },
      {
        path: 'feedback',
        element: <PrivateRoute>
          <UserProfileFeedbackPage />
        </PrivateRoute>,
      },
    ],
  },
  {
    path: '/auth',
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'signup',
        element: <SignUpPage />,
      },
      {
        path: 'signin',
        element: <SignInPage />,
      },
      {
        path: 'welcome',
        element: <WelcomePage />,
      },
      {
        path: 'verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: 'password-reset',
        element: <PasswordResetPage />,
      },
      {
        path: 'account-delete',
        element: <AccountDeactivePage />,
      },
    ],
  },
  {
    path: '/edit',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'events/:id',
        element: <PrivateRoute>
          <EditEventPage />
        </PrivateRoute>,
      },
    ],
  },
  {
    path: 'errors',
    errorElement: <ErrorPage />,
    children: [
      {
        path: '400',
        element: <Error400Page />,
      },
      {
        path: '403',
        element: <Error403Page />,
      },
      {
        path: '404',
        element: <Error404Page />,
      },
      {
        path: '500',
        element: <Error500Page />,
      },
      {
        path: '503',
        element: <Error503Page />,
      },
    ],
  },
  {
    path: '/about',
    element: <PageWrapper children={<DashboardLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <PrivateRoute>
          <AboutPage />
        </PrivateRoute>,
      },
    ],
  },
]);

export default router;
