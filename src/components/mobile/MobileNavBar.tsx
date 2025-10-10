import { NavLink } from "react-router-dom";
import { Home, Users, Briefcase, Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface MobileNavBarProps {
  onViewChange?: (view: string) => void;
  onContactSelect?: (contactId: string) => void;
  onDealSelect?: (dealId: string) => void;
  onCompanySelect?: (companyId: string) => void;
}

const MobileNavBar = ({ onViewChange, onContactSelect, onDealSelect, onCompanySelect }: MobileNavBarProps) => {
  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/contacts", icon: Users, label: "Contacts" },
    { path: "/deals", icon: Briefcase, label: "Deals" },
    { path: "/scheduling", icon: Calendar, label: "Calendar" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden pb-safe">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center flex-1 h-full min-w-[44px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
        
        {/* More Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full min-w-[44px] text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="h-6 w-6" />
              <span className="text-xs mt-1">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] p-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 px-2">Navigation</h2>
                <SidebarProvider>
                  <AppSidebar />
                </SidebarProvider>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default MobileNavBar;
