import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/error-utils";
import { Loader2, Building2, GraduationCap, Save } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  address: string | null;
  type: string;
}

const AttachmentSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<Organization[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile fields
  const [studentRegNumber, setStudentRegNumber] = useState("");
  const [phone, setPhone] = useState("");

  // Attachment fields
  const [companyId, setCompanyId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [companiesRes, deptsRes] = await Promise.all([
        supabase.from("organizations").select("*").eq("type", "company").order("name"),
        supabase.from("departments").select("id, name").order("name"),
      ]);

      if (companiesRes.data) setCompanies(companiesRes.data);
      if (deptsRes.data) setDepartments(deptsRes.data);

      // Pre-fill from profile
      if (profile) {
        setPhone(profile.phone || "");
        setStudentRegNumber((profile as any).student_reg_number || "");
      }

      setIsLoading(false);
    };

    fetchData();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!companyId || !startDate || !endDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update profile with reg number and phone
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          student_reg_number: studentRegNumber.trim() || null,
          phone: phone.trim() || null,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Create attachment
      const { error: attachmentError } = await supabase.from("attachments").insert({
        student_id: user.id,
        company_id: companyId,
        department_id: departmentId || null,
        supervisor_name: supervisorName.trim() || null,
        lecturer_name: lecturerName.trim() || null,
        start_date: startDate,
        end_date: endDate,
        status: "pending",
      });

      if (attachmentError) throw attachmentError;

      await refreshProfile();

      toast({
        title: "Attachment details saved!",
        description: "Your attachment has been registered. It will be reviewed shortly.",
      });

      navigate("/student");
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl lg:text-3xl font-display font-bold">
            Set Up Your Attachment
          </h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details of your industrial attachment placement
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Student Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5" />
                Your Details
              </CardTitle>
              <CardDescription>Your personal and academic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={profile?.full_name || ""} disabled className="bg-muted" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regNumber">Registration Number *</Label>
                  <Input
                    id="regNumber"
                    value={studentRegNumber}
                    onChange={(e) => setStudentRegNumber(e.target.value)}
                    placeholder="e.g. BCS/2023/001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +254..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachment Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5" />
                Attachment Details
              </CardTitle>
              <CardDescription>Where you'll be doing your attachment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Company / Organization *</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.address ? `- ${c.address}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {departments.length > 0 && (
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisorName">Supervisor Name</Label>
                  <Input
                    id="supervisorName"
                    value={supervisorName}
                    onChange={(e) => setSupervisorName(e.target.value)}
                    placeholder="Name of your company supervisor"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturerName">Assessing Lecturer</Label>
                  <Input
                    id="lecturerName"
                    value={lecturerName}
                    onChange={(e) => setLecturerName(e.target.value)}
                    placeholder="Lecturer assigned to assess you"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-gradient-primary hover:opacity-90 h-11 font-semibold"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Attachment Details
              </>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AttachmentSetup;
