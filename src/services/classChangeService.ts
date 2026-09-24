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
  reviewed_by: string | null;
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

// Runtime constants so value-level imports never fail in browser / Vite dev mode
export const ClassChangeRequest = {} as const;
export const AdminNotification = {} as const;

export const classChangeService = {
  async getStudentRequests(studentId: string): Promise<ClassChangeRequest[]> {
    if (!studentId) return [];
    try {
      const res = await fetch(`/api/class-change-requests?student_id=${encodeURIComponent(studentId)}`);
      if (!res.ok) throw new Error("Failed to load class change requests");
      return await res.json();
    } catch (e) {
      console.warn("Error fetching student requests:", e);
      return [];
    }
  },

  async getParentRequests(parentId: string): Promise<ClassChangeRequest[]> {
    if (!parentId) return [];
    try {
      const res = await fetch(`/api/class-change-requests?parent_id=${encodeURIComponent(parentId)}`);
      if (!res.ok) throw new Error("Failed to load parent class change requests");
      return await res.json();
    } catch (e) {
      console.warn("Error fetching parent requests:", e);
      return [];
    }
  },

  async getAllRequests(status?: string): Promise<ClassChangeRequest[]> {
    try {
      const url = status && status !== "all" 
        ? `/api/class-change-requests?status=${encodeURIComponent(status)}`
        : `/api/class-change-requests`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load requests");
      return await res.json();
    } catch (e) {
      console.warn("Error fetching all requests:", e);
      return [];
    }
  },

  async submitRequest(params: {
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
    const res = await fetch("/api/class-change-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to submit class change request");
    }
    return data;
  },

  async reviewRequest(params: {
    requestId: string;
    admin_id: string;
    admin_name: string;
    admin_email?: string;
    action: "approve" | "reject";
    review_reason?: string;
  }): Promise<ClassChangeRequest> {
    const res = await fetch(`/api/class-change-requests/${params.requestId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to review request");
    }
    return data;
  },

  async getAdminNotifications(): Promise<AdminNotification[]> {
    try {
      const res = await fetch("/api/admin-notifications");
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  },

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin-notifications/${id}/read`, { method: "POST" });
      return res.ok;
    } catch {
      return false;
    }
  },

  async markAllNotificationsRead(): Promise<boolean> {
    try {
      const res = await fetch(`/api/admin-notifications/read-all`, { method: "POST" });
      return res.ok;
    } catch {
      return false;
    }
  },
};
