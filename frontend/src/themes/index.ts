import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import { classicFonts, modernFonts, type ThemeFontConfig } from "./fontConfig";

export type { ThemeFontConfig };

export interface ThemeConfig {
  id: string;
  name: string;
  nameMarathi: string;
  Layout: LazyExoticComponent<ComponentType<{ children?: React.ReactNode }>>;
  HomePage: LazyExoticComponent<ComponentType>;
  AboutPage: LazyExoticComponent<ComponentType>;
  NoticesPage: LazyExoticComponent<ComponentType>;
  ProgramsPage: LazyExoticComponent<ComponentType>;
  SchemesPage: LazyExoticComponent<ComponentType>;
  AdministrationPage: LazyExoticComponent<ComponentType>;
  GalleryPage: LazyExoticComponent<ComponentType>;
  ServicesPage: LazyExoticComponent<ComponentType>;
  ImportantPage: LazyExoticComponent<ComponentType>;
  ContactPage: LazyExoticComponent<ComponentType>;
  AwardsPage: LazyExoticComponent<ComponentType>;
  FinancialReportsPage: LazyExoticComponent<ComponentType>;
  DeclarationsPage: LazyExoticComponent<ComponentType>;
  GramsabhaPage: LazyExoticComponent<ComponentType>;
  SchoolsPage: LazyExoticComponent<ComponentType>;
  ComplaintPage: LazyExoticComponent<ComponentType>;
  TaxPaymentPage: LazyExoticComponent<ComponentType>;
  /** Font configuration for logo / headings / body */
  fonts: ThemeFontConfig;
}

const classicTheme: ThemeConfig = {
  id: "classic",
  name: "Classic",
  nameMarathi: "क्लासिक",
  fonts: classicFonts,
  Layout: lazy(() => import("./classic/ClassicLayout")),
  HomePage: lazy(() => import("./classic/pages/HomePage")),
  AboutPage: lazy(() => import("./classic/pages/AboutPage")),
  NoticesPage: lazy(() => import("./classic/pages/NoticesPage")),
  ProgramsPage: lazy(() => import("./classic/pages/ProgramsPage")),
  SchemesPage: lazy(() => import("./classic/pages/SchemesPage")),
  AdministrationPage: lazy(() => import("./classic/pages/AdministrationPage")),
  GalleryPage: lazy(() => import("./classic/pages/GalleryPage")),
  ServicesPage: lazy(() => import("./classic/pages/ServicesPage")),
  ImportantPage: lazy(() => import("./classic/pages/ImportantPage")),
  ContactPage: lazy(() => import("./classic/pages/ContactPage")),
  AwardsPage: lazy(() => import("./classic/pages/AwardsPage")),
  FinancialReportsPage: lazy(() => import("./classic/pages/FinancialReportsPage")),
  DeclarationsPage: lazy(() => import("./classic/pages/DeclarationsPage")),
  GramsabhaPage: lazy(() => import("./classic/pages/GramsabhaPage")),
  SchoolsPage: lazy(() => import('./classic/pages/SchoolsPage')),
  ComplaintPage: lazy(() => import('./classic/pages/ComplaintPage')),
  TaxPaymentPage: lazy(() => import('./classic/pages/TaxPaymentPage')),
};

const modernTheme: ThemeConfig = {
  id: "modern",
  name: "Modern",
  nameMarathi: "आधुनिक",
  fonts: modernFonts,
  Layout: lazy(() => import("./modern/ModernLayout")),
  HomePage: lazy(() => import("./modern/pages/HomePage")),
  AboutPage: lazy(() => import("./modern/pages/AboutPage")),
  NoticesPage: lazy(() => import("./modern/pages/NoticesPage")),
  ProgramsPage: lazy(() => import("./modern/pages/ProgramsPage")),
  SchemesPage: lazy(() => import("./modern/pages/SchemesPage")),
  AdministrationPage: lazy(() => import("./modern/pages/AdministrationPage")),
  GalleryPage: lazy(() => import("./modern/pages/GalleryPage")),
  ServicesPage: lazy(() => import("./modern/pages/ServicesPage")),
  ImportantPage: lazy(() => import("./modern/pages/ImportantPage")),
  ContactPage: lazy(() => import("./modern/pages/ContactPage")),
  AwardsPage: lazy(() => import("./modern/pages/AwardsPage")),
  FinancialReportsPage: lazy(() => import("./modern/pages/FinancialReportsPage")),
  DeclarationsPage: lazy(() => import("./modern/pages/DeclarationsPage")),
  GramsabhaPage: lazy(() => import("./modern/pages/GramsabhaPage")),
  SchoolsPage: lazy(() => import('./modern/pages/SchoolsPage')),
  ComplaintPage: lazy(() => import('./modern/pages/ComplaintPage')),
  TaxPaymentPage: lazy(() => import('./modern/pages/TaxPaymentPage')),
};

const themes: Record<string, ThemeConfig> = {
  classic: classicTheme,
  modern: modernTheme,
};

export function getTheme(themeId: string): ThemeConfig {
  return themes[themeId] || themes.classic;
}

export default themes;
