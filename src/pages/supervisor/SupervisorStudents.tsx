import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Users, Building2, Calendar, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface StudentAttachment {
  id: string;
  student_id: string;
  student_name: string;
  company_name: string;
  department_name: string | null;
  status: string;
  start_date: string;
  end_date: string;
  total_logs: number;
  pending_logs: number;
}

const SupervisorStudents = () => {
  const [students, setStudents] = useState<StudentAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: attachments } = await supabase
        .from("attachments")
        .select("id, student_id, company_id, department_id, status, start_date, end_date")
        .eq("supervisor_id", user.id);

      if (attachments && attachments.length > 0) {
        const studentIds = [...new Set(attachments.map((a) => a.student_id))];
        const companyIds = [...new Set(attachments.map((a) => a.company_id))];
        const deptIds = [...new Set(attachments.filter((a) => a.department_id).map((a) => a.department_id!))];
        const attachmentIds = attachments.map((a) => a.id);

        const [profilesRes, companiesRes, deptsRes, logsRes, feedbackRes] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name").in("user_id", studentIds),
          supabase.from("organizations").select("id, name").in("id", companyIds),
          deptIds.length > 0 ? supabase.from("departments").select("id, name").in("id", deptIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
          supabase.from("logs").select("id, attachment_id, submitted_at").in("attachment_id", attachmentIds).not("submitted_at", "is", null),
          supabase.from("feedback").select("log_id").eq("author_id", user.id),
        ]);

        const profileMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p.full_name] as const));
        const companyMap = new Map((companiesRes.data || []).map((c) => [c.id, c.name] as const));
        const deptMap = new Map((deptsRes.data || []).map((d) => [d.id, d.name] as const));
        const reviewedLogIds = new Set(feedbackRes.data?.map((f) => f.log_id) || []);

        setStudents(attachments.map((a) => {
          const aLogs = logsRes.data?.filter((l) => l.attachment_id === a.id) || [];
          return {
            id: a.id,
            student_id: a.student_id,
            student_name: profileMap.get(a.student_id) || "Unknown",
            company_name: companyMap.get(a.company_id) || "Unknown",
            department_name: a.department_id ? (deptMap.get(a.department_id) || null) : null,
            status: a.status,
            start_date: a.start_date,
            end_date: a.end_date,
            total_logs: aLogs.length,
            pending_logs: aLogs.filter((l) => !reviewedLogIds.has(l.id)).length,
          };
        }));
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-success/10 text-success border-0">Active</Badge>;
      case "completed": return <Badge className="bg-info/10 text-info border-0">Completed</Badge>;
      case "pending": return <Badge className="bg-warning/10 text-warning border-0">Pending</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">My Students</h1>
          <p className="text-muted-foreground mt-1">Students under your supervision</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : students.length > 0 ? (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <ProfileAvatar name={student.student_name} size="md" />
                      <div>
                        <h3 className="font-semibold text-lg">{student.student_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Building2 className="w-3 h-3" />
                          {student.company_name}
                          {student.department_name && ` — ${student.department_name}`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(student.start_date), "MMM d")} - {format(new Date(student.end_date), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="w-3 h-3" />
                          {student.total_logs} logs
                        </div>
                        {student.pending_logs > 0 && (
                          <Badge className="bg-warning/10 text-warning border-0 mt-1">
                            {student.pending_logs} pending
                          </Badge>
                        )}
                      </div>
                      {getStatusBadge(student.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students assigned</h3>
              <p className="text-muted-foreground">Students will appear here once assigned to you</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SupervisorStudents;
