import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  Building2, 
  MessageSquare, 
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
 
 interface Attachment {
   id: string;
   start_date: string;
   end_date: string;
   status: string;
   company: { name: string };
   department: { name: string } | null;
 }
 
 interface Log {
   id: string;
   week_number: number;
   content: string;
   submitted_at: string | null;
   created_at: string;
 }
 
 const StudentDashboard = () => {
   const { profile } = useAuth();
   const [attachments, setAttachments] = useState<Attachment[]>([]);
   const [recentLogs, setRecentLogs] = useState<Log[]>([]);
   const [stats, setStats] = useState({
     totalLogs: 0,
     submittedLogs: 0,
     pendingFeedback: 0,
   });
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchData = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
 
       // Fetch attachments
       const { data: attachmentData } = await supabase
         .from("attachments")
         .select(`
           id,
           start_date,
           end_date,
           status,
           company:company_id(name),
           department:department_id(name)
         `)
         .eq("student_id", user.id)
         .order("created_at", { ascending: false });
 
       if (attachmentData) {
         setAttachments(attachmentData as unknown as Attachment[]);
 
         // Fetch logs for these attachments
         const attachmentIds = attachmentData.map((a) => a.id);
         if (attachmentIds.length > 0) {
           const { data: logData } = await supabase
             .from("logs")
             .select("*")
             .in("attachment_id", attachmentIds)
             .order("created_at", { ascending: false })
             .limit(5);
 
           if (logData) {
             setRecentLogs(logData);
             setStats({
               totalLogs: logData.length,
               submittedLogs: logData.filter((l) => l.submitted_at).length,
               pendingFeedback: 0,
             });
           }
         }
       }
       setIsLoading(false);
     };
 
     fetchData();
   }, []);
 
   const activeAttachment = attachments.find((a) => a.status === "active");
 
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
         {/* Welcome Section */}
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl lg:text-3xl font-display font-bold">
               Welcome back, {profile?.full_name?.split(" ")[0]}!
             </h1>
             <p className="text-muted-foreground mt-1">
               Track your industrial attachment progress
             </p>
           </div>
           <Link to="/student/logs/new">
             <Button className="bg-gradient-primary hover:opacity-90">
               <Plus className="w-4 h-4 mr-2" />
               New Log Entry
             </Button>
           </Link>
         </div>
 
         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                   <FileText className="w-6 h-6 text-primary" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.totalLogs}</p>
                   <p className="text-sm text-muted-foreground">Total Logs</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                   <CheckCircle2 className="w-6 h-6 text-success" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.submittedLogs}</p>
                   <p className="text-sm text-muted-foreground">Submitted</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                   <MessageSquare className="w-6 h-6 text-accent" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.pendingFeedback}</p>
                   <p className="text-sm text-muted-foreground">Pending Feedback</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Active Attachment */}
           <Card>
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Building2 className="w-5 h-5" />
                 Current Attachment
               </CardTitle>
               <CardDescription>Your active industrial placement</CardDescription>
             </CardHeader>
             <CardContent>
               {activeAttachment ? (
                 <div className="space-y-4">
                   <div className="flex items-start justify-between">
                     <div>
                       <h3 className="font-semibold text-lg">{activeAttachment.company.name}</h3>
                       <p className="text-sm text-muted-foreground">
                         {activeAttachment.department?.name || "General"}
                       </p>
                     </div>
                     {getStatusBadge(activeAttachment.status)}
                   </div>
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <Calendar className="w-4 h-4" />
                     <span>
                       {format(new Date(activeAttachment.start_date), "MMM d, yyyy")} -{" "}
                       {format(new Date(activeAttachment.end_date), "MMM d, yyyy")}
                     </span>
                   </div>
                 </div>
               ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No active attachment</p>
                    <p className="text-sm mb-4">Set up your attachment details to get started</p>
                    <Link to="/student/attachment-setup">
                      <Button className="bg-gradient-primary hover:opacity-90">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Set Up Attachment
                      </Button>
                    </Link>
                  </div>
               )}
             </CardContent>
           </Card>
 
           {/* Recent Logs */}
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="flex items-center gap-2">
                   <FileText className="w-5 h-5" />
                   Recent Logs
                 </CardTitle>
                 <CardDescription>Your latest weekly submissions</CardDescription>
               </div>
               <Link to="/student/logs">
                 <Button variant="ghost" size="sm">View All</Button>
               </Link>
             </CardHeader>
             <CardContent>
               {recentLogs.length > 0 ? (
                 <div className="space-y-3">
                   {recentLogs.slice(0, 3).map((log) => (
                     <div
                       key={log.id}
                       className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                     >
                       <div className="flex items-center gap-3">
                         {log.submitted_at ? (
                           <CheckCircle2 className="w-5 h-5 text-success" />
                         ) : (
                           <Clock className="w-5 h-5 text-warning" />
                         )}
                         <div>
                           <p className="font-medium">Week {log.week_number}</p>
                           <p className="text-xs text-muted-foreground">
                             {format(new Date(log.created_at), "MMM d, yyyy")}
                           </p>
                         </div>
                       </div>
                       <Badge variant={log.submitted_at ? "default" : "secondary"}>
                         {log.submitted_at ? "Submitted" : "Draft"}
                       </Badge>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-muted-foreground">
                   <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                   <p>No logs yet</p>
                   <p className="text-sm">Start documenting your experience</p>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
       </div>
     </DashboardLayout>
   );
 };
 
 export default StudentDashboard;