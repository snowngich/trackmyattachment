import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/error-utils";
import {
  ArrowLeft,
  Save,
  Send,
  Upload,
  Loader2,
} from "lucide-react";

interface Attachment {
  id: string;
  company: { name: string };
}

const NewLog = () => {
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeFrom, setTimeFrom] = useState("08:00");
  const [timeTo, setTimeTo] = useState("17:00");
  const [activity, setActivity] = useState("");
  const [problemFaced, setProblemFaced] = useState("");
  const [lessonLearnt, setLessonLearnt] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAttachment, setIsLoadingAttachment] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttachment = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("attachments")
        .select("id, company_id")
        .eq("student_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (data) {
        // Fetch company name separately to avoid join issues
        let companyName = "Your Company";
        const { data: org } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", data.company_id)
          .maybeSingle();
        if (org) companyName = org.name;

        setAttachment({ id: data.id, company: { name: companyName } });
      }
      setIsLoadingAttachment(false);
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

    if (!activity.trim()) {
      toast({
        title: "Empty log",
        description: "Please describe your activity for the day.",
        variant: "destructive",
      });
      return;
    }

    submit ? setIsSubmitting(true) : setIsSaving(true);

    try {
      // Calculate a simple day number from attachment
      const { data: existingLogs } = await supabase
        .from("logs")
        .select("id")
        .eq("attachment_id", attachment.id);

      const dayNumber = (existingLogs?.length || 0) + 1;

      // Create the log
      const { data: log, error } = await supabase
        .from("logs")
        .insert({
          attachment_id: attachment.id,
          week_number: dayNumber,
          content: activity.trim(),
          submitted_at: submit ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert log entry
      const { error: entryError } = await supabase
        .from("log_entries")
        .insert({
          log_id: log.id,
          entry_date: entryDate,
          time_from: timeFrom,
          time_to: timeTo,
          activity: activity.trim(),
          problem_faced: problemFaced.trim() || null,
          lesson_learnt: lessonLearnt.trim() || null,
        });

      if (entryError) throw entryError;

      // Upload files if any
      if (files.length > 0 && log) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
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
          ? "Your daily log has been submitted for review."
          : "Your draft has been saved.",
      });

      navigate("/student/logs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyError(error),
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

  if (isLoadingAttachment) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!attachment) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-semibold mb-2">No Active Attachment</h3>
            <p className="text-muted-foreground mb-6">
              You need to set up your attachment first before creating logs.
            </p>
            <Button variant="outline" onClick={() => navigate("/student/attachment-setup")}>
              Set Up Attachment
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/student/logs")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">New Daily Log</h1>
            <p className="text-muted-foreground">{attachment.company.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Log Entry</CardTitle>
            <CardDescription>
              Record your activity, challenges, and lessons for today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entryDate">Date *</Label>
                <Input
                  id="entryDate"
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeFrom">Time From</Label>
                <Input
                  id="timeFrom"
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeTo">Time To</Label>
                <Input
                  id="timeTo"
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activity">Activity *</Label>
              <Textarea
                id="activity"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="What did you work on today?"
                className="min-h-[100px] resize-y"
                maxLength={2000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemFaced">Problem Faced</Label>
              <Textarea
                id="problemFaced"
                value={problemFaced}
                onChange={(e) => setProblemFaced(e.target.value)}
                placeholder="Any challenges you encountered?"
                className="min-h-[60px] resize-y"
                maxLength={1000}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonLearnt">Lesson Learnt</Label>
              <Textarea
                id="lessonLearnt"
                value={lessonLearnt}
                onChange={(e) => setLessonLearnt(e.target.value)}
                placeholder="Key takeaways from today"
                className="min-h-[60px] resize-y"
                maxLength={1000}
              />
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label htmlFor="files">Attachments (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload supporting documents
                </p>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
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
