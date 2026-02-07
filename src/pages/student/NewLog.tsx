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
  Plus,
  Trash2,
} from "lucide-react";

interface Attachment {
  id: string;
  company: { name: string };
}

interface LogEntry {
  id: string;
  entry_date: string;
  time_from: string;
  time_to: string;
  activity: string;
  problem_faced: string;
  lesson_learnt: string;
}

const emptyEntry = (): LogEntry => ({
  id: crypto.randomUUID(),
  entry_date: new Date().toISOString().split("T")[0],
  time_from: "08:00",
  time_to: "17:00",
  activity: "",
  problem_faced: "",
  lesson_learnt: "",
});

const NewLog = () => {
  const [weekNumber, setWeekNumber] = useState(1);
  const [entries, setEntries] = useState<LogEntry[]>([emptyEntry()]);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        .select("id, company:company_id(name)")
        .eq("student_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (data) {
        setAttachment(data as unknown as Attachment);

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

  const updateEntry = (id: string, field: keyof LogEntry, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, emptyEntry()]);
  };

  const removeEntry = (id: string) => {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSave = async (submit: boolean = false) => {
    if (!attachment) {
      toast({
        title: "No active attachment",
        description: "You need an active attachment to create logs.",
        variant: "destructive",
      });
      return;
    }

    // Validate at least one entry has activity content
    const validEntries = entries.filter((e) => e.activity.trim());
    if (validEntries.length === 0) {
      toast({
        title: "Empty log",
        description: "Please add at least one activity entry.",
        variant: "destructive",
      });
      return;
    }

    submit ? setIsSubmitting(true) : setIsSaving(true);

    try {
      // Create the log (keep content as summary of activities)
      const contentSummary = validEntries
        .map((e) => e.activity)
        .join("; ");

      const { data: log, error } = await supabase
        .from("logs")
        .insert({
          attachment_id: attachment.id,
          week_number: weekNumber,
          content: contentSummary,
          submitted_at: submit ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert log entries
      const entryInserts = validEntries.map((e) => ({
        log_id: log.id,
        entry_date: e.entry_date,
        time_from: e.time_from,
        time_to: e.time_to,
        activity: e.activity.trim(),
        problem_faced: e.problem_faced.trim() || null,
        lesson_learnt: e.lesson_learnt.trim() || null,
      }));

      const { error: entriesError } = await supabase
        .from("log_entries")
        .insert(entryInserts);

      if (entriesError) throw entriesError;

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
          ? "Your weekly log has been submitted for review."
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/student/logs")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">New Weekly Log</h1>
            <p className="text-muted-foreground">{attachment.company.name}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Week {weekNumber} Log Sheet</CardTitle>
            <CardDescription>
              Fill in your daily activities, challenges, and lessons learnt
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

            {/* Log Entries Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Daily Entries</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEntry}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Entry
                </Button>
              </div>

              {entries.map((entry, index) => (
                <Card key={entry.id} className="border-border">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Entry {index + 1}
                      </span>
                      {entries.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Date</Label>
                        <Input
                          type="date"
                          value={entry.entry_date}
                          onChange={(e) =>
                            updateEntry(entry.id, "entry_date", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Time From</Label>
                        <Input
                          type="time"
                          value={entry.time_from}
                          onChange={(e) =>
                            updateEntry(entry.id, "time_from", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Time To</Label>
                        <Input
                          type="time"
                          value={entry.time_to}
                          onChange={(e) =>
                            updateEntry(entry.id, "time_to", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Activity *</Label>
                      <Textarea
                        value={entry.activity}
                        onChange={(e) =>
                          updateEntry(entry.id, "activity", e.target.value)
                        }
                        placeholder="What did you work on?"
                        className="min-h-[60px] resize-y"
                        maxLength={2000}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Problem Faced</Label>
                        <Textarea
                          value={entry.problem_faced}
                          onChange={(e) =>
                            updateEntry(entry.id, "problem_faced", e.target.value)
                          }
                          placeholder="Any challenges?"
                          className="min-h-[50px] resize-y"
                          maxLength={1000}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Lesson Learnt</Label>
                        <Textarea
                          value={entry.lesson_learnt}
                          onChange={(e) =>
                            updateEntry(entry.id, "lesson_learnt", e.target.value)
                          }
                          placeholder="Key takeaways"
                          className="min-h-[50px] resize-y"
                          maxLength={1000}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
