import { AppRole } from "@/lib/supabase";

// Maps database role names to user-friendly display labels
export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  coordinator: "Lecturer",
  supervisor: "Supervisor",
  student: "Student",
};

export const getRoleLabel = (role: AppRole): string => {
  return roleLabels[role] || role;
};
