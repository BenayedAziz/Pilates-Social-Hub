import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AuthPage from "@/pages/AuthPage";
import BrandPage from "@/pages/BrandPage";
import BrandsPage from "@/pages/BrandsPage";
import ChallengesPage from "@/pages/ChallengesPage";
import CirclesPage from "@/pages/CirclesPage";
import CommunityPage from "@/pages/CommunityPage";
import FeedPage from "@/pages/FeedPage";
import MapPage from "@/pages/MapPage";
import MePage from "@/pages/MePage";
import MessagesPage from "@/pages/MessagesPage";
import NotFound from "@/pages/not-found";
import StorePage from "@/pages/StorePage";
import StudioAdminPage from "@/pages/StudioAdminPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <AppProvider>
      <AppShell>
        <Switch>
          <Route path="/">
            <ErrorBoundary>
              <MapPage />
            </ErrorBoundary>
          </Route>
          <Route path="/feed">
            <ErrorBoundary>
              <FeedPage />
            </ErrorBoundary>
          </Route>
          <Route path="/me">
            <ErrorBoundary>
              <MePage />
            </ErrorBoundary>
          </Route>
          <Route path="/community">
            <ErrorBoundary>
              <CommunityPage />
            </ErrorBoundary>
          </Route>
          <Route path="/store">
            <ErrorBoundary>
              <StorePage />
            </ErrorBoundary>
          </Route>
          <Route path="/brands">
            <ErrorBoundary>
              <BrandsPage />
            </ErrorBoundary>
          </Route>
          <Route path="/brand/:slug">
            <ErrorBoundary>
              <BrandPage />
            </ErrorBoundary>
          </Route>
          <Route path="/challenges">
            <ErrorBoundary>
              <ChallengesPage />
            </ErrorBoundary>
          </Route>
          <Route path="/messages">
            <ErrorBoundary>
              <MessagesPage />
            </ErrorBoundary>
          </Route>
          <Route path="/circles">
            <ErrorBoundary>
              <CirclesPage />
            </ErrorBoundary>
          </Route>
          <Route path="/admin/studio">
            <ErrorBoundary>
              <StudioAdminPage />
            </ErrorBoundary>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </AppProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </QueryClientProvider>
  );
}
