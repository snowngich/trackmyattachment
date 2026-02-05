 import { useEffect, useState } from "react";
 import { Link } from "react-router-dom";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 import DashboardLayout from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { 
   Users, 
   Building2, 
   ClipboardList, 
   FileText,
   TrendingUp,
   Plus
 } from "lucide-react";
 
 const AdminDashboard = () => {
   const { profile } = useAuth();
   const [stats, setStats] = useState({
     totalUsers: 0,
     totalOrganizations: 0,
     totalAttachments: 0,
     totalLogs: 0,
   });
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchStats = async () => {
       const [users, orgs, attachments, logs] = await Promise.all([
         supabase.from("profiles").select("id", { count: "exact", head: true }),
         supabase.from("organizations").select("id", { count: "exact", head: true }),
         supabase.from("attachments").select("id", { count: "exact", head: true }),
         supabase.from("logs").select("id", { count: "exact", head: true }),
       ]);
 
       setStats({
         totalUsers: users.count || 0,
         totalOrganizations: orgs.count || 0,
         totalAttachments: attachments.count || 0,
         totalLogs: logs.count || 0,
       });
       setIsLoading(false);
     };
 
     fetchStats();
   }, []);
 
   const statCards = [
     {
       title: "Total Users",
       value: stats.totalUsers,
       icon: <Users className="w-6 h-6" />,
       color: "bg-primary/10 text-primary",
       href: "/admin/users",
     },
     {
       title: "Organizations",
       value: stats.totalOrganizations,
       icon: <Building2 className="w-6 h-6" />,
       color: "bg-info/10 text-info",
       href: "/admin/organizations",
     },
     {
       title: "Placements",
       value: stats.totalAttachments,
       icon: <ClipboardList className="w-6 h-6" />,
       color: "bg-success/10 text-success",
       href: "/admin/placements",
     },
     {
       title: "Total Logs",
       value: stats.totalLogs,
       icon: <FileText className="w-6 h-6" />,
       color: "bg-accent/10 text-accent",
       href: "/admin/reports",
     },
   ];
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl lg:text-3xl font-display font-bold">
               Admin Dashboard
             </h1>
             <p className="text-muted-foreground mt-1">
               System overview and management
             </p>
           </div>
         </div>
 
         {/* Stats Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {statCards.map((stat) => (
             <Link key={stat.title} to={stat.href}>
               <Card className="hover:shadow-md transition-shadow cursor-pointer">
                 <CardContent className="pt-6">
                   <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                       {stat.icon}
                     </div>
                     <div>
                       <p className="text-2xl font-bold">{stat.value}</p>
                       <p className="text-sm text-muted-foreground">{stat.title}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </Link>
           ))}
         </div>
 
         {/* Quick Actions */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card>
             <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
               <CardDescription>Common administrative tasks</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
               <Link to="/admin/users">
                 <Button variant="outline" className="w-full justify-start">
                   <Users className="w-4 h-4 mr-2" />
                   Manage Users
                 </Button>
               </Link>
               <Link to="/admin/organizations">
                 <Button variant="outline" className="w-full justify-start">
                   <Building2 className="w-4 h-4 mr-2" />
                   Manage Organizations
                 </Button>
               </Link>
               <Link to="/admin/placements">
                 <Button variant="outline" className="w-full justify-start">
                   <ClipboardList className="w-4 h-4 mr-2" />
                   Manage Placements
                 </Button>
               </Link>
             </CardContent>
           </Card>
 
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <TrendingUp className="w-5 h-5" />
                 System Health
               </CardTitle>
               <CardDescription>Platform status and metrics</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Database</span>
                   <span className="text-sm font-medium text-success">Operational</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Authentication</span>
                   <span className="text-sm font-medium text-success">Operational</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-sm text-muted-foreground">Storage</span>
                   <span className="text-sm font-medium text-success">Operational</span>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
       </div>
     </DashboardLayout>
   );
 };
 
 export default AdminDashboard;