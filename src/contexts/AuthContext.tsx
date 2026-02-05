 import React, { createContext, useContext, useEffect, useState } from "react";
 import { User, Session } from "@supabase/supabase-js";
 import { supabase } from "@/integrations/supabase/client";
 import { AppRole, UserProfile, getCurrentUserRoles, getCurrentUserProfile, getPrimaryRole } from "@/lib/supabase";
 
 interface AuthContextType {
   user: User | null;
   session: Session | null;
   profile: UserProfile | null;
   roles: AppRole[];
   primaryRole: AppRole;
   isLoading: boolean;
   signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
   signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
   signOut: () => Promise<void>;
   refreshProfile: () => Promise<void>;
 }
 
 const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
 export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [session, setSession] = useState<Session | null>(null);
   const [profile, setProfile] = useState<UserProfile | null>(null);
   const [roles, setRoles] = useState<AppRole[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   const refreshProfile = async () => {
     const [userProfile, userRoles] = await Promise.all([
       getCurrentUserProfile(),
       getCurrentUserRoles(),
     ]);
     setProfile(userProfile);
     setRoles(userRoles);
   };
 
   useEffect(() => {
     // Set up auth state listener first
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         setSession(session);
         setUser(session?.user ?? null);
 
         if (session?.user) {
           // Use setTimeout to avoid potential Supabase deadlock
           setTimeout(async () => {
             await refreshProfile();
             setIsLoading(false);
           }, 0);
         } else {
           setProfile(null);
           setRoles([]);
           setIsLoading(false);
         }
       }
     );
 
     // Then check initial session
     supabase.auth.getSession().then(({ data: { session } }) => {
       setSession(session);
       setUser(session?.user ?? null);
       if (session?.user) {
         refreshProfile().then(() => setIsLoading(false));
       } else {
         setIsLoading(false);
       }
     });
 
     return () => subscription.unsubscribe();
   }, []);
 
   const signIn = async (email: string, password: string) => {
     const { error } = await supabase.auth.signInWithPassword({ email, password });
     return { error: error as Error | null };
   };
 
   const signUp = async (email: string, password: string, fullName: string) => {
     const { error } = await supabase.auth.signUp({
       email,
       password,
       options: {
         data: { full_name: fullName },
         emailRedirectTo: window.location.origin,
       },
     });
     return { error: error as Error | null };
   };
 
   const signOut = async () => {
     await supabase.auth.signOut();
   };
 
   const primaryRole = getPrimaryRole(roles);
 
   return (
     <AuthContext.Provider
       value={{
         user,
         session,
         profile,
         roles,
         primaryRole,
         isLoading,
         signIn,
         signUp,
         signOut,
         refreshProfile,
       }}
     >
       {children}
     </AuthContext.Provider>
   );
 }
 
 export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
     throw new Error("useAuth must be used within an AuthProvider");
   }
   return context;
 }