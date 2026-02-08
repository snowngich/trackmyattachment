import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getUserFriendlyError } from "@/lib/error-utils";
import { feedbackSchema } from "@/lib/validation";
import {
  ArrowLeft,
  Send,
  Loader2,
  FileText,
  Calendar,
  Paperclip,
  MessageSquare,
  Clock,
  Building2,
  GraduationCap,
} from "lucide-react";
import { format } from "date-fns";

interface Log {
  id: string;
  week_number: number;
  content: string;
  submitted_at: string;
  attachment_id: string;
}

interface StudentInfo {
  full_name: string;
  student_reg_number: string | null;
}

interface AttachmentInfo {
  company_name: string;
  supervisor_name: string | null;
  start_date: string;
  end_date: string;
}

interface Feedback {
  id: string;
  comment: string;
  created_at: string;
  author: { full_name: string };
}

interface LogFile {
  id: string;
  file_name: string;
  file_path: string;
}

interface LogEntryData {
  id: string;
  entry_date: string;
  time_from: string | null;
  time_to: string | null;
  activity: string;
  problem_faced: string | null;
  lesson_learnt: string | null;
  supervisor_remarks: string | null;
}

const LecturerReviewLog = () => {
  const { logId } = useParams<{ logId: string }>();
  const [log, setLog] = useState<Log | null>(null);
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [attachmentInfo, setAttachmentInfo] = useState<AttachmentInfo | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [files, setFiles] = useState<LogFile[]>([]);
  const [logEntries, setLogEntries] = useState<LogEntryData[]>([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!logId) return;

      const { data: logData } = await supabase
        .from("logs")
        .select("*")
        .eq("id", logId)
        .single();

      if (logData) {
        setLog(logData);

        const [attachmentRes, entriesRes, feedbackRes, filesRes] = await Promise.all([
          supabase.from("attachments").select("student_id, company_id, supervisor_name, start_date, end_date").eq("id", logData.attachment_id).single(),
          supabase.from("log_entries").select("*").eq("log_id", logId).order("entry_date"),
          supabase.from("feedback").select("id, comment, created_at, author_id").eq("log_id", logId).order("created_at"),
          supabase.from("log_files").select("*").eq("log_id", logId),
        ]);

        if (attachmentRes.data) {
          // Fetch student profile and company name in parallel
          const [profileRes, companyRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("full_name, student_reg_number")
              .eq("user_id", attachmentRes.data.student_id)
              .single(),
            supabase
              .from("organizations")
              .select("name")
              .eq("id", attachmentRes.data.company_id)
              .single(),
          ]);

          if (profileRes.data) setStudent(profileRes.data);
          setAttachmentInfo({
            company_name: companyRes.data?.name || "Unknown",
            supervisor_name: attachmentRes.data.supervisor_name,
            start_date: attachmentRes.data.start_date,
            end_date: attachmentRes.data.end_date,
          });
        }

        if (entriesRes.data) setLogEntries(entriesRes.data);

        if (feedbackRes.data && feedbackRes.data.length > 0) {
          const authorIds = feedbackRes.data.map((f: any) => f.author_id);
          const { data: authors } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", authorIds);

          const authorMap = new Map(authors?.map((a) => [a.user_id, a.full_name]) || []);

          setFeedback(
            feedbackRes.data.map((f: any) => ({
              ...f,
              author: { full_name: authorMap.get(f.author_id) || "Unknown" },
            }))
          );
        }

        if (filesRes.data) setFiles(filesRes.data);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [logId]);

  const handleSubmitFeedback = async () => {
    if (!logId) return;

    const validation = feedbackSchema.safeParse({ comment: newFeedback });
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("feedback").insert({
        log_id: logId,
        author_id: user.id,
        comment: validation.data.comment,
      });

      if (error) throw error;

      toast({
        title: "Assessment submitted!",
        description: "Your feedback has been sent to the student.",
      });

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      setFeedback([
        ...feedback,
        {
          id: Date.now().toString(),
          comment: validation.data.comment,
          created_at: new Date().toISOString(),
          author: { full_name: profile?.full_name || "You" },
        },
      ]);
      setNewFeedback("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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

  if (!log) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-16 text-center">
            <h3 className="text-lg font-semibold mb-2">Log not found</h3>
            <Button variant="outline" onClick={() => navigate("/coordinator/logs")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Logs
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/coordinator/logs")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold">Assess Log</h1>
            <p className="text-muted-foreground">
              {student?.full_name} • Week {log.week_number}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Log Entries Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Week {log.week_number} Entries
                  </CardTitle>
                  <Badge>
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(log.submitted_at), "MMM d, yyyy")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {logEntries.length > 0 ? (
                  <div className="space-y-4">
                    {logEntries.map((entry) => (
                      <div key={entry.id} className="border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">
                            {format(new Date(entry.entry_date), "EEE, MMM d")}
                          </span>
                          {entry.time_from && entry.time_to && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {entry.time_from} - {entry.time_to}
                            </span>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs text-muted-foreground">Activity</Label>
                          <p className="text-sm mt-0.5">{entry.activity}</p>
                        </div>

                        {entry.problem_faced && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Problem Faced</Label>
                            <p className="text-sm mt-0.5">{entry.problem_faced}</p>
                          </div>
                        )}

                        {entry.lesson_learnt && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Lesson Learnt</Label>
                            <p className="text-sm mt-0.5">{entry.lesson_learnt}</p>
                          </div>
                        )}

                        {entry.supervisor_remarks && (
                          <div className="pt-2 border-t border-border">
                            <Label className="text-xs text-muted-foreground">Supervisor's Remarks</Label>
                            <p className="text-sm mt-0.5 italic">{entry.supervisor_remarks}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{log.content}</p>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <Paperclip className="w-4 h-4" />
                      Attachments ({files.length})
                    </h4>
                    <div className="space-y-2">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm"
                        >
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {file.file_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assessment Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Assessment Feedback
                </CardTitle>
                <CardDescription>
                  Provide grading feedback and assessment comments for this log
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {feedback.length > 0 && (
                  <div className="space-y-4">
                    {feedback.map((f) => (
                      <div key={f.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {f.author.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{f.author.full_name}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(f.created_at), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{f.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <Textarea
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    placeholder="Write your assessment feedback, grading comments, or improvement suggestions..."
                    className="min-h-[120px]"
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {newFeedback.length}/2000
                    </p>
                    <Button
                      className="bg-gradient-primary hover:opacity-90"
                      onClick={handleSubmitFeedback}
                      disabled={!newFeedback.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Submit Assessment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{student?.full_name}</p>
                    {student?.student_reg_number && (
                      <p className="text-sm text-muted-foreground">
                        Reg: {student.student_reg_number}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {attachmentInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Placement Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Company</Label>
                    <p className="text-sm font-medium">{attachmentInfo.company_name}</p>
                  </div>
                  {attachmentInfo.supervisor_name && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Supervisor</Label>
                      <p className="text-sm font-medium">{attachmentInfo.supervisor_name}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Duration</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(attachmentInfo.start_date), "MMM d, yyyy")} –{" "}
                      {format(new Date(attachmentInfo.end_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Log Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Week</span>
                  <span className="font-medium">{log.week_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entries</span>
                  <span className="font-medium">{logEntries.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Assessments</span>
                  <span className="font-medium">{feedback.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">
                    {format(new Date(log.submitted_at), "MMM d")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LecturerReviewLog;
