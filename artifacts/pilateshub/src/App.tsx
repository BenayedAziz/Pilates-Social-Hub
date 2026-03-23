import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { Route, Switch } from "wouter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppShell } from "@/components/layout/AppShell";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Lazy load pages for code splitting
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const BrandPage = lazy(() => import("@/pages/BrandPage"));
const BrandsPage = lazy(() => import("@/pages/BrandsPage"));
const ChallengesPage = lazy(() => import("@/pages/ChallengesPage"));
const CirclesPage = lazy(() => import("@/pages/CirclesPage"));
const CommunityPage = lazy(() => import("@/pages/CommunityPage"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const MapPage = lazy(() => import("@/pages/MapPage"));
const MePage = lazy(() => import("@/pages/MePage"));
const EditProfilePage = lazy(() => import("@/pages/EditProfilePage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const NotFound = lazy(() => import("@/pages/not-found"));
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const StorePage = lazy(() => import("@/pages/StorePage"));
const BookingPage = lazy(() => import("@/pages/BookingPage"));
const CoachPage = lazy(() => import("@/pages/CoachPage"));
const StudioAdminPage = lazy(() => import("@/pages/StudioAdminPage"));
const WearableSettingsPage = lazy(() => import("@/pages/WearableSettingsPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState(
    () => localStorage.getItem("pilateshub-onboarded") === "true",
  );

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AuthPage />
      </Suspense>
    );
  }

  if (!isOnboarded) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <OnboardingPage onComplete={() => setIsOnboarded(true)} />
      </Suspense>
    );
  }

  return (
    <AppProvider>
      <AppShell>
        <Suspense fallback={<LoadingSpinner />}>
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
            <Route path="/me/edit">
              <ErrorBoundary>
                <EditProfilePage />
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
            <Route path="/coach/:slug">
              <ErrorBoundary>
                <CoachPage />
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
            <Route path="/booking/:studioId">
              <ErrorBoundary>
                <BookingPage />
              </ErrorBoundary>
            </Route>
            <Route path="/admin/studio">
              <ErrorBoundary>
                <StudioAdminPage />
              </ErrorBoundary>
            </Route>
            <Route path="/settings/wearables">
              <ErrorBoundary>
                <WearableSettingsPage />
              </ErrorBoundary>
            </Route>
            <Route path="/checkout">
              <ErrorBoundary>
                <CheckoutPage />
              </ErrorBoundary>
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Suspense>
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
