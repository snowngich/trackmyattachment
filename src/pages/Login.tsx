import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getRoleDashboardPath, AppRole } from "@/lib/supabase";
import { getUserFriendlyError } from "@/lib/error-utils";
import { loginSchema } from "@/lib/validation";
import { getRoleLabel } from "@/lib/role-labels";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, GraduationCap, Users, BookOpen, Shield, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const roleOptions: { role: AppRole; icon: React.ReactNode; description: string }[] = [
  { role: "student", icon: <GraduationCap className="w-8 h-8" />, description: "Log your daily activities & track progress" },
  { role: "supervisor", icon: <Users className="w-8 h-8" />, description: "Review student logs & provide remarks" },
  { role: "coordinator", icon: <BookOpen className="w-8 h-8" />, description: "Oversee placements & assess students" },
  { role: "admin", icon: <Shield className="w-8 h-8" />, description: "Manage users, organizations & system" },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingRedirectRole, setPendingRedirectRole] = useState<AppRole | null>(null);
  const { signIn, roles: userRoles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Wait for roles to load after sign-in, then redirect
  useEffect(() => {
    if (pendingRedirectRole && userRoles.length > 0) {
      navigate(getRoleDashboardPath(pendingRedirectRole));
      setPendingRedirectRole(null);
    }
  }, [pendingRedirectRole, userRoles, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Validation error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Login failed",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: "Welcome back!",
      description: "Successfully signed in.",
    });

    // Set pending redirect — useEffect will navigate once roles are loaded
    setPendingRedirectRole(selectedRole || "student");
  };

  return (
    <AuthLayout
      title={selectedRole ? `Sign in as ${getRoleLabel(selectedRole)}` : "Welcome back"}
      description={selectedRole ? "Enter your credentials to continue" : "Select your role to get started"}
    >
      <AnimatePresence mode="wait">
        {!selectedRole ? (
          <motion.div
            key="role-picker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-3"
          >
            {roleOptions.map((option) => (
              <button
                key={option.role}
                onClick={() => setSelectedRole(option.role)}
                className={cn(
                  "flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-border",
                  "hover:border-primary hover:bg-primary/5 transition-all duration-200",
                  "text-center group cursor-pointer"
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {option.icon}
                </div>
                <span className="font-semibold text-sm">{getRoleLabel(option.role)}</span>
                <span className="text-xs text-muted-foreground leading-tight">{option.description}</span>
              </button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="login-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRole(null)}
              className="mb-4 -ml-2 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Change role
            </Button>

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
          </motion.div>
        )}
      </AnimatePresence>

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
