// Dashboard components barrel export
// Note: UserOverview is a server component and should be imported directly to avoid client/server conflicts
export { DashboardError } from "./dashboard-error";
export { DashboardHeader, DashboardSectionHeader } from "./dashboard-header";
export { DashboardTopbar } from "./dashboard-topbar";

// Admin page components
export { AdminPageHeader } from "./admin-page-header";
export { AdminPageShell } from "./admin-page-shell";

// Unified sidebar component (preferred for new implementations)
export {
  DashboardSidebar,
  MobileDashboardSidebar,
  type DashboardSidebarConfig,
  type NavItem,
  type NavSection,
} from "./dashboard-sidebar";

// Role-specific sidebar components
export { AdminSidebar, MobileAdminSidebar } from "./admin-sidebar";
export { BusinessSidebar, MobileBusinessSidebar } from "./business-sidebar";
export {
  InstructorSidebar,
  MobileInstructorSidebar,
} from "./instructor-sidebar";
export { MobileStudentSidebar, StudentSidebar } from "./student-sidebar";

// Shared sidebar component (recommended for new implementations)
export {
  SharedDashboardSidebar,
  MobileSharedSidebar,
  type SharedDashboardSidebarProps,
  type MobileSharedSidebarProps,
} from "./shared-sidebar";

export { LearningStatsCard } from "./learning-stats-card";
export { TodaysEnergyWidget } from "./todays-energy-widget";
export { YourEnergyWidget } from "./your-energy-widget";
