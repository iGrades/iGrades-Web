import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { emailService } from "./emailNotificationService";

export type ClassChangeStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface ClassChangeRequest {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  current_class_id?: string;
  current_class_name: string;
  requested_class_id?: string;
  requested_class_name: string;
  reason: string;
  status: ClassChangeStatus;
  initiated_by_type: "student" | "parent";
  initiated_by_user_id: string;
  parent_id?: string | null;
  parent_name?: string | null;
  parent_email?: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null; // Admin name or ID
  admin_note: string | null;
  old_class: string;
  new_class: string | null;
}

export interface AdminNotification {
  id: string;
  type: "class_change_request" | "system";
  title: string;
  message: string;
  related_request_id?: string;
  student_id?: string;
  student_name?: string;
  current_class?: string;
  requested_class?: string;
  initiated_by_type?: "student" | "parent";
  parent_name?: string;
  is_read: boolean;
  created_at: string;
}

interface StoreData {
  requests: ClassChangeRequest[];
  notifications: AdminNotification[];
}

class ClassChangeEngine {
  private filePath: string;
  private data: StoreData;
  private supabaseClient: ReturnType<typeof createClient> | null = null;

  constructor() {
    this.filePath = path.join(process.cwd(), "data", "class_change_data.json");
    this.data = this.loadData();

    const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://jmjballgaxelqhsvhlvl.supabase.co";
    const sbKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
    if (sbUrl && sbKey) {
      try {
        this.supabaseClient = createClient(sbUrl, sbKey);
      } catch (e) {
        console.warn("ClassChangeEngine could not init Supabase client:", e);
      }
    }
  }

