 import { useState } from "react";
 import { Link } from "react-router-dom";
 import { useAuth } from "@/contexts/AuthContext";
 import AuthLayout from "@/components/auth/AuthLayout";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { useToast } from "@/hooks/use-toast";
 import { Loader2, Mail, Lock, User } from "lucide-react";
 
 const Signup = () => {
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [fullName, setFullName] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [isSuccess, setIsSuccess] = useState(false);
   const { signUp } = useAuth();
   const { toast } = useToast();
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
 
     const { error } = await signUp(email, password, fullName);
 
     if (error) {
       toast({
         title: "Signup failed",
         description: error.message,
         variant: "destructive",
       });
       setIsLoading(false);
       return;
     }
 
     setIsSuccess(true);
     toast({
       title: "Account created!",
       description: "Please check your email to verify your account.",
     });
     setIsLoading(false);
   };
 
   if (isSuccess) {
     return (
       <AuthLayout
         title="Check your email"
         description="We've sent you a verification link"
       >
         <div className="text-center space-y-4">
           <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
             <Mail className="w-8 h-8 text-success" />
           </div>
           <p className="text-muted-foreground">
             Click the link in your email to verify your account and get started.
           </p>
           <Link to="/login">
             <Button variant="outline" className="mt-4">
               Back to Sign In
             </Button>
           </Link>
         </div>
       </AuthLayout>
     );
   }
 
   return (
     <AuthLayout
       title="Create your account"
       description="Start tracking your industrial attachment"
     >
       <form onSubmit={handleSubmit} className="space-y-4">
         <div className="space-y-2">
           <Label htmlFor="fullName">Full Name</Label>
           <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
             <Input
               id="fullName"
               type="text"
               placeholder="John Doe"
               value={fullName}
               onChange={(e) => setFullName(e.target.value)}
               className="pl-10"
               required
             />
           </div>
         </div>
 
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
               minLength={6}
               required
             />
           </div>
           <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
         </div>
 
         <Button
           type="submit"
           className="w-full bg-gradient-primary hover:opacity-90 font-semibold h-11"
           disabled={isLoading}
         >
           {isLoading ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               Creating account...
             </>
           ) : (
             "Create Account"
           )}
         </Button>
       </form>
 
       <p className="text-center text-sm text-muted-foreground mt-6">
         Already have an account?{" "}
         <Link to="/login" className="text-primary hover:underline font-medium">
           Sign in
         </Link>
       </p>
     </AuthLayout>
   );
 };
 
 export default Signup;