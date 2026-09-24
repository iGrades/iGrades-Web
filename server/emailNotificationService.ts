import fs from "fs";
import path from "path";

export interface EmailAuditLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  recipient_type: "student" | "parent";
  subject: string;
  template: "class_change_approved" | "class_change_rejected";
  sent_at: string;
  status: "delivered" | "failed" | "logged";
  error_message?: string;
  details: {
    student_id: string;
    student_name: string;
    parent_id?: string;
    parent_name?: string;
    old_class?: string;
    new_class?: string;
    requested_class?: string;
    admin_reason?: string;
    initiated_by_type?: "student" | "parent";
  };
}

class EmailNotificationService {
  private logFilePath: string;
  private logs: EmailAuditLog[] = [];

  constructor() {
    this.logFilePath = path.join(process.cwd(), "data", "email_audit_log.json");
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.logFilePath)) {
        const raw = fs.readFileSync(this.logFilePath, "utf-8");
        this.logs = JSON.parse(raw);
      } else {
        this.logs = [];
        this.saveLogs();
      }
    } catch (e) {
      console.warn("Could not load email audit logs:", e);
      this.logs = [];
    }
  }

  private saveLogs() {
    try {
      const dir = path.dirname(this.logFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.logFilePath, JSON.stringify(this.logs, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not save email audit logs:", e);
    }
  }

  public getLogs(): EmailAuditLog[] {
    return [...this.logs];
  }

  /**
   * Helper to dispatch email via Web3Forms with graceful audit fallback
   */
  private async dispatchEmail(params: {
    recipientEmail: string;
    recipientName: string;
    recipientType: "student" | "parent";
    subject: string;
    messageBody: string;
    template: "class_change_approved" | "class_change_rejected";
    details: EmailAuditLog["details"];
  }): Promise<string> {
    const { recipientEmail, recipientName, recipientType, subject, messageBody, template, details } = params;
    const logId = "em_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 7);

    const logEntry: EmailAuditLog = {
      id: logId,
      recipient_email: recipientEmail || "unspecified",
      recipient_name: recipientName || "User",
      recipient_type: recipientType,
      subject,
      template,
      sent_at: new Date().toISOString(),
      status: "delivered",
      details,
    };

    if (recipientEmail && recipientEmail.includes("@") && !recipientEmail.endsWith("@example.com")) {
      try {
        await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            access_key: "585caeb5-766f-456f-9069-ce1456b78525",
            name: "iGrades Academic Administration",
            email: recipientEmail,
            subject,
            message: messageBody,
          }),
        });
      } catch (err: any) {
        logEntry.status = "logged";
        logEntry.error_message = err?.message;
        console.warn(`Email delivery note for ${recipientEmail}:`, err?.message);
      }
    } else {
      logEntry.status = "logged";
    }

    this.logs.unshift(logEntry);
    this.saveLogs();
    return logId;
  }

  /**
   * Send notification for approved class change to Student and Parent (if linked)
   */
  public async sendClassChangeApprovedEmail(params: {
    studentId: string;
    studentName: string;
    studentEmail?: string;
    previousClass: string;
    newClass: string;
    adminNote?: string;
    initiatedByType?: "student" | "parent";
    parentId?: string;
    parentName?: string;
    parentEmail?: string;
  }): Promise<{ success: boolean; logIds: string[] }> {
    const {
      studentId,
      studentName,
      studentEmail,
      previousClass,
      newClass,
      adminNote,
      initiatedByType = "student",
      parentId,
      parentName,
      parentEmail,
    } = params;

    const logIds: string[] = [];

    // 1. Prepare and send Student Email
    if (studentEmail && studentEmail.trim()) {
      const studentSubject = initiatedByType === "parent"
        ? "Your iGrades Class Has Been Updated"
        : "Your iGrades Class Change Request Has Been Approved";

      const studentMessage = initiatedByType === "parent"
        ? `Hello ${studentName},\n\nYour academic class on iGrades has been updated from ${previousClass} to ${newClass} following an approved request submitted by your parent/guardian (${parentName || "Parent"}).\n\nYour curriculum syllabus, practice drills, and learning content have now transitioned to ${newClass}.\n\n${adminNote ? `Administrator Remark: ${adminNote}\n\n` : ""}Happy learning!\n\nBest regards,\niGrades Academic Team`
        : `Hello ${studentName},\n\nGreat news! Your request to change your enrolled class from ${previousClass} to ${newClass} has been reviewed and APPROVED by the academic administration.\n\nYour learning dashboard and course content have been updated to ${newClass}.\n\n${adminNote ? `Administrator Remark: ${adminNote}\n\n` : ""}Best regards,\niGrades Academic Team`;

      const id = await this.dispatchEmail({
        recipientEmail: studentEmail,
        recipientName: studentName,
        recipientType: "student",
        subject: studentSubject,
        messageBody: studentMessage,
        template: "class_change_approved",
        details: {
          student_id: studentId,
          student_name: studentName,
          parent_id: parentId,
          parent_name: parentName,
          old_class: previousClass,
          new_class: newClass,
          admin_reason: adminNote,
          initiated_by_type: initiatedByType,
        },
      });
      logIds.push(id);
    }

    // 2. Prepare and send Parent Email (if parent email exists)
    if (parentEmail && parentEmail.trim()) {
      const parentSubject = initiatedByType === "parent"
        ? "Your Child's iGrades Class Change Has Been Approved"
        : "Your Child's iGrades Class Has Been Updated";

      const parentMessage = initiatedByType === "parent"
        ? `Hello ${parentName || "Parent"},\n\nWe are pleased to inform you that your class change request for your child, ${studentName}, has been reviewed and APPROVED by the academic administration.\n\nSummary of Academic Update:\n- Student: ${studentName}\n- Previous Class: ${previousClass}\n- New Enrolled Class: ${newClass}\n- Decision: Approved & Enrolled\n\n${adminNote ? `Administrator Remark: ${adminNote}\n\n` : ""}${studentName}'s learning modules, drills, and performance metrics have been updated.\n\nThank you for choosing iGrades!\n\nBest regards,\niGrades Academic Team`
        : `Hello ${parentName || "Parent"},\n\nYour child, ${studentName}, requested a class change from ${previousClass} to ${newClass}, which has been evaluated and APPROVED by the school administration.\n\n${studentName}'s enrolled class is now officially set to ${newClass}.\n\n${adminNote ? `Administrator Remark: ${adminNote}\n\n` : ""}Best regards,\niGrades Academic Team`;

      const id = await this.dispatchEmail({
        recipientEmail: parentEmail,
        recipientName: parentName || "Parent",
        recipientType: "parent",
        subject: parentSubject,
        messageBody: parentMessage,
        template: "class_change_approved",
        details: {
          student_id: studentId,
          student_name: studentName,
          parent_id: parentId,
          parent_name: parentName,
          old_class: previousClass,
          new_class: newClass,
          admin_reason: adminNote,
          initiated_by_type: initiatedByType,
        },
      });
      logIds.push(id);
    }

    return { success: true, logIds };
  }

  /**
   * Send notification for rejected class change to Student and Parent (if linked)
   */
  public async sendClassChangeRejectedEmail(params: {
    studentId: string;
    studentName: string;
    studentEmail?: string;
    requestedClass: string;
    adminReason?: string;
    initiatedByType?: "student" | "parent";
    parentId?: string;
    parentName?: string;
    parentEmail?: string;
  }): Promise<{ success: boolean; logIds: string[] }> {
    const {
      studentId,
      studentName,
      studentEmail,
      requestedClass,
      adminReason,
      initiatedByType = "student",
      parentId,
      parentName,
      parentEmail,
    } = params;

    const logIds: string[] = [];

    // 1. Send Student Email
    if (studentEmail && studentEmail.trim()) {
      const studentSubject = "Update on Your iGrades Class Change Request";
      const studentMessage = `Hello ${studentName},\n\nA request to change your enrolled class to ${requestedClass} has been reviewed by the administration. At this time, the request was NOT approved.\n\nReason for Decision: ${adminReason || "Requirements not met or prerequisite examination verification pending"}.\n\nYour current class assignment remains unchanged. If you have questions, please speak with your academic coordinator or school administrator.\n\nBest regards,\niGrades Academic Team`;

      const id = await this.dispatchEmail({
        recipientEmail: studentEmail,
        recipientName: studentName,
        recipientType: "student",
        subject: studentSubject,
        messageBody: studentMessage,
        template: "class_change_rejected",
        details: {
          student_id: studentId,
          student_name: studentName,
          parent_id: parentId,
          parent_name: parentName,
          requested_class: requestedClass,
          admin_reason: adminReason,
          initiated_by_type: initiatedByType,
        },
      });
      logIds.push(id);
    }

    // 2. Send Parent Email (if parent email exists)
    if (parentEmail && parentEmail.trim()) {
      const parentSubject = "Update on Your Child's Class Change Request";
      const parentMessage = `Hello ${parentName || "Parent"},\n\nThe class change request for your child, ${studentName}, to enroll in ${requestedClass} has been reviewed by our academic administration. At this time, the request was NOT approved.\n\nAdministrator Explanation:\n${adminReason || "Prerequisite term examinations or curriculum eligibility requirements not met"}.\n\n${studentName}'s current class placement remains unchanged. Please contact academic support if you require further assistance.\n\nBest regards,\niGrades Academic Support`;

      const id = await this.dispatchEmail({
        recipientEmail: parentEmail,
        recipientName: parentName || "Parent",
        recipientType: "parent",
        subject: parentSubject,
        messageBody: parentMessage,
        template: "class_change_rejected",
        details: {
          student_id: studentId,
          student_name: studentName,
          parent_id: parentId,
          parent_name: parentName,
          requested_class: requestedClass,
          admin_reason: adminReason,
          initiated_by_type: initiatedByType,
        },
      });
      logIds.push(id);
    }

    return { success: true, logIds };
  }
}

export const emailService = new EmailNotificationService();
