import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ProfileAvatar from "@/components/ProfileAvatar";
import { BarChart3, Users, FileText, CheckCircle2, Building2, Download, Search, Loader2 } from "lucide-react";
import { generateLogPdf } from "@/lib/generate-log-pdf";
import { useToast } from "@/hooks/use-toast";

interface StudentReport {
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
  status: string;
}

const AdminReports = () => {
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [exportingId, setExportingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data: attachments } = await supabase
        .from("attachments")
        .select("id, student_id, company_id, supervisor_name, lecturer_name, start_date, end_date, status")
        .order("created_at", { ascending: false });

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

        setReports(attachments.map((a) => {
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
            status: a.status,
          };
        }));
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleExport = async (report: StudentReport) => {
    setExportingId(report.attachment_id);
    try {
      const { data: logData } = await supabase
        .from("logs")
        .select("id, week_number, content, submitted_at, supervisor_approved")
        .eq("attachment_id", report.attachment_id)
        .not("submitted_at", "is", null)
        .order("week_number", { ascending: true });

      if (!logData || logData.length === 0) { toast({ title: "No submitted logs", variant: "destructive" }); return; }

      const logIds = logData.map((l) => l.id);
      const { data: entriesData } = await supabase.from("log_entries").select("*").in("log_id", logIds).order("entry_date", { ascending: true });

      const entriesByLog: Record<string, any[]> = {};
      (entriesData || []).forEach((e) => { if (!entriesByLog[e.log_id]) entriesByLog[e.log_id] = []; entriesByLog[e.log_id].push(e); });

      generateLogPdf({
        student_name: report.student_name,
        reg_number: report.reg_number,
        attachment: { company_name: report.company_name, department_name: null, start_date: report.start_date, end_date: report.end_date, supervisor_name: report.supervisor_name, lecturer_name: report.lecturer_name },
        logs: logData.map((l) => ({ ...l, entries: entriesByLog[l.id] || [] })),
        feedback: {},
      });
      toast({ title: "PDF exported" });
    } catch { toast({ title: "Export failed", variant: "destructive" }); }
    finally { setExportingId(null); }
  };

  const filtered = reports.filter((r) =>
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.company_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.reg_number && r.reg_number.toLowerCase().includes(search.toLowerCase()))
  );

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
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">System-wide student progress and PDF export</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="w-6 h-6 text-primary" /></div><div><p className="text-2xl font-bold">{reports.length}</p><p className="text-sm text-muted-foreground">Total Placements</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center"><FileText className="w-6 h-6 text-success" /></div><div><p className="text-2xl font-bold">{reports.reduce((s, r) => s + r.total_logs, 0)}</p><p className="text-sm text-muted-foreground">Total Logs</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-info" /></div><div><p className="text-2xl font-bold">{reports.reduce((s, r) => s + r.approved_logs, 0)}</p><p className="text-sm text-muted-foreground">Approved Logs</p></div></div></CardContent></Card>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search by student, company, or reg number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map((r) => (
              <Card key={r.attachment_id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <ProfileAvatar name={r.student_name} size="md" />
                      <div>
                        <h3 className="font-semibold">{r.student_name}</h3>
                        {r.reg_number && <p className="text-xs text-muted-foreground font-mono">{r.reg_number}</p>}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Building2 className="w-3 h-3" />{r.company_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm text-muted-foreground">
                        {r.approved_logs}/{r.total_logs} approved
                      </div>
                      {getStatusBadge(r.status)}
                      <Button variant="outline" size="sm" onClick={() => handleExport(r)} disabled={exportingId === r.attachment_id}>
                        {exportingId === r.attachment_id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-16 text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports</h3>
            <p className="text-muted-foreground">{search ? "No matches found" : "Reports appear once students are attached"}</p>
          </CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
