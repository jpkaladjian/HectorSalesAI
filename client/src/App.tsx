import { Switch, Route, useLocation, Redirect } from "wouter";
import { useEffect, useMemo, type ReactNode, type CSSProperties } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Admin from "@/pages/Admin";
import Appointments from "@/pages/Appointments";
import AdminResetPassword from "@/pages/AdminResetPassword";
import Debug from "@/pages/Debug";
import AcceptInvite from "@/pages/AcceptInvite";
import ApiSecurityDashboard from "@/pages/admin/ApiSecurityDashboard";
import Learning from "@/pages/admin/Learning";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppAdminSidebar } from "@/components/admin/AppAdminSidebar";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { OrganizationsPage } from "@/pages/admin/OrganizationsPage";
import { TeamsPage } from "@/pages/admin/TeamsPage";
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage";
import CrmDashboard from "@/pages/CrmDashboard";
import { UsersPage } from '@/pages/admin/UsersPage';
import Prospects from "@/pages/Prospects";
import ProspectsAQualifier from "@/pages/ProspectsAQualifier";
import Opportunities from "@/pages/Opportunities";
import OpportunitiesModule from "@/pages/OpportunitiesModule";
import OpportunityDetail from "@/pages/OpportunityDetail";
import CompetitorModule from "@/pages/CompetitorModule";
import Actions from "@/pages/Actions";
import Rdvs from "@/pages/Rdvs";
import AffairesChaudes from "@/pages/AffairesChaudes";
import TransfertsSdr from "@/pages/TransfertsSdr";
import WorkflowPage from "@/pages/WorkflowPage";
import BatchImport from "@/pages/BatchImport";
import StatsDashboard from "@/pages/StatsDashboard";
import ProspectionCampagnes from "@/pages/ProspectionCampagnes";
import ProspectionAnalytics from "@/pages/ProspectionAnalytics";
import CampaignWizard from "@/pages/CampaignWizard";
import PhoneEnrichmentTest from "@/pages/PhoneEnrichmentTest";
import EnrichmentTest from "@/pages/EnrichmentTest";
import Phoning from "@/pages/Phoning";
import PhoningAnalytics from "@/pages/phoning/PhoningAnalytics";
import { PhoneConfigPage } from "@/pages/admin/PhoneConfigPage";
import AdminPhoneConfigDynamic from "@/components/admin/AdminPhoneConfigDynamic";
import GpsAdminPage from "@/pages/admin/GpsAdminPage";
import SupervisionEquipe from "@/pages/admin/SupervisionEquipe";
import GpsTrackingPage from "@/pages/GpsTrackingPage";
import { AdminOCRAnalytics } from "@/pages/AdminOCRAnalytics";
import { AdminAnalyticsPage } from "@/pages/admin/AdminAnalyticsPage";
import { ConcurrentsPage } from "@/pages/admin/ConcurrentsPage";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import { NavigationBar } from "@/components/NavigationBar";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// Admin Layout Wrapper using Shadcn Sidebar
function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  const style = useMemo(() => ({
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  }), []);

  return (
    <SidebarProvider style={style as CSSProperties}>
      <div className="flex h-screen w-full">
        <AppAdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex flex-wrap items-center justify-between gap-2 p-4 border-b bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold">Administration Hector</h1>
            </div>
            <NavigationBar showHomeButton={true} />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect unauthenticated users to login
  useEffect(() => {
    const publicPaths = [
      '/login', 
      '/forgot-password', 
      '/reset-password', 
      '/admin-reset', 
      '/accept-invite', 
      '/debug'
    ];
    
    const isPublicPath = publicPaths.some(path => location.startsWith(path)) || location === '/';
    
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      console.log(`[Router] Redirecting unauthenticated user from ${location} to /login`);
      setLocation('/login');
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Debug page - always accessible */}
      <Route path="/debug" component={Debug} />
      
      {!isAuthenticated ? (
        <>
          <Route path="/" component={Login} />
          <Route path="/login" component={Login} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/admin-reset" component={AdminResetPassword} />
          <Route path="/accept-invite" component={AcceptInvite} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/home" component={Home} />
          <Route path="/admin">
            <Redirect to="/admin/users" />
          </Route>
          <Route path="/admin/api-security" component={ApiSecurityDashboard} />
          <Route path="/admin/learning" component={Learning} />
          
          {/* New Admin UI Pages with Shadcn Sidebar */}
          <Route path="/admin/dashboard">
            <AdminLayoutWrapper>
              <AdminDashboard />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/organizations">
            <AdminLayoutWrapper>
              <OrganizationsPage />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/teams">
            <AdminLayoutWrapper>
              <TeamsPage />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/audit-logs">
            <AdminLayoutWrapper>
              <AuditLogsPage />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/users">
            <AdminLayoutWrapper>
              <UsersPage />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/phone-config">
            <AdminLayoutWrapper>
              <PhoneConfigPage />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/phone-config-dynamic">
            <AdminLayoutWrapper>
              <AdminPhoneConfigDynamic />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/gps">
            <AdminLayoutWrapper>
              <GpsAdminPage />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/supervision-equipe">
            <AdminLayoutWrapper>
              <SupervisionEquipe />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/ocr-analytics">
            <AdminLayoutWrapper>
              <AdminOCRAnalytics />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/analytics">
            <AdminLayoutWrapper>
              <AdminAnalyticsPage />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/admin/concurrents">
            <AdminLayoutWrapper>
              <ConcurrentsPage />
            </AdminLayoutWrapper>
          </Route>
          <Route path="/appointments" component={Appointments} />
          <Route path="/crm" component={CrmDashboard} />
          <Route path="/crm/dashboard" component={CrmDashboard} />
          <Route path="/crm/prospects" component={Prospects} />
          <Route path="/crm/prospects-a-qualifier" component={ProspectsAQualifier} />
          <Route path="/crm/opportunities" component={Opportunities} />
          <Route path="/crm/opportunities-module/:id" component={OpportunityDetail} />
          <Route path="/crm/opportunities-module" component={OpportunitiesModule} />
          <Route path="/crm/competitor-module" component={CompetitorModule} />
          <Route path="/crm/actions" component={Actions} />
          <Route path="/crm/rdvs" component={Rdvs} />
          <Route path="/crm/affaires-chaudes" component={AffairesChaudes} />
          <Route path="/crm/transferts" component={TransfertsSdr} />
          <Route path="/crm/workflow" component={WorkflowPage} />
          <Route path="/crm/batch-import" component={BatchImport} />
          <Route path="/crm/stats" component={StatsDashboard} />
          <Route path="/phoning" component={Phoning} />
          <Route path="/phoning/analytics" component={PhoningAnalytics} />
          <Route path="/prospection/campagnes" component={ProspectionCampagnes} />
          <Route path="/prospection/campagnes/nouvelle" component={CampaignWizard} />
          <Route path="/prospection/analytics" component={ProspectionAnalytics} />
          <Route path="/test/phone-enrichment" component={PhoneEnrichmentTest} />
          <Route path="/test/enrichment" component={EnrichmentTest} />
          <Route path="/gps/track" component={GpsTrackingPage} />
          {/* 404 only for authenticated users */}
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
