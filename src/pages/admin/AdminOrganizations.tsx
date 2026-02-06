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
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/error-utils";
import { organizationSchema } from "@/lib/validation";
import { 
    Building2, 
    GraduationCap,
    Plus,
    Loader2,
    MapPin
  } from "lucide-react";
 
 type OrgType = "university" | "company";
 
 interface Organization {
   id: string;
   name: string;
   type: OrgType;
   address: string | null;
   created_at: string;
 }
 
 const AdminOrganizations = () => {
   const [organizations, setOrganizations] = useState<Organization[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isCreating, setIsCreating] = useState(false);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [newOrg, setNewOrg] = useState({
     name: "",
     type: "university" as OrgType,
     address: "",
   });
   const { toast } = useToast();
 
   const fetchOrganizations = async () => {
     const { data } = await supabase
       .from("organizations")
       .select("*")
       .order("name");
 
     if (data) {
       setOrganizations(data as Organization[]);
     }
     setIsLoading(false);
   };
 
   useEffect(() => {
     fetchOrganizations();
   }, []);
 
    const handleCreate = async () => {
      const validation = organizationSchema.safeParse(newOrg);
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
        const { error } = await supabase.from("organizations").insert({
          name: validation.data.name,
          type: validation.data.type,
          address: validation.data.address || null,
        });

        if (error) throw error;

        toast({
          title: "Organization created",
          description: `${validation.data.name} has been added`,
        });

        setNewOrg({ name: "", type: "university", address: "" });
        setDialogOpen(false);
        await fetchOrganizations();
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
 
   const universities = organizations.filter((o) => o.type === "university");
   const companies = organizations.filter((o) => o.type === "company");
 
   const OrgCard = ({ org }: { org: Organization }) => (
     <Card>
       <CardContent className="p-6">
         <div className="flex items-start gap-4">
           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
             org.type === "university" ? "bg-info/10" : "bg-success/10"
           }`}>
             {org.type === "university" ? (
               <GraduationCap className="w-6 h-6 text-info" />
             ) : (
               <Building2 className="w-6 h-6 text-success" />
             )}
           </div>
           <div className="flex-1">
             <div className="flex items-center gap-2">
               <h3 className="font-semibold">{org.name}</h3>
               <Badge variant="outline" className="capitalize">
                 {org.type}
               </Badge>
             </div>
             {org.address && (
               <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                 <MapPin className="w-3 h-3" />
                 {org.address}
               </p>
             )}
           </div>
         </div>
       </CardContent>
     </Card>
   );
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
             <h1 className="text-2xl lg:text-3xl font-display font-bold">Organizations</h1>
             <p className="text-muted-foreground mt-1">
               Manage universities and companies
             </p>
           </div>
 
           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
             <DialogTrigger asChild>
               <Button className="bg-gradient-primary hover:opacity-90">
                 <Plus className="w-4 h-4 mr-2" />
                 Add Organization
               </Button>
             </DialogTrigger>
             <DialogContent className="bg-card">
               <DialogHeader>
                 <DialogTitle>Add Organization</DialogTitle>
                 <DialogDescription>
                   Add a new university or company
                 </DialogDescription>
               </DialogHeader>
               <div className="space-y-4 py-4">
                 <div className="space-y-2">
                   <Label>Type</Label>
                   <Select
                     value={newOrg.type}
                     onValueChange={(v) => setNewOrg({ ...newOrg, type: v as OrgType })}
                   >
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-card">
                       <SelectItem value="university">University</SelectItem>
                       <SelectItem value="company">Company</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 <div className="space-y-2">
                   <Label>Name</Label>
                   <Input
                     value={newOrg.name}
                     onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                     placeholder="Organization name"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label>Address (Optional)</Label>
                   <Input
                     value={newOrg.address}
                     onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })}
                     placeholder="Address"
                   />
                 </div>
               </div>
               <DialogFooter>
                 <Button
                   onClick={handleCreate}
                   disabled={isCreating}
                   className="bg-gradient-primary"
                 >
                   {isCreating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                   Create Organization
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
         </div>
 
         {isLoading ? (
           <div className="flex items-center justify-center py-16">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
         ) : (
           <Tabs defaultValue="universities">
             <TabsList>
               <TabsTrigger value="universities" className="gap-2">
                 <GraduationCap className="w-4 h-4" />
                 Universities ({universities.length})
               </TabsTrigger>
               <TabsTrigger value="companies" className="gap-2">
                 <Building2 className="w-4 h-4" />
                 Companies ({companies.length})
               </TabsTrigger>
             </TabsList>
 
             <TabsContent value="universities" className="mt-6 space-y-4">
               {universities.length > 0 ? (
                 universities.map((org) => <OrgCard key={org.id} org={org} />)
               ) : (
                 <Card>
                   <CardContent className="py-16 text-center">
                     <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                     <h3 className="text-lg font-semibold mb-2">No universities yet</h3>
                     <p className="text-muted-foreground">Add your first university to get started</p>
                   </CardContent>
                 </Card>
               )}
             </TabsContent>
 
             <TabsContent value="companies" className="mt-6 space-y-4">
               {companies.length > 0 ? (
                 companies.map((org) => <OrgCard key={org.id} org={org} />)
               ) : (
                 <Card>
                   <CardContent className="py-16 text-center">
                     <Building2 className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                     <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
                     <p className="text-muted-foreground">Add your first company to get started</p>
                   </CardContent>
                 </Card>
               )}
             </TabsContent>
           </Tabs>
         )}
       </div>
     </DashboardLayout>
   );
 };
 
 export default AdminOrganizations;