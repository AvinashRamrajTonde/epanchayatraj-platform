import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Suspense } from "react";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { useTenant } from "./context/TenantContext";
import { getTheme } from "./themes";

// Auth
import SignIn from "./pages/auth/SignIn";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

// SuperAdmin
import SuperAdminLayout from "./layout/SuperAdminLayout";
import Dashboard from "./pages/superadmin/Dashboard";
import VillageList from "./pages/superadmin/VillageList";
import VillageOnboard from "./pages/superadmin/VillageOnboard";
import VillageDetail from "./pages/superadmin/VillageDetail";
import TehsilList from "./pages/superadmin/TehsilList";
import SmtpConfig from "./pages/superadmin/SmtpConfig";
import GlobalSettings from "./pages/superadmin/GlobalSettings";
import VillageSEO from "./pages/superadmin/VillageSEO";
import Subscriptions from "./pages/superadmin/Subscriptions";
import BulkMail from "./pages/superadmin/BulkMail";
import ContactsDirectory from "./pages/superadmin/ContactsDirectory";
import ProtectedRoute from "./components/ProtectedRoute";

// Village Admin
import VillageAdminLayout from "./layout/VillageAdminLayout";
import VillageAdminDashboard from "./pages/village-admin/Dashboard";
import Members from "./pages/village-admin/Members";
import Notices from "./pages/village-admin/Notices";
import Gallery from "./pages/village-admin/Gallery";
import ContentManager from "./pages/village-admin/ContentManager";
import Applications from "./pages/village-admin/Applications";
import VillageSettings from "./pages/village-admin/Settings";
import HeroSlides from "./pages/village-admin/HeroSlides";
import Programs from "./pages/village-admin/Programs";
import Schemes from "./pages/village-admin/Schemes";
import ContactSubmissions from "./pages/village-admin/ContactSubmissions";
import Awards from "./pages/village-admin/Awards";
import FinancialReports from "./pages/village-admin/FinancialReports";
import DevelopmentWorks from "./pages/village-admin/DevelopmentWorks";
import GramsabhaAdmin from "./pages/village-admin/Gramsabha";
import SchoolsAdmin from "./pages/village-admin/Schools";
import CertificateManagement from "./pages/village-admin/CertificateManagement";
import PaymentConfigAdmin from "./pages/village-admin/PaymentConfigAdmin";
import ComplaintManagement from "./pages/village-admin/ComplaintManagement";
import TaxCollectionDashboard from "./pages/village-admin/TaxCollectionDashboard";

// Citizen Portal
import CitizenLayout from "./layout/CitizenLayout";
import CitizenProtectedRoute from "./components/CitizenProtectedRoute";
import CitizenLogin from "./pages/citizen/CitizenLogin";
import CitizenRegister from "./pages/citizen/CitizenRegister";
import ForgotPassword from "./pages/citizen/ForgotPassword";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import CitizenServices from "./pages/citizen/CitizenServices";
import FamilyManagement from "./pages/citizen/FamilyManagement";
import ApplyCertificate from "./pages/citizen/ApplyCertificate";
import PaymentPage from "./pages/citizen/PaymentPage";
import MyApplications from "./pages/citizen/MyApplications";
import ApplicationDetail from "./pages/citizen/ApplicationDetail";
import VerifyCertificate from "./pages/citizen/VerifyCertificate";
import CitizenNotices from "./pages/citizen/CitizenNotices";

function ThemeLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500">लोड होत आहे...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { tenantType, village, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  if (tenantType === "superadmin") {
    return (
      <Routes>
        {/* SuperAdmin protected routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/villages" element={<VillageList />} />
          <Route path="/villages/new" element={<VillageOnboard />} />
          <Route path="/villages/:id" element={<VillageDetail />} />
          <Route path="/tehsils" element={<TehsilList />} />
          <Route path="/smtp-config" element={<SmtpConfig />} />
          <Route path="/global-settings" element={<GlobalSettings />} />
          <Route path="/seo" element={<VillageSEO />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/mail" element={<BulkMail />} />
          <Route path="/contacts" element={<ContactsDirectory />} />
        </Route>

        {/* Auth routes (not protected) */}
        <Route path="/signin" element={<SignIn />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  if (tenantType === "village") {
    const theme = getTheme(village?.theme || "classic");
    const Layout = theme.Layout;
    const HomePage = theme.HomePage;
    const AboutPage = theme.AboutPage;
    const NoticesPage = theme.NoticesPage;
    const ProgramsPage = theme.ProgramsPage;
    const SchemesPage = theme.SchemesPage;
    const AdministrationPage = theme.AdministrationPage;
    const GalleryPage = theme.GalleryPage;
    const ServicesPage = theme.ServicesPage;
    const ImportantPage = theme.ImportantPage;
    const ContactPage = theme.ContactPage;
    const AwardsPage = theme.AwardsPage;
    const FinancialReportsPage = theme.FinancialReportsPage;
    const DeclarationsPage = theme.DeclarationsPage;
    const GramsabhaPage = theme.GramsabhaPage;
    const SchoolsPage = theme.SchoolsPage;
    const ComplaintPage = theme.ComplaintPage;
    const TaxPaymentPage = theme.TaxPaymentPage;

    return (
      <Routes>
        {/* Public village website - theme-based */}
        <Route
          element={
            <Suspense fallback={<ThemeLoadingFallback />}>
              <Layout />
            </Suspense>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="/notices"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <NoticesPage />
              </Suspense>
            }
          />
          <Route
            path="/programs"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <ProgramsPage />
              </Suspense>
            }
          />
          <Route
            path="/schemes"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <SchemesPage />
              </Suspense>
            }
          />
          <Route
            path="/administration"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <AdministrationPage />
              </Suspense>
            }
          />
          <Route
            path="/gallery"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <GalleryPage />
              </Suspense>
            }
          />
          <Route
            path="/services"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <ServicesPage />
              </Suspense>
            }
          />
          <Route
            path="/important"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <ImportantPage />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route
            path="/awards"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <AwardsPage />
              </Suspense>
            }
          />
          <Route
            path="/financial-reports"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <FinancialReportsPage />
              </Suspense>
            }
          />
          <Route
            path="/declarations"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <DeclarationsPage />
              </Suspense>
            }
          />
          <Route
            path="/gramsabha"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <GramsabhaPage />
              </Suspense>
            }
          />
          <Route
            path="/schools"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <SchoolsPage />
              </Suspense>
            }
          />
          <Route
            path="/complaint"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <ComplaintPage />
              </Suspense>
            }
          />
          <Route
            path="/tax-payment"
            element={
              <Suspense fallback={<ThemeLoadingFallback />}>
                <TaxPaymentPage />
              </Suspense>
            }
          />
        </Route>

        {/* Village Admin login */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin/signin" element={<Navigate to="/signin" replace />} />

        {/* Citizen Portal - Public routes */}
        <Route path="/citizen/login" element={<CitizenLogin />} />
        <Route path="/citizen/register" element={<CitizenRegister />} />
        <Route path="/citizen/forgot-password" element={<ForgotPassword />} />
        <Route path="/citizen/verify/:certificateNo" element={<VerifyCertificate />} />
        <Route path="/citizen/verify" element={<VerifyCertificate />} />

        {/* Citizen Portal - Protected routes */}
        <Route
          path="/citizen"
          element={
            <CitizenProtectedRoute>
              <CitizenLayout />
            </CitizenProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CitizenDashboard />} />
          <Route path="services" element={<CitizenServices />} />
          <Route path="family" element={<FamilyManagement />} />
          <Route path="family/:familyId" element={<FamilyManagement />} />
          <Route path="apply/:certTypeId" element={<ApplyCertificate />} />
          <Route path="payment/:applicationId" element={<PaymentPage />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="applications/:id" element={<ApplicationDetail />} />
          <Route path="notices" element={<CitizenNotices />} />
        </Route>

        {/* Village Admin protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <VillageAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<VillageAdminDashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="notices" element={<Notices />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="content/:section" element={<ContentManager />} />
          <Route path="applications" element={<Applications />} />
          <Route path="hero-slides" element={<HeroSlides />} />
          <Route path="programs" element={<Programs />} />
          <Route path="schemes" element={<Schemes />} />
          <Route path="contact-submissions" element={<ContactSubmissions />} />
          <Route path="awards" element={<Awards />} />
          <Route path="financial-reports" element={<FinancialReports />} />
          <Route path="development-works" element={<DevelopmentWorks />} />
          <Route path="gramsabhas" element={<GramsabhaAdmin />} />
          <Route path="schools" element={<SchoolsAdmin />} />
          <Route path="certificates" element={<CertificateManagement />} />
          <Route path="payment-config" element={<PaymentConfigAdmin />} />
          <Route path="settings" element={<VillageSettings />} />
          <Route path="complaints" element={<ComplaintManagement />} />
          <Route path="tax-collection" element={<TaxCollectionDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Unknown tenant → Marketing landing page
  return (
    <Routes>
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
