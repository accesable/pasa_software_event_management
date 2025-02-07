// src\routes\routes.tsx
// src\routes\routes.tsx
import { createBrowserRouter, useLocation } from 'react-router-dom';
import {
  AccountDeactivePage,
  BiddingDashboardPage,
  DefaultDashboardPage,
  EcommerceDashboardPage,
  Error400Page,
  Error403Page,
  Error404Page,
  Error500Page,
  Error503Page,
  ErrorPage,
  MarketingDashboardPage,
  PasswordResetPage,
  ProjectsDashboardPage,
  SignInPage,
  SignUpPage,
  SitemapPage,
  SocialDashboardPage,
  UserProfileFeedbackPage,
  UserProfileSecurityPage,
  VerifyEmailPage,
  WelcomePage,
  LearningDashboardPage,
  LogisticsDashboardPage,
  CreateEventPage,
  DetailEventPage,
  MyEventDashboardPage,
  UserDashboardPage,
} from '../pages';
import DetailMyEventPage from '../pages/details/MyEventPage';
import {
  CorporateLayout,
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
import GoogleAppwriteCallbackPage from '../pages/authentication/GoogleAppwriteCallbackPage.tsx';
import ParticipatedEventDetailsPage from '../pages/details/ParticipatedEventDetailsPage.tsx';
import { UserProfileInformationPage } from '../pages/userAccount/Information.tsx';

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
        path: 'speakers-guests',
        element: <SpeakerGuestManagementPage />,
      },
      {
        path: 'participated-events',
        element: <ParticipatedEventsPage />,
      },
      {
        index: true,
        path: 'default',
        element: <DefaultDashboardPage />,
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
        path: 'ecommerce',
        element: <EcommerceDashboardPage />,
      },
      {
        path: 'marketing',
        element: <MarketingDashboardPage />,
      },
      {
        path: 'social',
        element: <SocialDashboardPage />,
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
        {
            path: 'learning',
            element: <LearningDashboardPage />,
        },
        {
            path: 'logistics',
            element: <LogisticsDashboardPage />,
        },
        {
            path: 'bidding',
            element: <BiddingDashboardPage />,
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
        path: 'google/callback',
        element: <GoogleAppwriteCallbackPage
          projectId='123456789abc'
          endpoint='https://cloud.appwrite.io/v1'
          redirectUri="http://localhost:5173/auth/google/callback"
          onLoginSuccess={() => { /* Optional success handler */ }}
          onLoginFailure={() => { /* Optional failure handler */ }}
        />,
      },
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