 import { supabase } from "@/integrations/supabase/client";
 
 export type AppRole = "student" | "supervisor" | "coordinator" | "admin";
 
 export interface UserProfile {
   id: string;
   user_id: string;
   full_name: string;
   phone: string | null;
   organization_id: string | null;
   department_id: string | null;
   created_at: string;
   updated_at: string;
 }
 
 export interface UserRole {
   id: string;
   user_id: string;
   role: AppRole;
   created_at: string;
 }
 
 export async function getCurrentUserRoles(): Promise<AppRole[]> {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return [];
 
   const { data, error } = await supabase
     .from("user_roles")
     .select("role")
     .eq("user_id", user.id);
 
   if (error || !data) return [];
   return data.map((r) => r.role as AppRole);
 }
 
 export async function getCurrentUserProfile(): Promise<UserProfile | null> {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return null;
 
   const { data, error } = await supabase
     .from("profiles")
     .select("*")
     .eq("user_id", user.id)
     .maybeSingle();
 
   if (error || !data) return null;
   return data as UserProfile;
 }
 
 export function getPrimaryRole(roles: AppRole[]): AppRole {
   const priority: AppRole[] = ["admin", "coordinator", "supervisor", "student"];
   for (const role of priority) {
     if (roles.includes(role)) return role;
   }
   return "student";
 }
 
 export function getRoleDashboardPath(role: AppRole): string {
   switch (role) {
     case "admin":
       return "/admin";
     case "coordinator":
       return "/coordinator";
     case "supervisor":
       return "/supervisor";
     case "student":
     default:
       return "/student";
   }
 }