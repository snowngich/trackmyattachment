import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/error-utils";
import {
  Users,
  Building2,
  ClipboardList,
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
} from "lucide-react";

interface PendingAttachment {
  id: string;
  status: string;
  student_name: string;
  company_name: string;
  start_date: string;
  end_date: string;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalUsers: 0, totalOrganizations: 0, totalAttachments: 0, totalLogs: 0 });
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchData = async () => {
    const [users, orgs, attachments, logs] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("organizations").select("id", { count: "exact", head: true }),
      supabase.from("attachments").select("id", { count: "exact", head: true }),
      supabase.from("logs").select("id", { count: "exact", head: true }),
    ]);

    setStats({
      totalUsers: users.count || 0,
      totalOrganizations: orgs.count || 0,
      totalAttachments: attachments.count || 0,
      totalLogs: logs.count || 0,
    });

    // Fetch pending attachments
    const { data: pendingData } = await supabase
      .from("attachments")
      .select("id, status, student_id, company_id, start_date, end_date")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (pendingData && pendingData.length > 0) {
      const studentIds = pendingData.map((a) => a.student_id);
      const companyIds = pendingData.map((a) => a.company_id);

      const [profilesRes, companiesRes] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", studentIds),
        supabase.from("organizations").select("id, name").in("id", companyIds),
      ]);

      const profileMap = new Map(profilesRes.data?.map((p) => [p.user_id, p.full_name]) || []);
      const companyMap = new Map(companiesRes.data?.map((c) => [c.id, c.name]) || []);

      setPendingAttachments(
        pendingData.map((a) => ({
          id: a.id,
          status: a.status,
          student_name: profileMap.get(a.student_id) || "Unknown",
          company_name: companyMap.get(a.company_id) || "Unknown",
          start_date: a.start_date,
          end_date: a.end_date,
        }))
      );
    }

    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (attachmentId: string, newStatus: "active" | "rejected") => {
    setUpdatingId(attachmentId);
    try {
      const { error } = await supabase
        .from("attachments")
        .update({ status: newStatus })
        .eq("id", attachmentId);
      if (error) throw error;
      toast({ title: `Attachment ${newStatus}!`, description: `The attachment has been ${newStatus}.` });
      await fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: getUserFriendlyError(error), variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: <Users className="w-6 h-6" />, color: "bg-primary/10 text-primary", href: "/admin/users" },
    { title: "Organizations", value: stats.totalOrganizations, icon: <Building2 className="w-6 h-6" />, color: "bg-info/10 text-info", href: "/admin/organizations" },
    { title: "Placements", value: stats.totalAttachments, icon: <ClipboardList className="w-6 h-6" />, color: "bg-success/10 text-success", href: "/admin/placements" },
    { title: "Total Logs", value: stats.totalLogs, icon: <FileText className="w-6 h-6" />, color: "bg-accent/10 text-accent", href: "/admin/reports" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">System overview and management — approve everything from here</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Pending Approvals
              </CardTitle>
              <CardDescription>Attachments waiting for your approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingAttachments.length > 0 ? (
                <div className="space-y-3">
                  {pendingAttachments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{a.student_name}</p>
                        <p className="text-xs text-muted-foreground">{a.company_name}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-success hover:bg-success/90 text-success-foreground"
                          onClick={() => handleUpdateStatus(a.id, "active")}
                          disabled={updatingId === a.id}
                        >
                          {updatingId === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(a.id, "rejected")}
                          disabled={updatingId === a.id}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success opacity-50" />
                  <p>No pending approvals</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users & Roles
                </Button>
              </Link>
              <Link to="/admin/organizations">
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Manage Organizations
                </Button>
              </Link>
              <Link to="/admin/placements">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Manage Placements
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
