import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import MobileNavBar from "./MobileNavBar";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ResponsiveLayoutProps {
  children: ReactNode;
  onViewChange?: (view: string) => void;
  onContactSelect?: (contactId: string) => void;
  onDealSelect?: (dealId: string) => void;
  onCompanySelect?: (companyId: string) => void;
}

const ResponsiveLayout = ({ 
  children, 
  onViewChange,
  onContactSelect,
  onDealSelect,
  onCompanySelect 
}: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex h-screen w-full overflow-hidden flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden pb-16">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNavBar 
          onViewChange={onViewChange}
          onContactSelect={onContactSelect}
          onDealSelect={onDealSelect}
          onCompanySelect={onCompanySelect}
        />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Desktop Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ResponsiveLayout;
