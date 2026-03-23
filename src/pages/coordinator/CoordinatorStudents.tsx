import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ProfileAvatar from "@/components/ProfileAvatar";
import { Users, Building2, Calendar, FileText, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface StudentDetail {
  id: string;
  student_name: string;
  reg_number: string | null;
  company_name: string;
  department_name: string | null;
  supervisor_name: string | null;
  status: string;
  start_date: string;
  end_date: string;
  total_logs: number;
  approved_logs: number;
}

const CoordinatorStudents = () => {
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: attachments } = await supabase
        .from("attachments")
        .select("id, student_id, company_id, department_id, supervisor_id, supervisor_name, status, start_date, end_date")
        .eq("coordinator_id", user.id)
        .order("created_at", { ascending: false });

      if (attachments && attachments.length > 0) {
        const studentIds = [...new Set(attachments.map((a) => a.student_id))];
        const companyIds = [...new Set(attachments.map((a) => a.company_id))];
        const deptIds = [...new Set(attachments.filter((a) => a.department_id).map((a) => a.department_id!))];
        const attachmentIds = attachments.map((a) => a.id);

        const [profilesRes, companiesRes, deptsRes, logsRes] = await Promise.all([
          supabase.from("profiles").select("user_id, full_name, student_reg_number").in("user_id", studentIds),
          supabase.from("organizations").select("id, name").in("id", companyIds),
          deptIds.length > 0 ? supabase.from("departments").select("id, name").in("id", deptIds) : Promise.resolve({ data: [] as { id: string; name: string }[] }),
          supabase.from("logs").select("id, attachment_id, supervisor_approved").in("attachment_id", attachmentIds).not("submitted_at", "is", null),
        ]);

        const profileMap = new Map((profilesRes.data || []).map((p) => [p.user_id, p] as const));
        const companyMap = new Map((companiesRes.data || []).map((c) => [c.id, c.name] as const));
        const deptMap = new Map((deptsRes.data || []).map((d) => [d.id, d.name] as const));

        setStudents(attachments.map((a) => {
          const profile = profileMap.get(a.student_id);
          const aLogs = logsRes.data?.filter((l) => l.attachment_id === a.id) || [];
          return {
            id: a.id,
            student_name: profile?.full_name || "Unknown",
            reg_number: profile?.student_reg_number || null,
            company_name: companyMap.get(a.company_id) || "Unknown",
            department_name: a.department_id ? (deptMap.get(a.department_id) ?? null) : null,
            supervisor_name: a.supervisor_name || null,
            status: a.status,
            start_date: a.start_date,
            end_date: a.end_date,
            total_logs: aLogs.length,
            approved_logs: aLogs.filter((l) => l.supervisor_approved).length,
          };
        }));
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const filtered = students.filter((s) =>
    s.student_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.reg_number && s.reg_number.toLowerCase().includes(search.toLowerCase()))
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
          <h1 className="text-2xl lg:text-3xl font-display font-bold">My Students</h1>
          <p className="text-muted-foreground mt-1">Full student database for your assigned placements</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Search by name or reg number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4">
            {filtered.map((student) => (
              <Card key={student.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <ProfileAvatar name={student.student_name} size="md" />
                      <div>
                        <h3 className="font-semibold text-lg">{student.student_name}</h3>
                        {student.reg_number && (
                          <p className="text-xs text-muted-foreground font-mono">{student.reg_number}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Building2 className="w-3 h-3" />
                          {student.company_name}
                          {student.department_name && ` — ${student.department_name}`}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(student.start_date), "MMM d")} - {format(new Date(student.end_date), "MMM d, yyyy")}
                        </div>
                        {student.supervisor_name && (
                          <p className="text-xs text-muted-foreground mt-1">Supervisor: {student.supervisor_name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="w-3 h-3" />
                          {student.approved_logs}/{student.total_logs} approved
                        </div>
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
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {search ? "Try a different search term" : "Students will appear here once assigned"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoordinatorStudents;
