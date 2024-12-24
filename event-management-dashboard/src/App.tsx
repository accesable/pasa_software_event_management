import { Authenticated, GitHubBanner, Refine, WelcomePage } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import { useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import {Home,ForgotPassword,Login,Register} from './pages'
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import {authProvider, dataProvider,liveProvider} from "./providers"
import Layout from "./components/layout";
import { resources } from "./config/resources";
import CompanyList from "./pages/company";
import Create from "./pages/company/create";
import Edit from "./pages/company/edit";
import { authProvider as myAuthProvider, dataProvider as myDataProvider } from "./my-providers";
import EventList from "./pages/events";
import TestComponent from "./test/test-components";
import CreateEvent from "./pages/events/create-event";
import CategoryList from "./pages/event-categories";
function App() {
  return (
    <BrowserRouter>
      {/* <GitHubBanner /> */}
      <RefineKbarProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={myDataProvider}
                // liveProvider={liveProvider}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                authProvider={myAuthProvider}
                resources={resources}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "Oe9E0e-Ouldtx-9VpXW1",
                  liveMode: "auto",
                }}
              >
                <Routes>
                  <Route path="/register" element={<Register />} />
                  <Route path="/test" element={<TestComponent />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="forgot-password" element={<ForgotPassword />} />
                  <Route
                    element={
                    <Authenticated
                      key="authenticated-layout"
                      fallback={<CatchAllNavigate to="/login" />}>
                          <Layout>
                            <Outlet/>
                          </Layout>
                        </Authenticated>
                      }>
                      <Route index element={<Home />} />
                      <Route path="/companies">
                        <Route index element={<CompanyList />} />
                        <Route path="new" element={<Create/>} />
                        <Route path=":id/edit" element={<Edit/>} />
                      </Route>
                      <Route path="/events">
                        <Route index element={<EventList />} />
                        <Route path="new" element={<CreateEvent/>} />
                        <Route path=":id/edit" element={<Edit/>} />
                      </Route>
                      <Route path="/categories">
                        <Route index element={<CategoryList />} />
                        <Route path="new" element={<CreateEvent/>} />
                        <Route path=":id/edit" element={<Edit/>} />
                      </Route>
                  </Route>
                </Routes>
                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