  private loadData(): StoreData {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          requests: Array.isArray(parsed.requests) ? parsed.requests : [],
          notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        };
      }
    } catch (e) {
      console.warn("ClassChangeEngine: Failed to load data, starting fresh:", e);
    }
    const initial: StoreData = { requests: [], notifications: [] };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: StoreData = this.data) {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch (e) {
      console.error("ClassChangeEngine: Failed to save data:", e);
    }
  }

  public getRequests(filters?: { student_id?: string; parent_id?: string; status?: string }): ClassChangeRequest[] {
    let list = [...this.data.requests];
    if (filters?.student_id) {
      list = list.filter((r) => r.student_id === filters.student_id);
    }
    if (filters?.parent_id) {
      list = list.filter((r) => r.parent_id === filters.parent_id || r.initiated_by_user_id === filters.parent_id);
    }
    if (filters?.status && filters.status !== "all") {
      list = list.filter((r) => r.status === filters.status);
    }
    return list.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
  }

  public getRequestById(id: string): ClassChangeRequest | undefined {
    return this.data.requests.find((r) => r.id === id);
  }

  public async createRequest(params: {
    student_id: string;
    student_name?: string;
    student_email?: string;
    current_class_name?: string;
    current_class_id?: string;
    requested_class_name: string;
    requested_class_id?: string;
    reason: string;
    initiated_by_type?: "student" | "parent";
    initiated_by_user_id?: string;
    parent_id?: string;
    parent_name?: string;
    parent_email?: string;
  }): Promise<ClassChangeRequest> {
    const {
      student_id,
      current_class_id,
      requested_class_name,
      requested_class_id,
      reason,
    } = params;

    const initiated_by_type = params.initiated_by_type || "student";
    const initiated_by_user_id = params.initiated_by_user_id || student_id;

    if (!student_id) {
      throw new Error("Student ID is required.");
    }
    if (!requested_class_name || !requested_class_name.trim()) {
      throw new Error("Requested class must be specified.");
    }
    if (!reason || !reason.trim()) {
      throw new Error("Reason for class change is required.");
    }

    // 1. Fetch student directly from Supabase
    let sName = params.student_name || "";
    let sEmail = params.student_email || "";
    let sCurrentClass = params.current_class_name || "";
    let sParentId: string | null = params.parent_id || null;

    if (this.supabaseClient) {
      try {
        const { data: st, error: stErr } = await this.supabaseClient
          .from("students")
          .select("id, firstname, lastname, email, class, parent_id, is_child")
          .eq("id", student_id)
          .maybeSingle();

        if (stErr) {
          console.warn("Supabase student lookup warning:", stErr);
        } else if (st) {
          sName = `${st.firstname || ""} ${st.lastname || ""}`.trim() || sName;
          sEmail = st.email || sEmail;
          sCurrentClass = st.class || sCurrentClass;
          sParentId = st.parent_id || sParentId;
        }
      } catch (e) {
        console.warn("Could not query student details from Supabase:", e);
      }
    }

    // 2. CRITICAL PARENT AUTHORIZATION VERIFICATION
    let pId: string | null = sParentId;
    let pName: string | null = params.parent_name || null;
    let pEmail: string | null = params.parent_email || null;

    if (initiated_by_type === "parent") {
      if (!initiated_by_user_id) {
        throw new Error("Parent authentication ID is required.");
      }

      let isAuthorized = false;

      // Direct parent_id match
      if (sParentId && sParentId === initiated_by_user_id) {
        isAuthorized = true;
      }

      // Check against parents table in Supabase
      if (this.supabaseClient) {
        try {
          const { data: parentRows } = await this.supabaseClient
            .from("parents")
            .select("id, user_id, email, firstname, lastname")
            .or(`id.eq.${initiated_by_user_id},user_id.eq.${initiated_by_user_id}${pEmail ? `,email.eq.${pEmail}` : ""}`);

          if (parentRows && parentRows.length > 0) {
            for (const pr of parentRows) {
              if (sParentId && (sParentId === pr.id || sParentId === pr.user_id)) {
                isAuthorized = true;
                pId = pr.id;
                pName = pName || `${pr.firstname || ""} ${pr.lastname || ""}`.trim();
                pEmail = pEmail || pr.email;
                break;
              }
            }
          }
        } catch (authErr) {
          console.warn("Could not verify parent in database:", authErr);
        }
      }

      if (!isAuthorized) {
        throw new Error(
          "Authorization error: You are not authorized to submit class change requests for this student. The student is not linked to your parent account."
        );
      }
    } else {
      // Student initiated: check if linked to a parent and enrich parent details for notifications
      if (sParentId && this.supabaseClient && (!pName || !pEmail)) {
        try {
          const { data: parentRec } = await this.supabaseClient
            .from("parents")
            .select("id, user_id, email, firstname, lastname")
            .or(`id.eq.${sParentId},user_id.eq.${sParentId}`)
            .maybeSingle();

          if (parentRec) {
            pId = parentRec.id;
            pName = `${parentRec.firstname || ""} ${parentRec.lastname || ""}`.trim() || pName;
            pEmail = parentRec.email || pEmail;
          }
        } catch {
          // Non-fatal
        }
      }
    }

    if (sCurrentClass && sCurrentClass.trim().toLowerCase() === requested_class_name.trim().toLowerCase()) {
      throw new Error(`The student is already assigned to ${sCurrentClass}. Please choose a different class.`);
    }

    // Prevent duplicate pending requests for this student regardless of initiator
    const existingPending = this.data.requests.find(
      (r) => r.student_id === student_id && r.status === "pending"
    );
    if (existingPending) {
      throw new Error(
        initiated_by_type === "parent"
          ? `A class change request for ${sName || "this child"} is already pending admin review. Please wait for the current request to be processed.`
          : `You already have a class change request pending admin review. Please wait for an administrator to review it.`
      );
    }

    const newRequest: ClassChangeRequest = {
      id: "ccr_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8),
      student_id,
      student_name: sName || "Student",
      student_email: sEmail,
      current_class_id: current_class_id || "",
      current_class_name: sCurrentClass || "Current Class",
      requested_class_id: requested_class_id || "",
      requested_class_name: requested_class_name.trim(),
      reason: reason.trim(),
      status: "pending",
      initiated_by_type,
      initiated_by_user_id,
      parent_id: pId,
      parent_name: pName,
      parent_email: pEmail,
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      admin_note: null,
      old_class: sCurrentClass || "Current Class",
      new_class: null,
    };

    this.data.requests.unshift(newRequest);

    // Create admin notification
    const notifTitle = initiated_by_type === "parent"
      ? `Parent Request: Class Change for ${newRequest.student_name}`
      : `Student Request: Class Change for ${newRequest.student_name}`;

    const notifMsg = initiated_by_type === "parent"
      ? `Parent ${pName || "A parent"} requested to move ${newRequest.student_name} from ${newRequest.old_class} to ${newRequest.requested_class_name}.`
      : `${newRequest.student_name} has requested to change from ${newRequest.old_class} to ${newRequest.requested_class_name}.`;

    const notification: AdminNotification = {
      id: "notif_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8),
      type: "class_change_request",
      title: notifTitle,
      message: notifMsg,
      related_request_id: newRequest.id,
      student_id: newRequest.student_id,
      student_name: newRequest.student_name,
      current_class: newRequest.old_class,
      requested_class: newRequest.requested_class_name,
      initiated_by_type,
      parent_name: pName || undefined,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    this.data.notifications.unshift(notification);
    this.saveData();

    return newRequest;
  }

  public async reviewRequest(params: {
    requestId: string;
    admin_id: string;
    admin_name: string;
    admin_email?: string;
    action: "approve" | "reject";
    review_reason?: string;
  }): Promise<ClassChangeRequest> {
    const { requestId, admin_id, admin_name, admin_email, action, review_reason } = params;

    const request = this.data.requests.find((r) => r.id === requestId);
    if (!request) {
      throw new Error("Class change request not found.");
    }
    if (request.status !== "pending") {
      throw new Error(`This request has already been ${request.status}.`);
    }

    const reviewerTag = admin_name ? `${admin_name} (${admin_email || admin_id})` : (admin_email || admin_id);
    const nowIso = new Date().toISOString();

    // Check student existence and detect any class drift in DB
    if (this.supabaseClient) {
      try {
        const { data: curSt } = await this.supabaseClient
          .from("students")
          .select("id, firstname, lastname, class")
          .eq("id", request.student_id)
          .maybeSingle();

        if (!curSt) {
          throw new Error("Student record no longer exists in the database.");
        }

        if (curSt.class && curSt.class !== request.old_class) {
          console.warn(`Admin notice: Student's current class in DB is '${curSt.class}', updating recorded previous class from '${request.old_class}'.`);
          request.old_class = curSt.class;
        }
      } catch (err: any) {
        if (err.message && err.message.includes("no longer exists")) {
          throw err;
        }
      }
    }

    if (action === "approve") {
      // 1. Atomically update the student's class in the database
      if (this.supabaseClient) {
        const { error: dbError } = await this.supabaseClient
          .from("students")
          .update({
            class: request.requested_class_name,
            updated_at: nowIso,
          })
          .eq("id", request.student_id);

        if (dbError) {
          console.error("Failed to update student class in Supabase:", dbError);
          throw new Error(`Failed to update student's class record: ${dbError.message}`);
        }
      }

      // 2. Mark request approved
      request.status = "approved";
      request.reviewed_at = nowIso;
      request.reviewed_by = reviewerTag;
      request.admin_note = review_reason?.trim() || "Approved by administrator";
      request.new_class = request.requested_class_name;

      this.saveData();

      // 3. Send approval email to Student and Parent (if linked)
      try {
        await emailService.sendClassChangeApprovedEmail({
          studentId: request.student_id,
          studentName: request.student_name,
          studentEmail: request.student_email,
          previousClass: request.old_class,
          newClass: request.requested_class_name,
          adminNote: request.admin_note || undefined,
          initiatedByType: request.initiated_by_type,
          parentId: request.parent_id || undefined,
          parentName: request.parent_name || undefined,
          parentEmail: request.parent_email || undefined,
        });
      } catch (err: any) {
        console.warn("Non-fatal email delivery failure:", err?.message);
      }

      return request;
    } else if (action === "reject") {
      // Keep student's class unchanged, record rejection
      request.status = "rejected";
      request.reviewed_at = nowIso;
      request.reviewed_by = reviewerTag;
      request.admin_note = review_reason?.trim() || "Request not approved at this time";
      request.new_class = null;

      this.saveData();

      // Send rejection email to Student and Parent (if linked)
      try {
        await emailService.sendClassChangeRejectedEmail({
          studentId: request.student_id,
          studentName: request.student_name,
          studentEmail: request.student_email,
          requestedClass: request.requested_class_name,
          adminReason: request.admin_note || undefined,
          initiatedByType: request.initiated_by_type,
          parentId: request.parent_id || undefined,
          parentName: request.parent_name || undefined,
          parentEmail: request.parent_email || undefined,
        });
      } catch (err: any) {
        console.warn("Non-fatal email delivery failure:", err?.message);
      }

      return request;
    } else {
      throw new Error(`Invalid action: ${action}`);
    }
  }

  public getAdminNotifications(): AdminNotification[] {
    return [...this.data.notifications];
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.is_read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(): void {
    this.data.notifications.forEach((n) => (n.is_read = true));
    this.saveData();
  }
}

export const classChangeEngine = new ClassChangeEngine();
