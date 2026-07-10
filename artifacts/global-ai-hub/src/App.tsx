import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { SocialProvider } from "@/context/SocialContext";
import { SupportProvider } from "@/context/SupportContext";
import NotFound from "@/pages/not-found";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AssistantWidget from "@/components/assistant/AssistantWidget";
import SupportAgentWidget from "@/components/support/SupportAgentWidget";
import ChatWidget from "@/components/social/ChatWidget";
import MessagingOverlay from "@/components/social/MessagingOverlay";
import Home from "@/pages/home";
import Tools from "@/pages/tools";
import News from "@/pages/news";
import AiVideoStudio from "@/pages/ai-video-studio";
import Models from "@/pages/models";
import Jobs from "@/pages/jobs";
import RoiCalculator from "@/pages/roi-calculator";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Onboarding from "@/pages/auth/onboarding";
import AccountRecovery from "@/pages/auth/account-recovery";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin";
import Pricing from "@/pages/pricing";
import GeoLanguageNotice from "@/components/common/GeoLanguageNotice";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {children}
    </div>
  );
}

function OnboardingGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isLoading, isAuthenticated, navigate]);

  if (!isLoading && !isAuthenticated) return null;
  return (
    <AuthLayout>
      <Onboarding />
    </AuthLayout>
  );
}

function DashboardGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isLoading, isAuthenticated, navigate]);

  if (!isLoading && !isAuthenticated) return null;
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

function AdminGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isLoading, isAuthenticated, navigate]);

  if (!isLoading && !isAuthenticated) return null;
  if (!isLoading && user?.role !== "admin") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 max-w-lg text-center" data-testid="admin-access-denied">
          <h1 className="text-2xl font-display font-bold text-white mb-2">Access Restricted</h1>
          <p className="text-muted-foreground">This area is reserved for Super Admin accounts only.</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <AdminDashboard />
    </Layout>
  );
}

function Router() {
  return (
    <>
      <Switch>
        <Route path="/">
          <Layout><Home /></Layout>
        </Route>
        <Route path="/tools">
          <Layout><Tools /></Layout>
        </Route>
        <Route path="/news">
          <Layout><News /></Layout>
        </Route>
        <Route path="/ai-video-studio">
          <Layout><AiVideoStudio /></Layout>
        </Route>
        <Route path="/models">
          <Layout><Models /></Layout>
        </Route>
        <Route path="/jobs">
          <Layout><Jobs /></Layout>
        </Route>
        <Route path="/roi-calculator">
          <Layout><RoiCalculator /></Layout>
        </Route>
        <Route path="/pricing">
          <Layout><Pricing /></Layout>
        </Route>
        <Route path="/login">
          <AuthLayout><Login /></AuthLayout>
        </Route>
        <Route path="/signup">
          <AuthLayout><Signup /></AuthLayout>
        </Route>
        <Route path="/onboarding">
          <OnboardingGuard />
        </Route>
        <Route path="/account-recovery">
          <AuthLayout><AccountRecovery /></AuthLayout>
        </Route>
        <Route path="/dashboard">
          <DashboardGuard />
        </Route>
        <Route path="/admin">
          <AdminGuard />
        </Route>
        <Route>
          <Layout><NotFound /></Layout>
        </Route>
      </Switch>
      <AssistantWidget />
      <SupportAgentWidget />
      <ChatWidget />
      <MessagingOverlay />
      <GeoLanguageNotice />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocialProvider>
          <SupportProvider>
            <QueryClientProvider client={queryClient}>
              <TooltipProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <Router />
                </WouterRouter>
                <Toaster />
              </TooltipProvider>
            </QueryClientProvider>
          </SupportProvider>
        </SocialProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
