import { ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import MobileNavBar from "./MobileNavBar";
import Sidebar from "@/components/Sidebar";

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

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          onViewChange={onViewChange}
          onContactSelect={onContactSelect}
          onDealSelect={onDealSelect}
          onCompanySelect={onCompanySelect}
        />
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-hidden",
        isMobile && "pb-16" // Add bottom padding for mobile nav
      )}>
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileNavBar 
          onViewChange={onViewChange}
          onContactSelect={onContactSelect}
          onDealSelect={onDealSelect}
          onCompanySelect={onCompanySelect}
        />
      )}
    </div>
  );
};

export default ResponsiveLayout;
