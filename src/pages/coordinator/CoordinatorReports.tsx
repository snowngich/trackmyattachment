import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, FileText, CheckCircle2, Download, Loader2 } from "lucide-react";
import { generateLogPdf } from "@/lib/generate-log-pdf";
import { useToast } from "@/hooks/use-toast";

interface StudentSummary {
  student_id: string;
  student_name: string;
  reg_number: string | null;
  company_name: string;
  attachment_id: string;
  total_logs: number;
  approved_logs: number;
  start_date: string;
  end_date: string;
  supervisor_name: string | null;
  lecturer_name: string | null;
}

const CoordinatorReports = () => {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: attachments } = await supabase
        .from("attachments")
        .select("id, student_id, company_id, department_id, supervisor_name, lecturer_name, start_date, end_date")
        .eq("coordinator_id", user.id);

      if (attachments && attachments.length > 0) {
        const studentIds = [...new Set(attachments.map((a) => a.student_id))];
        const companyIds = [...new Set(attachments.map((a) => a.company_id))];
        const attachmentIds = attachments.map((a) => a.id);

        const [profilesRes, companiesRes, logsRes] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name, student_reg_number").in("user_id", studentIds),
          supabase.from("organizations").select("id, name").in("id", companyIds),
          supabase.from("logs").select("id, attachment_id, supervisor_approved").in("attachment_id", attachmentIds).not("submitted_at", "is", null),
        ]);

        const profileMap = new Map(profilesRes.data?.map((p) => [p.user_id, p]) || []);
        const companyMap = new Map(companiesRes.data?.map((c) => [c.id, c.name]) || []);

        setStudents(attachments.map((a) => {
          const profile = profileMap.get(a.student_id);
          const aLogs = logsRes.data?.filter((l) => l.attachment_id === a.id) || [];
          return {
            student_id: a.student_id,
            student_name: profile?.full_name || "Unknown",
            reg_number: profile?.student_reg_number || null,
            company_name: companyMap.get(a.company_id) || "Unknown",
            attachment_id: a.id,
            total_logs: aLogs.length,
            approved_logs: aLogs.filter((l) => l.supervisor_approved).length,
            start_date: a.start_date,
            end_date: a.end_date,
            supervisor_name: a.supervisor_name,
            lecturer_name: a.lecturer_name,
          };
        }));
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleExport = async (student: StudentSummary) => {
    setExportingId(student.attachment_id);
    try {
      const { data: deptData } = await supabase
        .from("attachments")
        .select("department_id")
        .eq("id", student.attachment_id)
        .single();

      let deptName: string | null = null;
      if (deptData?.department_id) {
        const { data } = await supabase.from("departments").select("name").eq("id", deptData.department_id).single();
        deptName = data?.name || null;
      }

      const { data: logData } = await supabase
        .from("logs")
        .select("id, week_number, content, submitted_at, supervisor_approved")
        .eq("attachment_id", student.attachment_id)
        .not("submitted_at", "is", null)
        .order("week_number", { ascending: true });

      if (!logData || logData.length === 0) {
        toast({ title: "No submitted logs to export", variant: "destructive" });
        return;
      }

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
        student_name: student.student_name,
        reg_number: student.reg_number,
        attachment: {
          company_name: student.company_name,
          department_name: deptName,
          start_date: student.start_date,
          end_date: student.end_date,
          supervisor_name: student.supervisor_name,
          lecturer_name: student.lecturer_name,
        },
        logs: logData.map((l) => ({ ...l, entries: entriesByLog[l.id] || [] })),
        feedback: {},
      });

      toast({ title: "PDF exported", description: `Logbook for ${student.student_name} downloaded.` });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setExportingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Student progress overview and PDF report generation</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.reduce((sum, s) => sum + s.total_logs, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Logs Submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{students.reduce((sum, s) => sum + s.approved_logs, 0)}</p>
                  <p className="text-sm text-muted-foreground">Approved Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Report Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : students.length > 0 ? (
          <div className="grid gap-4">
            {students.map((student) => (
              <Card key={student.attachment_id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-lg">{student.student_name}</h3>
                      {student.reg_number && <p className="text-xs text-muted-foreground font-mono">{student.reg_number}</p>}
                      <p className="text-sm text-muted-foreground mt-1">{student.company_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p>{student.approved_logs}/{student.total_logs} approved</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExport(student)}
                        disabled={exportingId === student.attachment_id}
                      >
                        {exportingId === student.attachment_id ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No data yet</h3>
              <p className="text-muted-foreground">Reports will appear once students submit logs</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoordinatorReports;
