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
   FileText, 
   MessageSquare, 
   Clock,
   ChevronRight,
   CheckCircle2
 } from "lucide-react";
 import { format } from "date-fns";
 
 interface AssignedStudent {
   id: string;
   student_id: string;
   status: string;
   start_date: string;
   end_date: string;
   profile: { full_name: string };
   pending_logs: number;
 }
 
 interface PendingLog {
   id: string;
   week_number: number;
   submitted_at: string;
   student_name: string;
   attachment_id: string;
 }
 
 const SupervisorDashboard = () => {
   const { profile } = useAuth();
   const [students, setStudents] = useState<AssignedStudent[]>([]);
   const [pendingLogs, setPendingLogs] = useState<PendingLog[]>([]);
   const [stats, setStats] = useState({
     totalStudents: 0,
     pendingReviews: 0,
     completedReviews: 0,
   });
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchData = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
 
       // Fetch assigned attachments with student profiles
       const { data: attachments } = await supabase
         .from("attachments")
         .select(`
           id,
           student_id,
           status,
           start_date,
           end_date
         `)
         .eq("supervisor_id", user.id);
 
       if (attachments && attachments.length > 0) {
         // Fetch profiles for students
         const studentIds = attachments.map((a) => a.student_id);
         const { data: profiles } = await supabase
           .from("profiles")
           .select("user_id, full_name")
           .in("user_id", studentIds);
 
         const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
 
         // Fetch logs for review
         const attachmentIds = attachments.map((a) => a.id);
         const { data: logs } = await supabase
           .from("logs")
           .select("id, week_number, submitted_at, attachment_id")
           .in("attachment_id", attachmentIds)
           .not("submitted_at", "is", null)
           .order("submitted_at", { ascending: false });
 
         // Get feedback to know which logs are reviewed
         const { data: feedback } = await supabase
           .from("feedback")
           .select("log_id")
           .eq("author_id", user.id);
 
         const reviewedLogIds = new Set(feedback?.map((f) => f.log_id) || []);
 
         // Build student data with pending log count
         const studentData = attachments.map((a) => ({
           ...a,
           profile: profileMap.get(a.student_id) || { full_name: "Unknown" },
           pending_logs: logs?.filter(
             (l) => l.attachment_id === a.id && !reviewedLogIds.has(l.id)
           ).length || 0,
         }));
 
         setStudents(studentData);
 
         // Build pending logs list
         const pending = logs
           ?.filter((l) => !reviewedLogIds.has(l.id))
           .slice(0, 5)
           .map((l) => {
             const attachment = attachments.find((a) => a.id === l.attachment_id);
             const studentProfile = attachment
               ? profileMap.get(attachment.student_id)
               : null;
             return {
               ...l,
               student_name: studentProfile?.full_name || "Unknown",
             };
           }) || [];
 
         setPendingLogs(pending);
 
         setStats({
           totalStudents: attachments.length,
           pendingReviews: logs?.filter((l) => !reviewedLogIds.has(l.id)).length || 0,
           completedReviews: reviewedLogIds.size,
         });
       }
 
       setIsLoading(false);
     };
 
     fetchData();
   }, []);
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <div>
           <h1 className="text-2xl lg:text-3xl font-display font-bold">
             Welcome, {profile?.full_name?.split(" ")[0]}!
           </h1>
           <p className="text-muted-foreground mt-1">
             Review and provide feedback on student logs
           </p>
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
                   <p className="text-sm text-muted-foreground">Assigned Students</p>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                   <Clock className="w-6 h-6 text-warning" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{stats.pendingReviews}</p>
                   <p className="text-sm text-muted-foreground">Pending Reviews</p>
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
                   <p className="text-2xl font-bold">{stats.completedReviews}</p>
                   <p className="text-sm text-muted-foreground">Completed Reviews</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Pending Logs */}
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="flex items-center gap-2">
                   <FileText className="w-5 h-5" />
                   Pending Reviews
                 </CardTitle>
                 <CardDescription>Logs awaiting your feedback</CardDescription>
               </div>
               <Link to="/supervisor/logs">
                 <Button variant="ghost" size="sm">View All</Button>
               </Link>
             </CardHeader>
             <CardContent>
               {pendingLogs.length > 0 ? (
                 <div className="space-y-3">
                   {pendingLogs.map((log) => (
                     <Link
                       key={log.id}
                       to={`/supervisor/logs/${log.id}`}
                       className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                     >
                       <div>
                         <p className="font-medium">{log.student_name}</p>
                         <p className="text-sm text-muted-foreground">
                           Week {log.week_number} • {format(new Date(log.submitted_at), "MMM d")}
                         </p>
                       </div>
                       <ChevronRight className="w-5 h-5 text-muted-foreground" />
                     </Link>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-muted-foreground">
                   <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success opacity-50" />
                   <p>All caught up!</p>
                   <p className="text-sm">No pending reviews</p>
                 </div>
               )}
             </CardContent>
           </Card>
 
           {/* Assigned Students */}
           <Card>
             <CardHeader className="flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="flex items-center gap-2">
                   <Users className="w-5 h-5" />
                   Your Students
                 </CardTitle>
                 <CardDescription>Students under your supervision</CardDescription>
               </div>
               <Link to="/supervisor/students">
                 <Button variant="ghost" size="sm">View All</Button>
               </Link>
             </CardHeader>
             <CardContent>
               {students.length > 0 ? (
                 <div className="space-y-3">
                   {students.slice(0, 5).map((student) => (
                     <div
                       key={student.id}
                       className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                     >
                       <div className="flex items-center gap-3">
                         <Avatar className="h-9 w-9">
                           <AvatarFallback className="bg-primary/10 text-primary text-sm">
                             {student.profile.full_name
                               .split(" ")
                               .map((n) => n[0])
                               .join("")}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="font-medium">{student.profile.full_name}</p>
                           <p className="text-xs text-muted-foreground">
                             {format(new Date(student.start_date), "MMM d")} -{" "}
                             {format(new Date(student.end_date), "MMM d, yyyy")}
                           </p>
                         </div>
                       </div>
                       {student.pending_logs > 0 && (
                         <Badge className="bg-warning/10 text-warning border-0">
                           {student.pending_logs} pending
                         </Badge>
                       )}
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-8 text-muted-foreground">
                   <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                   <p>No students assigned</p>
                 </div>
               )}
             </CardContent>
           </Card>
         </div>
       </div>
     </DashboardLayout>
   );
 };
 
 export default SupervisorDashboard;