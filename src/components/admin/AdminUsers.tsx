import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldOff, UserX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Create a map of user_id to roles
      const rolesMap = new Map<string, string[]>();
      rolesData?.forEach((r) => {
        if (!rolesMap.has(r.user_id)) {
          rolesMap.set(r.user_id, []);
        }
        rolesMap.get(r.user_id)?.push(r.role);
      });

      // Get all users from profiles (since we can't access auth.users directly)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, created_at");

      if (profilesError) throw profilesError;

      const usersWithRoles: UserWithRole[] = (profilesData || []).map((profile) => ({
        id: profile.id,
        email: profile.email || "No email",
        created_at: profile.created_at,
        last_sign_in_at: null,
        roles: rolesMap.get(profile.id) || [],
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch users: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentRoles: string[]) => {
    try {
      const isAdmin = currentRoles.includes("admin");
      
      if (isAdmin) {
        // Remove admin role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;
        toast({ title: "Success", description: "Admin role removed" });
      } else {
        // Add admin role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (error) throw error;
        toast({ title: "Success", description: "Admin role granted" });
      }

      fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <Card><CardContent className="p-6">Loading users...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Total users: <span className="font-semibold">{users.length}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-base truncate">{user.email}</CardTitle>
                    {user.roles.map((role) => (
                      <Badge key={role} variant={role === "admin" ? "default" : "secondary"}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                  <CardDescription className="text-xs">
                    Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant={user.roles.includes("admin") ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => toggleAdminRole(user.id, user.roles)}
                  >
                    {user.roles.includes("admin") ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Remove Admin</span>
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Make Admin</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
