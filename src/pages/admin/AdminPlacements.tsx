 import { useEffect, useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import DashboardLayout from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Badge } from "@/components/ui/badge";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/error-utils";
import { placementSchema } from "@/lib/validation";
import { 
    Plus,
    Loader2,
    Calendar,
    Building2,
    User
  } from "lucide-react";
 import { format } from "date-fns";
 
 interface Placement {
   id: string;
   start_date: string;
   end_date: string;
   status: string;
   student: { full_name: string };
   company: { name: string };
   supervisor: { full_name: string } | null;
 }
 
 interface ProfileData {
   user_id: string;
   full_name: string;
 }
 
 interface OrganizationData {
   id: string;
   name: string;
 }
 
 interface Student {
   user_id: string;
   full_name: string;
 }
 
 interface Company {
   id: string;
   name: string;
 }
 
 interface Supervisor {
   user_id: string;
   full_name: string;
 }
 
 const AdminPlacements = () => {
   const [placements, setPlacements] = useState<Placement[]>([]);
   const [students, setStudents] = useState<Student[]>([]);
   const [companies, setCompanies] = useState<Company[]>([]);
   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isCreating, setIsCreating] = useState(false);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [newPlacement, setNewPlacement] = useState({
     student_id: "",
     company_id: "",
     supervisor_id: "",
     start_date: "",
     end_date: "",
   });
   const { toast } = useToast();
 
   const fetchData = async () => {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return;
 
     // Fetch placements
     const { data: attachments } = await supabase
       .from("attachments")
       .select("id, start_date, end_date, status, student_id, company_id, supervisor_id")
       .order("created_at", { ascending: false });
 
     if (attachments) {
       const studentIds = attachments.map((a) => a.student_id);
       const companyIds = attachments.map((a) => a.company_id);
       const supervisorIds = attachments.filter((a) => a.supervisor_id).map((a) => a.supervisor_id);
 
 
       // Fetch student profiles
       const { data: studentProfilesData } = await supabase
         .from("profiles")
         .select("user_id, full_name")
         .in("user_id", studentIds);
 
       // Fetch companies
       const { data: companyDataResult } = await supabase
         .from("organizations")
         .select("id, name")
         .in("id", companyIds);
 
       // Fetch supervisor profiles if any
       let supervisorProfilesData: ProfileData[] = [];
       if (supervisorIds.length > 0) {
         const { data } = await supabase
           .from("profiles")
           .select("user_id, full_name")
           .in("user_id", supervisorIds);
         supervisorProfilesData = (data as ProfileData[]) || [];
       }
 
       const studentMap = new Map<string, ProfileData>(
         (studentProfilesData as ProfileData[] || []).map((p) => [p.user_id, p])
       );
       const companyMap = new Map<string, OrganizationData>(
         (companyDataResult as OrganizationData[] || []).map((c) => [c.id, c])
       );
       const supervisorMap = new Map<string, ProfileData>(
         supervisorProfilesData.map((p) => [p.user_id, p])
       );
 
       const placementsWithDetails: Placement[] = attachments.map((a) => ({
         id: a.id,
         start_date: a.start_date,
         end_date: a.end_date,
         status: a.status,
         student: studentMap.get(a.student_id) || { full_name: "Unknown" },
         company: companyMap.get(a.company_id) || { name: "Unknown" },
         supervisor: a.supervisor_id ? supervisorMap.get(a.supervisor_id) || null : null,
       }));
 
       setPlacements(placementsWithDetails);
     }
 
     // Fetch students (users with student role)
     const { data: studentRoles } = await supabase
       .from("user_roles")
       .select("user_id")
       .eq("role", "student");
 
     if (studentRoles) {
       const { data: studentProfiles } = await supabase
         .from("profiles")
         .select("user_id, full_name")
         .in("user_id", studentRoles.map((r) => r.user_id));
 
       setStudents(studentProfiles || []);
     }
 
     // Fetch companies
     const { data: companyData } = await supabase
       .from("organizations")
       .select("id, name")
       .eq("type", "company");
 
     setCompanies(companyData || []);
 
     // Fetch supervisors (users with supervisor role)
     const { data: supervisorRoles } = await supabase
       .from("user_roles")
       .select("user_id")
       .eq("role", "supervisor");
 
     if (supervisorRoles) {
       const { data: supervisorProfiles } = await supabase
         .from("profiles")
         .select("user_id, full_name")
         .in("user_id", supervisorRoles.map((r) => r.user_id));
 
       setSupervisors(supervisorProfiles || []);
     }
 
     setIsLoading(false);
   };
 
   useEffect(() => {
     fetchData();
   }, []);
 
    const handleCreate = async () => {
      const validation = placementSchema.safeParse(newPlacement);
      if (!validation.success) {
        toast({
          title: "Validation error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      setIsCreating(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from("attachments").insert({
          student_id: validation.data.student_id,
          company_id: validation.data.company_id,
          supervisor_id: validation.data.supervisor_id || null,
          coordinator_id: user?.id,
          start_date: validation.data.start_date,
          end_date: validation.data.end_date,
          status: "pending",
        });

        if (error) throw error;

        toast({
          title: "Placement created",
          description: "The attachment placement has been created",
        });

        setNewPlacement({
          student_id: "",
          company_id: "",
          supervisor_id: "",
          start_date: "",
          end_date: "",
        });
        setDialogOpen(false);
        await fetchData();
      } catch (error: any) {
        toast({
          title: "Error",
          description: getUserFriendlyError(error),
          variant: "destructive",
        });
      } finally {
       setIsCreating(false);
     }
   };
 
   const getStatusBadge = (status: string) => {
     switch (status) {
       case "active":
         return <Badge className="bg-success/10 text-success border-0">Active</Badge>;
       case "completed":
         return <Badge className="bg-info/10 text-info border-0">Completed</Badge>;
       case "pending":
         return <Badge className="bg-warning/10 text-warning border-0">Pending</Badge>;
       case "rejected":
         return <Badge className="bg-destructive/10 text-destructive border-0">Rejected</Badge>;
       default:
         return <Badge variant="secondary">{status}</Badge>;
     }
   };
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl lg:text-3xl font-display font-bold">Placements</h1>
             <p className="text-muted-foreground mt-1">
               Manage student attachment placements
             </p>
           </div>
 
           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
             <DialogTrigger asChild>
               <Button className="bg-gradient-primary hover:opacity-90">
                 <Plus className="w-4 h-4 mr-2" />
                 Create Placement
               </Button>
             </DialogTrigger>
             <DialogContent className="bg-card">
               <DialogHeader>
                 <DialogTitle>Create Placement</DialogTitle>
                 <DialogDescription>
                   Assign a student to a company for industrial attachment
                 </DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-2">
                   <Label>Student *</Label>
                   <Select
                     value={newPlacement.student_id}
                     onValueChange={(v) => setNewPlacement({ ...newPlacement, student_id: v })}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select student" />
                     </SelectTrigger>
                     <SelectContent className="bg-card">
                       {students.map((s) => (
                         <SelectItem key={s.user_id} value={s.user_id}>
                           {s.full_name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Company *</Label>
                   <Select
                     value={newPlacement.company_id}
                     onValueChange={(v) => setNewPlacement({ ...newPlacement, company_id: v })}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select company" />
                     </SelectTrigger>
                     <SelectContent className="bg-card">
                       {companies.map((c) => (
                         <SelectItem key={c.id} value={c.id}>
                           {c.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Supervisor (Optional)</Label>
                   <Select
                     value={newPlacement.supervisor_id}
                     onValueChange={(v) => setNewPlacement({ ...newPlacement, supervisor_id: v })}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Select supervisor" />
                     </SelectTrigger>
                     <SelectContent className="bg-card">
                       {supervisors.map((s) => (
                         <SelectItem key={s.user_id} value={s.user_id}>
                           {s.full_name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Start Date *</Label>
                     <Input
                       type="date"
                       value={newPlacement.start_date}
                       onChange={(e) => setNewPlacement({ ...newPlacement, start_date: e.target.value })}
                     />
                   </div>
                   <div className="space-y-2">
                     <Label>End Date *</Label>
                     <Input
                       type="date"
                       value={newPlacement.end_date}
                       onChange={(e) => setNewPlacement({ ...newPlacement, end_date: e.target.value })}
                     />
                   </div>
                 </div>
               </div>
               <DialogFooter>
                 <Button
                   onClick={handleCreate}
                   disabled={isCreating}
                   className="bg-gradient-primary"
                 >
                   {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                   Create Placement
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
         </div>
 
         {isLoading ? (
           <div className="flex items-center justify-center py-16">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
         ) : placements.length > 0 ? (
           <div className="space-y-4">
             {placements.map((placement) => (
               <Card key={placement.id}>
                 <CardContent className="p-6">
                   <div className="flex items-start justify-between gap-4">
                     <div className="space-y-3">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                           <User className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                           <h3 className="font-semibold">{placement.student.full_name}</h3>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                             <Building2 className="w-3 h-3" />
                             {placement.company.name}
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <span className="flex items-center gap-1">
                           <Calendar className="w-4 h-4" />
                           {format(new Date(placement.start_date), "MMM d")} -{" "}
                           {format(new Date(placement.end_date), "MMM d, yyyy")}
                         </span>
                         {placement.supervisor && (
                           <span>Supervisor: {placement.supervisor.full_name}</span>
                         )}
                       </div>
                     </div>
                     {getStatusBadge(placement.status)}
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         ) : (
           <Card>
             <CardContent className="py-16 text-center">
               <Building2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
               <h3 className="text-lg font-semibold mb-2">No placements yet</h3>
               <p className="text-muted-foreground mb-6">
                 Create your first student placement
               </p>
               <Button
                 className="bg-gradient-primary hover:opacity-90"
                 onClick={() => setDialogOpen(true)}
               >
                 <Plus className="w-4 h-4 mr-2" />
                 Create Placement
               </Button>
             </CardContent>
           </Card>
         )}
       </div>
     </DashboardLayout>
   );
 };
 
 export default AdminPlacements;