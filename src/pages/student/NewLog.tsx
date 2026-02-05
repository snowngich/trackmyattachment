 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { supabase } from "@/integrations/supabase/client";
 import DashboardLayout from "@/components/layout/DashboardLayout";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import { Input } from "@/components/ui/input";
 import { useToast } from "@/hooks/use-toast";
 import { ArrowLeft, Save, Send, Upload, Loader2 } from "lucide-react";
 
 interface Attachment {
   id: string;
   company: { name: string };
 }
 
 const NewLog = () => {
   const [content, setContent] = useState("");
   const [weekNumber, setWeekNumber] = useState(1);
   const [attachment, setAttachment] = useState<Attachment | null>(null);
   const [files, setFiles] = useState<File[]>([]);
   const [isSaving, setIsSaving] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const navigate = useNavigate();
   const { toast } = useToast();
 
   useEffect(() => {
     const fetchAttachment = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
 
       // Get active attachment
       const { data } = await supabase
         .from("attachments")
         .select("id, company:company_id(name)")
         .eq("student_id", user.id)
         .eq("status", "active")
         .maybeSingle();
 
       if (data) {
         setAttachment(data as unknown as Attachment);
 
         // Get the next week number
         const { data: logs } = await supabase
           .from("logs")
           .select("week_number")
           .eq("attachment_id", data.id)
           .order("week_number", { ascending: false })
           .limit(1);
 
         if (logs && logs.length > 0) {
           setWeekNumber(logs[0].week_number + 1);
         }
       }
     };
 
     fetchAttachment();
   }, []);
 
   const handleSave = async (submit: boolean = false) => {
     if (!attachment) {
       toast({
         title: "No active attachment",
         description: "You need an active attachment to create logs.",
         variant: "destructive",
       });
       return;
     }
 
     if (!content.trim()) {
       toast({
         title: "Content required",
         description: "Please enter your weekly log content.",
         variant: "destructive",
       });
       return;
     }
 
     submit ? setIsSubmitting(true) : setIsSaving(true);
 
     try {
       const { data: log, error } = await supabase
         .from("logs")
         .insert({
           attachment_id: attachment.id,
           week_number: weekNumber,
           content: content.trim(),
           submitted_at: submit ? new Date().toISOString() : null,
         })
         .select()
         .single();
 
       if (error) throw error;
 
       // Upload files if any
       if (files.length > 0 && log) {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
           for (const file of files) {
             const filePath = `${user.id}/${log.id}/${file.name}`;
             const { error: uploadError } = await supabase.storage
               .from("documents")
               .upload(filePath, file);
 
             if (!uploadError) {
               await supabase.from("log_files").insert({
                 log_id: log.id,
                 file_name: file.name,
                 file_path: filePath,
                 file_size: file.size,
               });
             }
           }
         }
       }
 
       toast({
         title: submit ? "Log submitted!" : "Log saved!",
         description: submit
           ? "Your weekly log has been submitted for review."
           : "Your draft has been saved.",
       });
 
       navigate("/student/logs");
     } catch (error: any) {
       toast({
         title: "Error",
         description: error.message,
         variant: "destructive",
       });
     } finally {
       setIsSaving(false);
       setIsSubmitting(false);
     }
   };
 
   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
       setFiles(Array.from(e.target.files));
     }
   };
 
   if (!attachment) {
     return (
       <DashboardLayout>
         <Card>
           <CardContent className="py-16 text-center">
             <h3 className="text-lg font-semibold mb-2">No Active Attachment</h3>
             <p className="text-muted-foreground mb-6">
               You need an active attachment placement to create logs.
             </p>
             <Button variant="outline" onClick={() => navigate("/student")}>
               <ArrowLeft className="w-4 h-4 mr-2" />
               Back to Dashboard
             </Button>
           </CardContent>
         </Card>
       </DashboardLayout>
     );
   }
 
   return (
     <DashboardLayout>
       <div className="space-y-6 max-w-3xl">
         <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" onClick={() => navigate("/student/logs")}>
             <ArrowLeft className="w-5 h-5" />
           </Button>
           <div>
             <h1 className="text-2xl font-display font-bold">New Weekly Log</h1>
             <p className="text-muted-foreground">{attachment.company.name}</p>
           </div>
         </div>
 
         <Card>
           <CardHeader>
             <CardTitle>Week {weekNumber} Log</CardTitle>
             <CardDescription>
               Document your activities, learnings, and experiences this week
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-6">
             <div className="space-y-2">
               <Label htmlFor="weekNumber">Week Number</Label>
               <Input
                 id="weekNumber"
                 type="number"
                 value={weekNumber}
                 onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                 min={1}
                 className="w-32"
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="content">Log Content</Label>
               <Textarea
                 id="content"
                 value={content}
                 onChange={(e) => setContent(e.target.value)}
                 placeholder="Describe what you worked on this week, what you learned, challenges faced, and any other relevant experiences..."
                 className="min-h-[300px] resize-y"
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="files">Attachments (Optional)</Label>
               <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                 <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                 <p className="text-sm text-muted-foreground mb-2">
                   Drag and drop files here, or click to browse
                 </p>
                 <Input
                   id="files"
                   type="file"
                   multiple
                   onChange={handleFileChange}
                   className="hidden"
                 />
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => document.getElementById("files")?.click()}
                 >
                   Browse Files
                 </Button>
                 {files.length > 0 && (
                   <div className="mt-4 text-left">
                     <p className="text-sm font-medium mb-2">Selected files:</p>
                     {files.map((file, i) => (
                       <p key={i} className="text-sm text-muted-foreground">
                         {file.name}
                       </p>
                     ))}
                   </div>
                 )}
               </div>
             </div>
 
             <div className="flex gap-3 pt-4">
               <Button
                 variant="outline"
                 onClick={() => handleSave(false)}
                 disabled={isSaving || isSubmitting}
               >
                 {isSaving ? (
                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
                 ) : (
                   <Save className="w-4 h-4 mr-2" />
                 )}
                 Save Draft
               </Button>
               <Button
                 className="bg-gradient-primary hover:opacity-90"
                 onClick={() => handleSave(true)}
                 disabled={isSaving || isSubmitting}
               >
                 {isSubmitting ? (
                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
                 ) : (
                   <Send className="w-4 h-4 mr-2" />
                 )}
                 Submit Log
               </Button>
             </div>
           </CardContent>
         </Card>
       </div>
     </DashboardLayout>
   );
 };
 
 export default NewLog;