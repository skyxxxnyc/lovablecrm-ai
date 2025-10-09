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
  CheckSquare,
  Calendar,
  TrendingUp,
  BarChart3,
  Zap,
  Mail,
  Settings,
  CreditCard,
  MessageSquare,
  Edit3,
  BookOpen,
  Database,
  LogOut,
  Moon,
  Sun,
  Plus,
} from "lucide-react";
import { Button } from "./ui/button";
import { NewItemDialog } from "./NewItemDialog";

const crmItems = [
  { title: "Contacts", url: "/dashboard", icon: Users },
  { title: "Companies", url: "/companies", icon: Building2 },
  { title: "Deals", url: "/deals", icon: Briefcase },
];

const tasksItems = [
  { title: "Tasks", url: "/dashboard", icon: CheckSquare },
  { title: "Calendar", url: "/scheduling", icon: Calendar },
];

const salesItems = [
  { title: "Pipeline", url: "/pipeline", icon: TrendingUp },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const automationItems = [
  { title: "Workflows", url: "/workflows", icon: Zap },
  { title: "Automation Rules", url: "/automation", icon: Settings },
];

const communicationItems = [
  { title: "AI Chat", url: "/dashboard", icon: Sparkles },
  { title: "Email Hub", url: "/email-hub", icon: Mail },
];

const configItems = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Custom Fields", url: "/custom-fields", icon: Database },
  { title: "Prompt Library", url: "/prompts", icon: BookOpen },
  { title: "Blog Admin", url: "/blog-admin", icon: Edit3 },
];

const otherItems = [
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
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
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="ml-3 font-bold text-lg">CRM</span>
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
                  <SidebarMenuButton onClick={() => setShowNewDialog(true)}>
                    <Plus className="h-4 w-4" />
                    <span>New</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => {}}>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* CRM */}
          <SidebarGroup>
            <SidebarGroupLabel>CRM</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {crmItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Tasks & Calendar */}
          <SidebarGroup>
            <SidebarGroupLabel>Tasks & Calendar</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tasksItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Sales & Analytics */}
          <SidebarGroup>
            <SidebarGroupLabel>Sales & Analytics</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {salesItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Automation */}
          <SidebarGroup>
            <SidebarGroupLabel>Automation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {automationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Communication */}
          <SidebarGroup>
            <SidebarGroupLabel>Communication</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {communicationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Configuration */}
          <SidebarGroup>
            <SidebarGroupLabel>Configuration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {configItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Other */}
          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {otherItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
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
              <SidebarMenuButton onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
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
