 import { useEffect, useState } from "react";
 import { Link } from "react-router-dom";
 import { useAuth } from "@/contexts/AuthContext";
 import { supabase } from "@/integrations/supabase/client";
 import DashboardLayout from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback } from "@/components/ui/avatar";
 import { 
   Users, 
   ClipboardList, 
   FileText,
   Building2,
   Plus,
   ChevronRight
 } from "lucide-react";
 import { format } from "date-fns";
 
 interface Placement {
   id: string;
   student: { full_name: string };
   company: { name: string };
   status: string;
   start_date: string;
   end_date: string;
 }
 
 const CoordinatorDashboard = () => {
   const { profile } = useAuth();
   const [placements, setPlacements] = useState<Placement[]>([]);
   const [stats, setStats] = useState({
     totalStudents: 0,
     activePlacements: 0,
     pendingPlacements: 0,
   });
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchData = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
 
       // Fetch placements assigned to this coordinator
       const { data: attachments } = await supabase
         .from("attachments")
         .select("id, status, start_date, end_date, student_id, company_id")
         .eq("coordinator_id", user.id)
         .order("created_at", { ascending: false });
 
       if (attachments && attachments.length > 0) {
         const studentIds = attachments.map((a) => a.student_id);
         const companyIds = attachments.map((a) => a.company_id);
 
         const [studentProfiles, companyData] = await Promise.all([
           supabase.from("profiles").select("user_id, full_name").in("user_id", studentIds),
           supabase.from("organizations").select("id, name").in("id", companyIds),
         ]);
 
         const studentMap = new Map(studentProfiles.data?.map((p) => [p.user_id, p]) || []);
         const companyMap = new Map(companyData.data?.map((c) => [c.id, c]) || []);
 
         const placementsWithDetails = attachments.map((a) => ({
           ...a,
           student: studentMap.get(a.student_id) || { full_name: "Unknown" },
           company: companyMap.get(a.company_id) || { name: "Unknown" },
         }));
 
         setPlacements(placementsWithDetails);
 
         setStats({
           totalStudents: new Set(attachments.map((a) => a.student_id)).size,
           activePlacements: attachments.filter((a) => a.status === "active").length,
           pendingPlacements: attachments.filter((a) => a.status === "pending").length,
         });
       }
 
       setIsLoading(false);
     };
 
     fetchData();
   }, []);
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case "active":
         return <Badge className="bg-success/10 text-success border-0">Active</Badge>;
       case "completed":
         return <Badge className="bg-info/10 text-info border-0">Completed</Badge>;
       case "pending":
         return <Badge className="bg-warning/10 text-warning border-0">Pending</Badge>;
       default:
         return <Badge variant="secondary">{status}</Badge>;
     }
   };
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
              <h1 className="text-2xl lg:text-3xl font-display font-bold">
                Welcome, {profile?.full_name?.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage student placements and assess progress
              </p>
           </div>
           <Link to="/coordinator/placements">
             <Button className="bg-gradient-primary hover:opacity-90">
               <Plus className="w-4 h-4 mr-2" />
               New Placement
             </Button>
           </Link>
         </div>
 
         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                   <Users className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.totalStudents}</p>
                   <p className="text-sm text-muted-foreground">Students</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                   <ClipboardList className="w-6 h-6 text-success" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.activePlacements}</p>
                   <p className="text-sm text-muted-foreground">Active Placements</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                   <ClipboardList className="w-6 h-6 text-warning" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.pendingPlacements}</p>
                   <p className="text-sm text-muted-foreground">Pending</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Recent Placements */}
         <Card>
           <CardHeader className="flex flex-row items-center justify-between">
             <div>
               <CardTitle className="flex items-center gap-2">
                 <ClipboardList className="w-5 h-5" />
                 Recent Placements
               </CardTitle>
               <CardDescription>Student attachment placements you're managing</CardDescription>
             </div>
             <Link to="/coordinator/placements">
               <Button variant="ghost" size="sm">View All</Button>
             </Link>
           </CardHeader>
           <CardContent>
             {placements.length > 0 ? (
               <div className="space-y-3">
                 {placements.slice(0, 5).map((placement) => (
                   <div
                     key={placement.id}
                     className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                   >
                     <div className="flex items-center gap-4">
                       <Avatar className="h-10 w-10">
                         <AvatarFallback className="bg-primary/10 text-primary">
                           {placement.student.full_name
                             .split(" ")
                             .map((n) => n[0])
                             .join("")}
                         </AvatarFallback>
                       </Avatar>
                       <div>
                         <p className="font-medium">{placement.student.full_name}</p>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Building2 className="w-3 h-3" />
                           {placement.company.name}
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="text-sm text-muted-foreground hidden sm:block">
                         {format(new Date(placement.start_date), "MMM d")} -{" "}
                         {format(new Date(placement.end_date), "MMM d")}
                       </span>
                       {getStatusBadge(placement.status)}
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-muted-foreground">
                 <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
                 <p>No placements yet</p>
                 <p className="text-sm">Create your first student placement</p>
               </div>
             )}
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 };
 
 export default CoordinatorDashboard;