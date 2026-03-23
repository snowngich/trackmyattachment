import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface LogEntry {
  entry_date: string;
  time_from: string | null;
  time_to: string | null;
  activity: string;
  problem_faced: string | null;
  lesson_learnt: string | null;
  supervisor_remarks: string | null;
}

interface LogData {
  week_number: number;
  content: string;
  submitted_at: string | null;
  supervisor_approved: boolean;
  entries: LogEntry[];
}

interface FeedbackData {
  comment: string;
  created_at: string;
  author_name: string;
}

interface AttachmentInfo {
  company_name: string;
  department_name: string | null;
  start_date: string;
  end_date: string;
  supervisor_name: string | null;
  lecturer_name: string | null;
}

interface ReportData {
  student_name: string;
  reg_number: string | null;
  attachment: AttachmentInfo;
  logs: LogData[];
  feedback: Record<string, FeedbackData[]>;
}

export function generateLogPdf(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Industrial Attachment Logbook", pageWidth / 2, 25, { align: "center" });

  // Student info block
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const infoY = 38;
  const col1 = 14;
  const col2 = pageWidth / 2 + 5;

  const infoRows = [
    ["Student Name:", data.student_name, "Reg Number:", data.reg_number || "N/A"],
    ["Company:", data.attachment.company_name, "Department:", data.attachment.department_name || "N/A"],
    ["Start Date:", format(new Date(data.attachment.start_date), "MMM d, yyyy"), "End Date:", format(new Date(data.attachment.end_date), "MMM d, yyyy")],
    ["Supervisor:", data.attachment.supervisor_name || "N/A", "Lecturer:", data.attachment.lecturer_name || "N/A"],
  ];

  infoRows.forEach((row, i) => {
    const y = infoY + i * 7;
    doc.setFont("helvetica", "bold");
    doc.text(row[0], col1, y);
    doc.setFont("helvetica", "normal");
    doc.text(row[1], col1 + 30, y);
    doc.setFont("helvetica", "bold");
    doc.text(row[2], col2, y);
    doc.setFont("helvetica", "normal");
    doc.text(row[3], col2 + 28, y);
  });

  // Separator
  let currentY = infoY + infoRows.length * 7 + 5;
  doc.setDrawColor(200);
  doc.line(col1, currentY, pageWidth - col1, currentY);
  currentY += 8;

  // Each week log
  const sortedLogs = [...data.logs].sort((a, b) => a.week_number - b.week_number);

  sortedLogs.forEach((log) => {
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Week header
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Week ${log.week_number}`, col1, currentY);

    const statusText = log.supervisor_approved
      ? "Approved"
      : log.submitted_at
        ? "Submitted"
        : "Draft";
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Status: ${statusText}`, pageWidth - col1, currentY, { align: "right" });
    currentY += 5;

    // Summary
    if (log.content) {
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(log.content, pageWidth - 28);
      if (currentY + lines.length * 4 > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(lines, col1, currentY);
      currentY += lines.length * 4 + 3;
    }

    // Entries table
    if (log.entries.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [["Date", "Time", "Activity", "Problems", "Lessons", "Remarks"]],
        body: log.entries.map((e) => [
          format(new Date(e.entry_date), "MMM d"),
          e.time_from && e.time_to ? `${e.time_from.slice(0, 5)}-${e.time_to.slice(0, 5)}` : "-",
          e.activity,
          e.problem_faced || "-",
          e.lesson_learnt || "-",
          e.supervisor_remarks || "-",
        ]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 20 },
          2: { cellWidth: 45 },
          3: { cellWidth: 35 },
          4: { cellWidth: 35 },
          5: { cellWidth: 30 },
        },
        margin: { left: col1, right: col1 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 6;
    }

    // Separator between weeks
    if (currentY < 270) {
      doc.setDrawColor(230);
      doc.line(col1, currentY, pageWidth - col1, currentY);
      currentY += 8;
    }
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text(
      `Generated on ${format(new Date(), "MMM d, yyyy")} — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.setTextColor(0);
  }

  doc.save(`Logbook_${data.student_name.replace(/\s+/g, "_")}.pdf`);
}
