 import { useEffect, useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import DashboardLayout from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback } from "@/components/ui/avatar";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/error-utils";
import { 
    Search, 
    UserPlus,
    Edit,
    Loader2
  } from "lucide-react";
 import { AppRole } from "@/lib/supabase";
 
 interface User {
   id: string;
   user_id: string;
   full_name: string;
   phone: string | null;
   created_at: string;
   roles: AppRole[];
 }
 
 const AdminUsers = () => {
   const [users, setUsers] = useState<User[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedUser, setSelectedUser] = useState<User | null>(null);
   const [newRole, setNewRole] = useState<AppRole>("student");
   const [isUpdating, setIsUpdating] = useState(false);
   const { toast } = useToast();
 
   const fetchUsers = async () => {
     // Fetch profiles
     const { data: profiles } = await supabase
       .from("profiles")
       .select("*")
       .order("created_at", { ascending: false });
 
     if (profiles) {
       // Fetch roles for all users
       const userIds = profiles.map((p) => p.user_id);
       const { data: roles } = await supabase
         .from("user_roles")
         .select("user_id, role")
         .in("user_id", userIds);
 
       const roleMap = new Map<string, AppRole[]>();
       roles?.forEach((r) => {
         const existing = roleMap.get(r.user_id) || [];
         roleMap.set(r.user_id, [...existing, r.role as AppRole]);
       });
 
       const usersWithRoles = profiles.map((p) => ({
         ...p,
         roles: roleMap.get(p.user_id) || [],
       }));
 
       setUsers(usersWithRoles);
     }
     setIsLoading(false);
   };
 
   useEffect(() => {
     fetchUsers();
   }, []);
 
   const handleAddRole = async () => {
     if (!selectedUser) return;
     setIsUpdating(true);
 
     try {
       const { error } = await supabase.from("user_roles").insert({
         user_id: selectedUser.user_id,
         role: newRole,
       });
 
       if (error) throw error;
 
       toast({
         title: "Role added",
         description: `${newRole} role added to ${selectedUser.full_name}`,
       });
 
       await fetchUsers();
       setSelectedUser(null);
      } catch (error: any) {
        toast({
          title: "Error",
          description: getUserFriendlyError(error),
          variant: "destructive",
        });
      } finally {
        setIsUpdating(false);
      }
    };

    const handleRemoveRole = async (userId: string, role: AppRole) => {
      try {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);

        if (error) throw error;

        toast({
          title: "Role removed",
          description: `${role} role removed`,
        });

        await fetchUsers();
      } catch (error: any) {
        toast({
          title: "Error",
          description: getUserFriendlyError(error),
          variant: "destructive",
        });
      }
    };
 
   const filteredUsers = users.filter((user) =>
     user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
   );
 
   const getRoleBadgeColor = (role: AppRole) => {
     switch (role) {
       case "admin":
         return "bg-destructive/10 text-destructive";
       case "coordinator":
         return "bg-info/10 text-info";
       case "supervisor":
         return "bg-success/10 text-success";
       default:
         return "bg-primary/10 text-primary";
     }
   };
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl lg:text-3xl font-display font-bold">Users</h1>
             <p className="text-muted-foreground mt-1">
               Manage user accounts and roles
             </p>
           </div>
         </div>
 
         {/* Search */}
         <div className="relative max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
           <Input
             placeholder="Search users..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-10"
           />
         </div>
 
         {/* Users List */}
         {isLoading ? (
           <div className="flex items-center justify-center py-16">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
         ) : (
           <div className="grid gap-4">
             {filteredUsers.map((user) => (
               <Card key={user.id}>
                 <CardContent className="p-6">
                   <div className="flex items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                       <Avatar className="h-12 w-12">
                         <AvatarFallback className="bg-primary/10 text-primary">
                           {user.full_name
                             .split(" ")
                             .map((n) => n[0])
                             .join("")}
                         </AvatarFallback>
                       </Avatar>
                       <div>
                         <h3 className="font-semibold">{user.full_name}</h3>
                         <div className="flex flex-wrap gap-2 mt-1">
                           {user.roles.map((role) => (
                             <Badge
                               key={role}
                               className={`${getRoleBadgeColor(role)} border-0 cursor-pointer`}
                               onClick={() => {
                                 if (user.roles.length > 1) {
                                   handleRemoveRole(user.user_id, role);
                                 }
                               }}
                             >
                               {role}
                             </Badge>
                           ))}
                         </div>
                       </div>
                     </div>
 
                     <Dialog>
                       <DialogTrigger asChild>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => setSelectedUser(user)}
                         >
                           <UserPlus className="w-4 h-4 mr-2" />
                           Add Role
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="bg-card">
                         <DialogHeader>
                           <DialogTitle>Add Role</DialogTitle>
                           <DialogDescription>
                             Add a new role to {selectedUser?.full_name}
                           </DialogDescription>
                         </DialogHeader>
                         <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                           <SelectTrigger>
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="bg-card">
                             <SelectItem value="student">Student</SelectItem>
                             <SelectItem value="supervisor">Supervisor</SelectItem>
                             <SelectItem value="coordinator">Coordinator</SelectItem>
                             <SelectItem value="admin">Admin</SelectItem>
                           </SelectContent>
                         </Select>
                         <DialogFooter>
                           <Button
                             onClick={handleAddRole}
                             disabled={isUpdating}
                             className="bg-gradient-primary"
                           >
                             {isUpdating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                             Add Role
                           </Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 };
 
 export default AdminUsers;