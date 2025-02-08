// src\routes\routes.tsx
// src\routes\routes.tsx
import { createBrowserRouter, useLocation } from 'react-router-dom';
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

// Create the router
const router = createBrowserRouter([
  {
    path: '/',
    // element: <PageWrapper children={<GuestLayout />} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        path: '',
        element: <SignInPage />,
      },
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
        element: <CreateEventPage />,
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
        element: <EventDetailsPage />,
      },
      {
        path: 'my-events/:id',
        element: <DetailMyEventPage />,
      },
      {
        path: 'participated-events/:id',
        element: <ParticipatedEventDetailsPage />,
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
        element: <GeneralDashboardPage />,
      },
      {
        path: 'check-in-out/:id', // New route for QR scanner
        element: <QRScannerPage />,
      },
      {
        path: 'speakers-guests',
        element: <SpeakerGuestManagementPage />,
      },
      {
        path: 'participated-events',
        element: <ParticipatedEventsPage />,
      },
      {
        path: 'projects',
        element: <ProjectsDashboardPage />,
      },
      {
        path: 'events',
        element: <EventsDashboardPage />,
      },

      {
        path: 'my-events',
        element: <MyEventDashboardPage />,
      },
      {
        path: 'users',
        element: <UserDashboardPage />,
      },
      {
        path: 'events-list',
        element: <EventsListPage />,
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
        element: <SitemapPage />,
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
        element: <UserProfileInformationPage />, // Thêm route cho UserProfileInformationPage
      },
      {
        path: 'security',
        element: <UserProfileSecurityPage />,
      },
      {
        path: 'feedback',
        element: <UserProfileFeedbackPage />,
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
        element: <EditEventPage />,
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
        element: <AboutPage />,
      },
    ],
  },
]);

export default router;
