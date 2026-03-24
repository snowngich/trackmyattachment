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
  ChevronRight,
  Download,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { generateLogPdf } from "@/lib/generate-log-pdf";
import { toast } from "@/hooks/use-toast";
 
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
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, student_reg_number")
        .eq("user_id", user.id)
        .single();

      // Fetch attachment with company/department info
      const { data: attachmentData } = await supabase
        .from("attachments")
        .select("id, start_date, end_date, supervisor_name, lecturer_name, company_id, department_id")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!attachmentData) {
        toast({ title: "No attachment found", description: "Set up an attachment first.", variant: "destructive" });
        return;
      }

      // Fetch company & department names
      const [companyRes, deptRes] = await Promise.all([
        supabase.from("organizations").select("name").eq("id", attachmentData.company_id).single(),
        attachmentData.department_id
          ? supabase.from("departments").select("name").eq("id", attachmentData.department_id).single()
          : Promise.resolve({ data: null }),
      ]);

      // Fetch all logs with entries
      const { data: logData } = await supabase
        .from("logs")
        .select("id, week_number, content, submitted_at, supervisor_approved")
        .eq("attachment_id", attachmentData.id)
        .order("week_number", { ascending: true });

      if (!logData || logData.length === 0) {
        toast({ title: "No logs to export", description: "Create some log entries first.", variant: "destructive" });
        return;
      }

      // Fetch all log entries
      const logIds = logData.map((l) => l.id);
      const { data: entriesData } = await supabase
        .from("log_entries")
        .select("*")
        .in("log_id", logIds)
        .order("entry_date", { ascending: true });

      const entriesByLog: Record<string, any[]> = {};
      (entriesData || []).forEach((e) => {
        if (!entriesByLog[e.log_id]) entriesByLog[e.log_id] = [];
        entriesByLog[e.log_id].push(e);
      });

      generateLogPdf({
        student_name: profileData?.full_name || "Unknown",
        reg_number: profileData?.student_reg_number || null,
        attachment: {
          company_name: companyRes.data?.name || "Unknown",
          department_name: deptRes.data?.name || null,
          start_date: attachmentData.start_date,
          end_date: attachmentData.end_date,
          supervisor_name: attachmentData.supervisor_name,
          lecturer_name: attachmentData.lecturer_name,
        },
        logs: logData.map((l) => ({
          ...l,
          entries: entriesByLog[l.id] || [],
        })),
        feedback: {},
      });

      toast({ title: "PDF exported", description: "Your logbook has been downloaded." });
    } catch (err) {
      console.error(err);
      toast({ title: "Export failed", description: "Could not generate PDF.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };
 
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
              <h1 className="text-2xl lg:text-3xl font-display font-bold">Daily Logs</h1>
              <p className="text-muted-foreground mt-1">
                Document your daily activities and learnings
             </p>
           </div>
          <div className="flex gap-2">
            {logs.length > 0 && (
              <Button variant="outline" onClick={handleExportPdf} disabled={isExporting}>
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export PDF
              </Button>
            )}
            <Link to="/student/logs/new">
               <Button className="bg-gradient-primary hover:opacity-90">
                 <Plus className="w-4 h-4 mr-2" />
                 New Daily Log
               </Button>
            </Link>
          </div>
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