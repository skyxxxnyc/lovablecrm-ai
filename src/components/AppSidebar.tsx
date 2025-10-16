import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Sparkles,
  Search,
  Users,
  Building2,
  Briefcase,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  Mail,
  Settings,
  CreditCard,
  Database,
  LogOut,
  Moon,
  Sun,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { NewItemDialog } from "./NewItemDialog";

// Core navigation structure - simplified from 7 to 3 groups
const workItems = [
  { title: "Dashboard", url: "/dashboard", icon: Sparkles },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Deals", url: "/deals", icon: Briefcase },
  { title: "Calendar", url: "/scheduling", icon: Calendar },
];

const insightsItems = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Reports", url: "/reports", icon: TrendingUp },
  { title: "Email Hub", url: "/email-hub", icon: Mail },
];

const configureItems = [
  { title: "Workflows", url: "/workflows", icon: Zap },
  { title: "Automation", url: "/automation", icon: Settings },
  { title: "Integrations", url: "/integrations", icon: Database },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Billing", url: "/billing", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [companies, setCompanies] = useState([]);

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const fetchData = async () => {
    const { data: contactsData } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    
    const { data: dealsData } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    
    const { data: companiesData } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setContacts(contactsData || []);
    setDeals(dealsData || []);
    setCompanies(companiesData || []);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-center p-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="ml-3 font-bold text-lg">siaCRM</span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Quick Actions */}
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => setShowNewDialog(true)} aria-label="Create new item">
                    <Plus className="h-4 w-4" />
                    <span>New</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => {}} aria-label="Search">
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Work - Core CRM functionality */}
          <SidebarGroup>
            <SidebarGroupLabel>Work</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {workItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} aria-label={`Navigate to ${item.title}`}>
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Insights - Analytics & reporting */}
          <SidebarGroup>
            <SidebarGroupLabel>Insights</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {insightsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} aria-label={`Navigate to ${item.title}`}>
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Configure - Settings & automation */}
          <SidebarGroup>
            <SidebarGroupLabel>Configure</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {configureItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} aria-label={`Navigate to ${item.title}`}>
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut} aria-label="Sign out of your account">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <NewItemDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        onSuccess={fetchData}
      />
    </>
  );
}
