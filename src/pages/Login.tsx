 import { useState } from "react";
 import { useNavigate, Link } from "react-router-dom";
 import { useAuth } from "@/contexts/AuthContext";
 import { getRoleDashboardPath } from "@/lib/supabase";
 import AuthLayout from "@/components/auth/AuthLayout";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { useToast } from "@/hooks/use-toast";
 import { Loader2, Mail, Lock } from "lucide-react";
 
 const Login = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const { signIn, primaryRole } = useAuth();
   const navigate = useNavigate();
   const { toast } = useToast();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
 
     const { error } = await signIn(email, password);
 
     if (error) {
       toast({
         title: "Login failed",
         description: error.message,
         variant: "destructive",
       });
       setIsLoading(false);
       return;
     }
 
     toast({
       title: "Welcome back!",
       description: "Successfully signed in.",
     });
 
     // Small delay to allow auth state to update
     setTimeout(() => {
       navigate(getRoleDashboardPath(primaryRole));
     }, 100);
   };
 
   return (
     <AuthLayout
       title="Welcome back"
       description="Sign in to your account to continue"
     >
       <form onSubmit={handleSubmit} className="space-y-4">
         <div className="space-y-2">
           <Label htmlFor="email">Email</Label>
           <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
             <Input
               id="email"
               type="email"
               placeholder="you@university.edu"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="pl-10"
               required
             />
           </div>
         </div>
 
         <div className="space-y-2">
           <Label htmlFor="password">Password</Label>
           <div className="relative">
             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
             <Input
               id="password"
               type="password"
               placeholder="••••••••"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="pl-10"
               required
             />
           </div>
         </div>
 
         <Button
           type="submit"
           className="w-full bg-gradient-primary hover:opacity-90 font-semibold h-11"
           disabled={isLoading}
         >
           {isLoading ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               Signing in...
             </>
           ) : (
             "Sign In"
           )}
         </Button>
       </form>
 
       <p className="text-center text-sm text-muted-foreground mt-6">
         Don't have an account?{" "}
         <Link to="/signup" className="text-primary hover:underline font-medium">
           Create one
         </Link>
       </p>
     </AuthLayout>
   );
 };
 
 export default Login;