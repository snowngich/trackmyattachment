import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface LogWithStudent {
  id: string;
  week_number: number;
  content: string;
  submitted_at: string;
  attachment_id: string;
  student_name: string;
  company_name: string;
  has_feedback: boolean;
}

const LecturerLogs = () => {
  const [logs, setLogs] = useState<LogWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch assigned attachments
      const { data: attachments } = await supabase
        .from("attachments")
        .select("id, student_id, company_id")
        .eq("coordinator_id", user.id);

      if (attachments && attachments.length > 0) {
        const attachmentIds = attachments.map((a) => a.id);
        const studentIds = [...new Set(attachments.map((a) => a.student_id))];
        const companyIds = [...new Set(attachments.map((a) => a.company_id))];

        // Fetch profiles, companies, logs, feedback in parallel
        const [profilesRes, companiesRes, logsRes, feedbackRes] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name").in("user_id", studentIds),
          supabase.from("organizations").select("id, name").in("id", companyIds),
          supabase
            .from("logs")
            .select("*")
            .in("attachment_id", attachmentIds)
            .not("submitted_at", "is", null)
            .order("submitted_at", { ascending: false }),
          supabase.from("feedback").select("log_id").eq("author_id", user.id),
        ]);

        const profileMap = new Map(profilesRes.data?.map((p) => [p.user_id, p.full_name]) || []);
        const companyMap = new Map(companiesRes.data?.map((c) => [c.id, c.name]) || []);
        const reviewedLogIds = new Set(feedbackRes.data?.map((f) => f.log_id) || []);

        if (logsRes.data) {
          const logsWithDetails = logsRes.data.map((log) => {
            const attachment = attachments.find((a) => a.id === log.attachment_id);
            return {
              ...log,
              student_name: attachment ? profileMap.get(attachment.student_id) || "Unknown" : "Unknown",
              company_name: attachment ? companyMap.get(attachment.company_id) || "Unknown" : "Unknown",
              has_feedback: reviewedLogIds.has(log.id),
            };
          });
          setLogs(logsWithDetails);
        }
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const pendingLogs = logs.filter((l) => !l.has_feedback);
  const reviewedLogs = logs.filter((l) => l.has_feedback);

  const LogCard = ({ log }: { log: LogWithStudent }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                log.has_feedback ? "bg-success/10" : "bg-warning/10"
              }`}
            >
              {log.has_feedback ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Clock className="w-5 h-5 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold">{log.student_name}</h3>
                <Badge variant="outline">Week {log.week_number}</Badge>
                {log.has_feedback && (
                  <Badge className="bg-success/10 text-success border-0">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Assessed
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{log.company_name}</p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{log.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Submitted {format(new Date(log.submitted_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <Link to={`/coordinator/logs/${log.id}`}>
            <Button variant="ghost" size="icon">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Student Logs</h1>
          <p className="text-muted-foreground mt-1">
            Review student logs and provide assessment feedback
          </p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pending ({pendingLogs.length})
            </TabsTrigger>
            <TabsTrigger value="assessed" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Assessed ({reviewedLogs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingLogs.length > 0 ? (
              pendingLogs.map((log) => <LogCard key={log.id} log={log} />)
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <CheckCircle2 className="w-16 h-16 mx-auto text-success/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No pending logs to assess</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assessed" className="space-y-4">
            {reviewedLogs.length > 0 ? (
              reviewedLogs.map((log) => <LogCard key={log.id} log={log} />)
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No assessed logs yet</h3>
                  <p className="text-muted-foreground">
                    Logs you assess will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default LecturerLogs;
