 import { useEffect, useState } from "react";
 import { Link } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import DashboardLayout from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { 
   Plus, 
   FileText,
   Clock,
   CheckCircle2,
   MessageSquare,
   ChevronRight
 } from "lucide-react";
 import { format } from "date-fns";
 
 interface Log {
   id: string;
   attachment_id: string;
   week_number: number;
   content: string;
   submitted_at: string | null;
   created_at: string;
   updated_at: string;
 }
 
 interface Feedback {
   id: string;
   log_id: string;
   comment: string;
   created_at: string;
 }
 
 const StudentLogs = () => {
   const [logs, setLogs] = useState<Log[]>([]);
   const [feedback, setFeedback] = useState<Record<string, Feedback[]>>({});
   const [isLoading, setIsLoading] = useState(true);
 
   useEffect(() => {
     const fetchData = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
 
       // Get all attachments for the student
       const { data: attachments } = await supabase
         .from("attachments")
         .select("id")
         .eq("student_id", user.id);
 
       if (attachments && attachments.length > 0) {
         const attachmentIds = attachments.map((a) => a.id);
 
         // Fetch all logs
         const { data: logData } = await supabase
           .from("logs")
           .select("*")
           .in("attachment_id", attachmentIds)
           .order("week_number", { ascending: false });
 
         if (logData) {
           setLogs(logData);
 
           // Fetch feedback for logs
           const logIds = logData.map((l) => l.id);
           if (logIds.length > 0) {
             const { data: feedbackData } = await supabase
               .from("feedback")
               .select("*")
               .in("log_id", logIds);
 
             if (feedbackData) {
               const feedbackByLog: Record<string, Feedback[]> = {};
               feedbackData.forEach((f) => {
                 if (!feedbackByLog[f.log_id]) {
                   feedbackByLog[f.log_id] = [];
                 }
                 feedbackByLog[f.log_id].push(f);
               });
               setFeedback(feedbackByLog);
             }
           }
         }
       }
       setIsLoading(false);
     };
 
     fetchData();
   }, []);
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl lg:text-3xl font-display font-bold">Weekly Logs</h1>
             <p className="text-muted-foreground mt-1">
               Document your weekly activities and learnings
             </p>
           </div>
           <Link to="/student/logs/new">
             <Button className="bg-gradient-primary hover:opacity-90">
               <Plus className="w-4 h-4 mr-2" />
               New Log Entry
             </Button>
           </Link>
         </div>
 
         {isLoading ? (
           <div className="grid grid-cols-1 gap-4">
             {[1, 2, 3].map((i) => (
               <Card key={i} className="animate-pulse">
                 <CardContent className="h-24" />
               </Card>
             ))}
           </div>
         ) : logs.length > 0 ? (
           <div className="grid grid-cols-1 gap-4">
             {logs.map((log) => (
               <Card key={log.id} className="hover:shadow-md transition-shadow">
                 <CardContent className="p-6">
                   <div className="flex items-start justify-between gap-4">
                     <div className="flex items-start gap-4 flex-1">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                         log.submitted_at ? "bg-success/10" : "bg-warning/10"
                       }`}>
                         {log.submitted_at ? (
                           <CheckCircle2 className="w-5 h-5 text-success" />
                         ) : (
                           <Clock className="w-5 h-5 text-warning" />
                         )}
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 flex-wrap">
                           <h3 className="font-semibold">Week {log.week_number}</h3>
                           <Badge variant={log.submitted_at ? "default" : "secondary"}>
                             {log.submitted_at ? "Submitted" : "Draft"}
                           </Badge>
                           {feedback[log.id] && feedback[log.id].length > 0 && (
                             <Badge variant="outline" className="text-primary border-primary">
                               <MessageSquare className="w-3 h-3 mr-1" />
                               {feedback[log.id].length} feedback
                             </Badge>
                           )}
                         </div>
                         <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                           {log.content}
                         </p>
                         <p className="text-xs text-muted-foreground mt-2">
                           {log.submitted_at
                             ? `Submitted ${format(new Date(log.submitted_at), "MMM d, yyyy 'at' h:mm a")}`
                             : `Last updated ${format(new Date(log.updated_at), "MMM d, yyyy")}`}
                         </p>
                       </div>
                     </div>
                     <Link to={`/student/logs/${log.id}`}>
                       <Button variant="ghost" size="icon">
                         <ChevronRight className="w-5 h-5" />
                       </Button>
                     </Link>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         ) : (
           <Card>
             <CardContent className="py-16 text-center">
               <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
               <h3 className="text-lg font-semibold mb-2">No logs yet</h3>
               <p className="text-muted-foreground mb-6">
                 Start documenting your weekly activities and learnings
               </p>
               <Link to="/student/logs/new">
                 <Button className="bg-gradient-primary hover:opacity-90">
                   <Plus className="w-4 h-4 mr-2" />
                   Create Your First Log
                 </Button>
               </Link>
             </CardContent>
           </Card>
         )}
       </div>
     </DashboardLayout>
   );
 };
 
 export default StudentLogs;