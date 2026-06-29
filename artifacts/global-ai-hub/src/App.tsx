import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/home";
import Tools from "@/pages/tools";
import News from "@/pages/news";
import Models from "@/pages/models";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Onboarding from "@/pages/auth/onboarding";

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

  if (!isLoading && !isAuthenticated) {
    navigate("/login");
    return null;
  }
  return (
    <AuthLayout>
      <Onboarding />
    </AuthLayout>
  );
}

function Router() {
  return (
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
      <Route path="/models">
        <Layout><Models /></Layout>
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
      <Route>
        <Layout><NotFound /></Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
