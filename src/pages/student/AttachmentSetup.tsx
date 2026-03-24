import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/error-utils";
import { Loader2, Building2, GraduationCap, Save } from "lucide-react";

const AttachmentSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile fields
  const [studentRegNumber, setStudentRegNumber] = useState("");
  const [phone, setPhone] = useState("");

  // Attachment fields - all plain text now
  const [companyName, setCompanyName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [supervisorName, setSupervisorName] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone || "");
      setStudentRegNumber((profile as any).student_reg_number || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!companyName.trim() || !startDate || !endDate) {
      toast({ title: "Missing fields", description: "Please fill in company name, start date and end date.", variant: "destructive" });
      return;
    }

    setIsSaving(true);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          student_reg_number: studentRegNumber.trim() || null,
          phone: phone.trim() || null,
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // Find or create company organization
      let companyId: string;
      const { data: existingCompany } = await supabase
        .from("organizations")
        .select("id")
        .eq("name", companyName.trim())
        .eq("type", "company")
        .maybeSingle();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        const { data: newCompany, error: companyError } = await supabase
          .from("organizations")
          .insert({ name: companyName.trim(), type: "company" })
          .select("id")
          .single();
        if (companyError) throw companyError;
        companyId = newCompany.id;
      }

      // Create attachment - status is 'active' immediately so student can create logs right away
      const { error: attachmentError } = await supabase.from("attachments").insert({
        student_id: user.id,
        company_id: companyId,
        supervisor_name: supervisorName.trim() || null,
        lecturer_name: lecturerName.trim() || null,
        start_date: startDate,
        end_date: endDate,
        status: "active",
      });

      if (attachmentError) throw attachmentError;

      await refreshProfile();

      toast({
        title: "Attachment saved!",
        description: "Your attachment is active. You can now start creating daily logs.",
      });

      navigate("/student/logs/new");
    } catch (error: any) {
      toast({ title: "Error", description: getUserFriendlyError(error), variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Set Up Your Attachment</h1>
          <p className="text-muted-foreground mt-2">Fill in the details of your industrial attachment placement</p>
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
                  <Input id="regNumber" value={studentRegNumber} onChange={(e) => setStudentRegNumber(e.target.value)} placeholder="e.g. BCS/2023/001" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +254..." />
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
                <Label htmlFor="companyName">Company / Organization *</Label>
                <Input id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Type company name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentName">Department</Label>
                <Input id="departmentName" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="Type department name (optional)" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisorName">Supervisor Name</Label>
                  <Input id="supervisorName" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder="Type supervisor's full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturerName">Assessing Lecturer</Label>
                  <Input id="lecturerName" value={lecturerName} onChange={(e) => setLecturerName(e.target.value)} placeholder="Type lecturer's full name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 h-11 font-semibold" disabled={isSaving}>
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save & Start Logging</>
            )}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AttachmentSetup;
